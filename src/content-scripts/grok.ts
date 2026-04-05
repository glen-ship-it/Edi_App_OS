import { observeMessages } from "./shared";

observeMessages(
  "[class*='conversation'], main",
  "[class*='user-message'], [data-role='user']",
  "grok",
  {
    fallbackSelector: "[role='main']",
    isUserMessage: () => true,
  }
);

console.log("[Eidetic] Grok content script loaded");
