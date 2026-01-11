const CLOUD_RUN_URL = "https://banana-on-notion-api-346214367756.us-central1.run.app/";
const BANANA_TOKEN = "banana-2026-very-secret";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "BANANA_GENERATE",
    title: "テキスト→図解を生成（クリップボードへ）",
    contexts: ["selection"],
    documentUrlPatterns: ["https://www.notion.so/*"]
  });
});

async function callApi(text) {
  const resp = await fetch(CLOUD_RUN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Banana-Token": BANANA_TOKEN
    },
    body: JSON.stringify({ text })
  });

  const bodyText = await resp.text().catch(() => "");
  if (!resp.ok) throw new Error(`API ${resp.status}: ${bodyText}`);

  const data = JSON.parse(bodyText);
  if (!data?.imageUrl) throw new Error("No imageUrl returned");
  return data.imageUrl;
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    const selectionText = (info.selectionText || "").trim();
    if (!selectionText) return;

    chrome.tabs.sendMessage(tab.id, { type: "BANANA_TOAST", status: "loading" });

    const imageUrl = await callApi(selectionText);

    chrome.tabs.sendMessage(tab.id, {
      type: "BANANA_COPY_MARKDOWN",
      url: imageUrl
    });
  } catch (e) {
    console.error(e);
    chrome.tabs.sendMessage(tab.id, {
      type: "BANANA_TOAST",
      status: "error",
      message: String(e)
    });
  }
});