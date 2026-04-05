import { observeMessages, injectTrackingIndicator } from "./shared";

observeMessages(
  "[class*='thread'], main",
  "[data-message-author-role='user'], [class*='user-message']",
  "chatgpt",
  {
    fallbackSelector: "[role='main']",
    isUserMessage: (el) => {
      const role = el.getAttribute("data-message-author-role");
      return role === "user" || /user/i.test(el.className);
    },
  }
);

injectTrackingIndicator("ChatGPT");
console.log("[Eidetic] ChatGPT content script loaded");
