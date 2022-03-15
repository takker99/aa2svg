/** @jsx h  */
import { h } from "https://esm.sh/preact@10.6.6";
import { renderToString } from "https://esm.sh/preact-render-to-string";
import { createCanvas } from "https://deno.land/x/canvas@v1.4.1/mod.ts";
import { fontURL } from "./font.ts";
import type { AAData } from "./parseParams.ts";

export function makeSVG(
  aa: string,
  init: Pick<AAData, "width" | "crop">,
) {
  const fontSize = 16;
  const { maxWidth, maxHeight, texts } = makeTexts(aa, { fontSize, ...init });
  return renderToString(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${maxWidth} ${maxHeight}`}
      width={maxWidth}
      height={maxHeight}
    >
      <style>
        {`@font-face {
  font-family: "aahub_light";
  src: url("${fontURL}") format("woff2");
  font-display: swap;
}

@media (prefers-color-scheme: dark) {
  svg {
    background-color: white;
  }
}`}
      </style>
      <g style={{ fontFamily: "aahub_light", fontSize }}>{texts}</g>
    </svg>,
  );
}

function makeTexts(
  text: string,
  { width, crop, fontSize }: Pick<AAData, "width" | "crop"> & {
    fontSize: number;
  },
) {
  const data = text.split(/\\n|\r\n|\r|\n/);
  let maxWidth = width ?? 0;
  const maxHeight = fontSize * data.length;
  const texts = data.map((line, i) => {
    if (width === undefined) {
      const width_ = getTextWidth(line, `${fontSize}px "aahub_light"`);
      // console.log(width);
      maxWidth = Math.max(maxWidth, width_ * crop);
    }
    return (
      <text x="0" y={fontSize * (i + 1) + 2}>
        {line}
      </text>
    );
  });

  return { texts, maxWidth, maxHeight };
}

function getTextWidth(text: string, font: `${number}px "aahub_light"`) {
  const canvas = createCanvas(10000, 200);
  const ctx = canvas.getContext("2d");
  ctx.font = font;
  return ctx.measureText(text).width;
}
