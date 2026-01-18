const input = document.getElementById("apiKey");
const statusEl = document.getElementById("status");
const saveBtn = document.getElementById("save");
const clearBtn = document.getElementById("clear");

function setStatus(text) {
  statusEl.textContent = text;
  clearTimeout(statusEl._t);
  statusEl._t = setTimeout(() => (statusEl.textContent = ""), 4000);
}

// 読み込み（sync）
chrome.storage.sync.get(["GEMINI_API_KEY"], (result) => {
  if (result.GEMINI_API_KEY) input.value = result.GEMINI_API_KEY;
});

// 保存（sync）
saveBtn.addEventListener("click", () => {
  const apiKey = input.value.trim();
  if (!apiKey) return setStatus("API Key is empty.");

  chrome.storage.sync.set({ GEMINI_API_KEY: apiKey }, () => {
    setStatus("Saved to chrome.storage.sync");
  });
});

// 削除（sync）
clearBtn.addEventListener("click", () => {
  chrome.storage.sync.remove(["GEMINI_API_KEY"], () => {
    input.value = "";
    setStatus("Cleared from chrome.storage.sync");
  });
});