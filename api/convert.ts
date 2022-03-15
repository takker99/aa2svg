#!/usr/bin/env deno run --config ../deno.json

import { ServerRequest } from "https://deno.land/std@0.105.0/http/server.ts";
import { fetchText } from "../src/fetch.ts";
import { parseParams } from "../src/parseParams.ts";
import { makeSVG } from "../src/makeSVG.tsx";
import { createHash } from "https://deno.land/std@0.129.0/hash/mod.ts";

export default async (req: ServerRequest) => {
  const base = `${req.headers.get("x-forwarded-proto")}://${
    req.headers.get(
      "x-forwarded-host",
    )
  }`;
  const url = new URL(req.url, base);

  // URL paramertesの解析
  const data = parseParams(url.searchParams);
  if (!data.ok) {
    req.respond(data.res);
    return;
  }
  console.log(data);

  // ETagを取得する
  const prevETag = req.headers.get("If-None-Match");

  try {
    const text = await fetchText(data.data.url);
    // ETagを作る
    const hash = createHash("md5").update(
      `${text}${data.data.width ?? data.data.crop}`,
    ).toString();
    const eTag = `W/"${hash}"`;
    if (eTag === prevETag) {
      req.respond({ status: 304 });
      return;
    }
    const svg = makeSVG(text, data.data);

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
