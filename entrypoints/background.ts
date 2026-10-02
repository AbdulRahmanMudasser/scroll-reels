import { browser } from "wxt/browser";
import { isScrollMessage } from "../utils/messages";

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(async (message: unknown, sender) => {
    if (!isScrollMessage(message)) return undefined;
    if (message.type !== "OPEN_POPUP") return undefined;

    const windowId = sender.tab?.windowId;
    if (!Number.isInteger(windowId) || typeof browser.action.openPopup !== "function") {
      return { opened: false };
    }

    try {
      await browser.action.openPopup({ windowId });
      return { opened: true };
    } catch {
      return { opened: false };
    }
  });
});
