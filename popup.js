const out = document.getElementById('out');

document.getElementById('btn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { type: 'GET_SELECTION' }, (res) => {
    out.textContent = res
      ? `URL: ${res.url}\n\nSelection:\n${res.selection || '(選択なし)'}`
      : 'Notionタブで実行してね（応答なし）';
  });
});
