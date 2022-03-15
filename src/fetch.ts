export async function fetchText(url: string | URL) {
  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error("Text response is not OK");
  }
  const text = await response.text();
  if (!text.trim()) {
    throw new Error(`Text is empty`);
  }
  return text;
}
