#!/usr/bin/env deno run --config ../deno.json

import { ServerRequest } from "https://deno.land/std@0.105.0/http/server.ts";
import { fetchText } from "../src/fetch.ts";
import { makeSVG } from "../src/makeSVG.tsx";
import { createHash } from "https://deno.land/std@0.129.0/hash/mod.ts";

export default async (req: ServerRequest) => {
  const base = `${req.headers.get("x-forwarded-proto")}://${
    req.headers.get(
      "x-forwarded-host",
    )
  }`;
  const url = new URL(req.url, base);

  // plantUMLのURLを取得する
  const params = url.searchParams;
  const svgURL = params.get("url");
  if (!svgURL) {
    req.respond({ status: 400, body: "No svg URL found." });
    return;
  }
  const imageType = params.get("type");
  if (!imageType) {
    req.respond({ status: 400, body: "No image type is specified." });
    return;
  }
  if (imageType !== "svg") {
    req.respond({ status: 400, body: "Image type must be 'svg'." });
    return;
  }
  const cropNum = parseFloat(params.get("crop") ?? "1");
  const crop = isNaN(cropNum) ? 1 : Math.min(1, Math.abs(cropNum));
  console.log({ svgURL, imageType, crop, cropText: params.get("crop") });

  // ETagを取得する
  const prevETag = req.headers.get("If-None-Match");

  try {
    const text = await fetchText(svgURL);
    // ETagを作る
    const hash = createHash("md5").update(`${text}${crop}`).toString();
    const eTag = `W/"${hash}"`;
    if (eTag === prevETag) {
      req.respond({ status: 304 });
      return;
    }
    const svg = makeSVG(text, { crop });

    const headers = new Headers();
    headers.set("Content-Type", "image/svg+xml; charaset=utf-8");
    headers.set("Content-Type", "image/svg+xml; charaset=utf-8");
    headers.set("ETag", eTag);
    headers.set("Cache-Control", "no-cache, max-age=0");
    req.respond({
      headers,
      body: svg,
    });
  } catch (e) {
    req.respond({ status: 400, body: e.message });
  }
};
