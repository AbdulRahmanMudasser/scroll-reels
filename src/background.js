chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab?.id) return;
  const type = command === "next-reel" ? "NEXT" : command === "previous-reel" ? "PREVIOUS" : null;
  if (!type) return;
  chrome.tabs.sendMessage(tab.id, { type }).catch(() => {});
});
