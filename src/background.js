chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "OPEN_POPUP") return;

  const windowId = sender.tab?.windowId;
  if (!Number.isInteger(windowId) || typeof chrome.action.openPopup !== "function") {
    sendResponse({ opened: false });
    return;
  }

  chrome.action.openPopup({ windowId })
    .then(() => sendResponse({ opened: true }))
    .catch(() => sendResponse({ opened: false }));
  return true;
});
