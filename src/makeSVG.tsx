/** @jsx h  */
import { h } from "https://esm.sh/preact@10.6.6";
import { renderToString } from "https://esm.sh/preact-render-to-string";
import { createCanvas } from "https://deno.land/x/canvas@v1.4.1/mod.ts";
import { fontURL } from "./font.ts";

export interface MakeSVGOptions {
  crop?: number;
}
export function makeSVG(aa: string, options?: MakeSVGOptions) {
  const fontSize = 16;
  const crop = options?.crop ?? 1;
  const { maxWidth, maxHeight, texts } = makeTexts(aa, fontSize);
  return renderToString(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${maxWidth * crop} ${maxHeight}`}
      width={maxWidth * crop}
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

function makeTexts(text: string, fontSize = 16) {
  const data = text.split(/\\n|\r\n|\r|\n/);
  let maxWidth = 0;
  const maxHeight = fontSize * data.length;
  const texts = data.map((line, i) => {
    const width = getTextWidth(line, `${fontSize}px "aahub_light"`);
    // console.log(width);
    maxWidth = Math.max(maxWidth, width);
    return (
      <text x="0" y={fontSize * (i + 1) + 2}>
        {line}
      </text>
    );
  });
  // 何故か必要な幅より多めになってしまうため、少し小さくした
  //  1/2は小さすぎた
  // もしかしたらはみ出てしまうケースもあるかも
  //  kita.mltがはみ出した
  //  仕方ない。止めておこう
  return { texts, maxWidth, maxHeight };
}

function getTextWidth(text: string, font: `${number}px "aahub_light"`) {
  const canvas = createCanvas(10000, 200);
  const ctx = canvas.getContext("2d");
  ctx.font = font;
  const metrics = ctx.measureText(text);
  return ctx.measureText(text).width;
}
