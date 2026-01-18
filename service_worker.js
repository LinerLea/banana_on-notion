const MODEL = "gemini-3-pro-image-preview";

chrome.runtime.onInstalled.addListener(() => {
  // 既に同名があると作れないので、更新時は一度消して作り直す
  try { chrome.contextMenus.removeAll(); } catch (_) {}

  chrome.contextMenus.create({
    id: "BANANA_GENERATE",
    title: "テキスト→図解を生成（クリップボードへ）",
    contexts: ["selection"],
    documentUrlPatterns: [
      "https://www.notion.so/*",
      "https://*.notion.so/*",
      "https://www.notion.site/*",
      "https://*.notion.site/*"
    ]
  });
});

function sendToast(tabId, status, message) {
  if (!tabId) return;
  chrome.tabs.sendMessage(tabId, { type: "BANANA_TOAST", status, message }).catch(() => {});
}

function buildPrompt(selectedText) {
  return `
あなたはプロの図解デザイナーです。
次の文章を理解し、1枚の「図解（インフォグラフィック）」画像を生成してください。

要件:
- 16:9 横長
- 背景は白
- 日本語の見出し/ラベル（短く読みやすく）
- 箱（カード）・矢印・番号付きステップなどで構造化
- 文章をそのまま並べず、要点を整理して図解化
- 余白を十分に取り、文字が小さくなりすぎない

元テキスト:
"""
${selectedText}
"""
`.trim();
}

async function geminiGeneratePngBase64(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        imageConfig: { aspectRatio: "16:9", imageSize: "2K" }
      }
    })
  });

  if (!resp.ok) {
    const t = await resp.text().catch(() => "");
    throw new Error(`Gemini ${resp.status}: ${t}`);
  }

  const data = await resp.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find((p) => p?.inlineData?.data);
  const b64 = imgPart?.inlineData?.data;
  if (!b64) throw new Error("No image inlineData in response");
  return b64;
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const tabId = tab?.id;

  try {
    const selectionText = (info.selectionText || "").trim();
    if (!selectionText) return;

    // ★ここがsync（同期ストレージ）
    const { GEMINI_API_KEY } = await chrome.storage.sync.get(["GEMINI_API_KEY"]);

    if (!GEMINI_API_KEY) {
      sendToast(tabId, "error", "GEMINI_API_KEYが未設定です。拡張のOptionsで入力してください。");
      return;
    }

    sendToast(tabId, "loading", "図解を生成中…");

    const prompt = buildPrompt(selectionText);
    const pngB64 = await geminiGeneratePngBase64(GEMINI_API_KEY, prompt);

    // Notionページ(content.js)へ「画像をクリップボードに書け」と依頼
    await chrome.tabs.sendMessage(tabId, {
      type: "BANANA_CLIPBOARD_WRITE",
      pngBase64: pngB64
    });

    sendToast(tabId, "success", "画像をクリップボードにコピーしました。Notionで貼りたい位置をクリックしてCmd+Vしてください。");
  } catch (e) {
    console.error(e);
    sendToast(tabId, "error", String(e));
  }
});