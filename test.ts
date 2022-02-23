import { makeSVG } from "./api/makeSVG.tsx";

const path = Deno.args[0];
const res = await fetch(new URL(path, import.meta.url).toString());
const aa = await res.text();
console.log(makeSVG(aa));
