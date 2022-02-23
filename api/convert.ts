#!/usr/bin/env deno run --no-check

import { ServerRequest } from "https://deno.land/std@0.105.0/http/server.ts";
import { fetchText } from "./fetch.ts";
import { makeSVG } from "./makeSVG.tsx";

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

  // ETagを取得する
  const prevETag = req.headers.get("If-None-Match");

  try {
    const text = await fetchText(svgURL);
    // ETagを作る
    const hash = await sha256(text);
    const eTag = `W/"${hash}"`;
    if (eTag === prevETag) {
      req.respond({ status: 304 });
      return;
    }
    const svg = makeSVG(text);

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

// from https://qiita.com/economist/items/768d2f6a10d54d4fa39f
//https://developer.mozilla.org/ja/docs/Web/API/SubtleCrypto/digest#%E3%83%80%E3%82%A4%E3%82%B8%E3%82%A7%E3%82%B9%E3%83%88%E5%80%A4%E3%82%9216%E9%80%B2%E6%96%87%E5%AD%97%E5%88%97%E3%81%AB%E5%A4%89%E6%8F%9B%E3%81%99%E3%82%8B
async function sha256(text: string) {
  const uint8 = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", uint8);
  return Array.from(new Uint8Array(digest)).map((v) =>
    v.toString(16).padStart(2, "0")
  ).join("");
}
