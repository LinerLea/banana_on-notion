console.log("banana content script loaded", location.href);

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
    el.style.maxWidth = "420px";
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

async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  ta.remove();
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "BANANA_TOAST") {
    if (msg.status === "loading") showToast("図解を生成中…", "loading");
    if (msg.status === "error") showToast(`失敗: ${msg.message || "unknown"}`, "error");
    return;
  }

  if (msg?.type === "BANANA_COPY_MARKDOWN") {
    (async () => {
      try {
        // ✅ URL単体がNotionで一番安定して画像化される
        await copyToClipboard(msg.url);

        showToast(
          "✅ 画像URLをコピーしました。\nNotion本文をクリックしてカーソルを出し、Cmd+V（Ctrl+V）してください。\n（貼った後に「Embed image」を選べます）",
          "success"
        );
      } catch (e) {
        console.error(e);
        showToast("コピーに失敗しました（権限/ブラウザ制限）。", "error");
      }
    })();
  }
});