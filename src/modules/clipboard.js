export async function copyToClipboard(text) {
  if (typeof text !== "string") {
    throw new TypeError("Clipboard content must be a string.");
  }

  if (!navigator.clipboard) {
    throw new Error("Clipboard API is not available.");
  }

  await navigator.clipboard.writeText(text);
}
