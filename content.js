chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'GET_SELECTION') {
    sendResponse({
      url: location.href,
      selection: window.getSelection()?.toString() ?? ''
    });
  }
});
