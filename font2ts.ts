import { encode } from "https://deno.land/std@0.126.0/encoding/base64.ts";

const buffer = await Deno.readFile(
  new URL("./aahub_light.woff2", import.meta.url),
);
const fontURL = `data:application/font-woff2;charset=utf-8;base64,${
  encode(buffer)
}`;

await Deno.writeTextFile(
  new URL("./src/font.ts", import.meta.url),
  `// deno-lint-ignore-file\n// deno-fmt-ignore-file\nexport const fontURL = new URL("${fontURL}")`,
);
