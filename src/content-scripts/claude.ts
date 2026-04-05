import { observeMessages } from "./shared";

observeMessages(
  "[class*='conversation']",
  "[class*='human-turn'], [data-testid*='human']",
  "claude",
  {
    fallbackSelector: "main",
    isUserMessage: (el) => {
      // Claude marks user messages differently from assistant messages
      const text = el.className || el.getAttribute("data-testid") || "";
      return /human|user/i.test(text);
    },
  }
);

console.log("[Eidetic] Claude content script loaded");
