chrome.runtime.onMessage.addListener(async (msg, _sender, sendResponse) => {
  if (msg?.type !== "WRITE_IMAGE_TO_CLIPBOARD") return;

  try {
    const bytes = new Uint8Array(msg.data);
    const blob = new Blob([bytes], { type: msg.mime || "image/png" });

    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob })
    ]);

    sendResponse({ ok: true });
  } catch (e) {
    console.error(e);
    sendResponse({ ok: false, error: String(e) });
  }
  return true;
});
