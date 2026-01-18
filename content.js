function showToast(text, kind = "success") {
  const id = "banana-toast";
  let el = document.getElementById(id);

  if (!el) {
    el = document.createElement("div");
    el.id = id;
    el.style.position = "fixed";
    el.style.top = "16px";
    el.style.right = "16px";
    el.style.zIndex = "999999";
    el.style.padding = "10px 14px";
    el.style.borderRadius = "10px";
    el.style.color = "#fff";
    el.style.fontSize = "13px";
    el.style.maxWidth = "520px";
    el.style.whiteSpace = "pre-wrap";
    el.style.wordBreak = "break-word";
    el.style.boxShadow = "0 6px 20px rgba(0,0,0,.25)";
    document.documentElement.appendChild(el);
  }

  el.style.background =
    kind === "error" ? "#ef4444" :
    kind === "loading" ? "#3b82f6" :
    "#22c55e";

  el.textContent = text;
  el.style.opacity = "1";

  clearTimeout(el._t);
  el._t = setTimeout(() => (el.style.opacity = "0"), 5200);
}

async function writePngBase64ToClipboard(pngBase64) {
  const bytes = Uint8Array.from(atob(pngBase64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: "image/png" });

  await navigator.clipboard.write([
    new ClipboardItem({ "image/png": blob })
  ]);
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "BANANA_TOAST") {
    if (msg.status === "loading") showToast(msg.message || "Working...", "loading");
    else if (msg.status === "success") showToast(msg.message || "Done", "success");
    else if (msg.status === "error") showToast(msg.message || "Error", "error");
    return;
  }

  if (msg?.type === "BANANA_CLIPBOARD_WRITE") {
    (async () => {
      try {
        showToast("画像をクリップボードへコピー中…", "loading");
        await writePngBase64ToClipboard(msg.pngBase64);
        showToast("コピーしました。Notionで貼りたい位置をクリックしてCmd+Vしてください。", "success");
        sendResponse({ ok: true });
      } catch (e) {
        showToast(
          "クリップボード書き込みに失敗しました。\nNotion画面を一度クリックしてフォーカスを当ててから、もう一度実行してください。",
          "error"
        );
        sendResponse({ ok: false, error: String(e) });
      }
    })();
    return true;
  }
});