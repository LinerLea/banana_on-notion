chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg?.type !== "CLIPBOARD_WRITE_PNG_BASE64") return;

  try {
    const b64 = msg.pngBase64; // base64 only (no "data:image/png;base64,")
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "image/png" });

    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob })
    ]);

    chrome.runtime.sendMessage({ type: "CLIPBOARD_OK" });
  } catch (e) {
    chrome.runtime.sendMessage({ type: "CLIPBOARD_NG", error: String(e) });
  }
});