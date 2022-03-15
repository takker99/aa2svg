import type { Response } from "https://deno.land/std@0.105.0/http/server.ts";

export interface AAData {
  /** AAのURL */
  url: URL;
  /** 返却する画像の形式 */
  type: "svg";
  /** 画像の横幅の何割を残すか
   *
   * 左側が起点。自動で横幅を決めるとどうしても余白が生まれてしまうので、それを解消するために作った補正option
   */
  crop: number;
  /** 画像の横幅を手動で決めるときに使う
   *
   * cropよりwidthを優先する
   */
  width?: number;
}

/** URL parametersを解析する */
export const parseParams = (
  params: URLSearchParams,
): { ok: true; data: AAData } | { ok: false; res: Response } => {
  const aaURL = params.get("url");
  if (!aaURL) {
    return {
      ok: false,
      res: { status: 400, body: "No ascii art URL found." },
    };
  }
  const imageType = params.get("type");
  if (!imageType) {
    return {
      ok: false,
      res: { status: 400, body: "No image type is specified." },
    };
  }
  if (imageType !== "svg") {
    return {
      ok: false,
      res: { status: 400, body: "Image type must be 'svg'." },
    };
  }
  const widthText = params.get("width");
  const widthNum = widthText !== null ? parseFloat(widthText) : undefined;
  const width = widthNum !== undefined && isNaN(widthNum)
    ? undefined
    : widthNum;

  const cropNum = parseFloat(params.get("crop") ?? "1");
  const crop = isNaN(cropNum) ? 1 : Math.min(1, Math.abs(cropNum));
  try {
    const url = new URL(aaURL);
    return {
      ok: true,
      data: {
        url,
        type: imageType,
        crop,
        ...(width !== undefined ? { width } : {}),
      },
    };
  } catch (e: unknown) {
    if (!(e instanceof TypeError)) throw e;
    return {
      ok: false,
      res: { status: 400, body: "Invalid ascii art URL." },
    };
  }
};
