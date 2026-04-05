import { observeMessages, injectTrackingIndicator } from "./shared";

observeMessages(
  "[class*='conversation'], main",
  "[class*='user-message'], [data-role='user']",
  "grok",
  {
    fallbackSelector: "[role='main']",
    isUserMessage: () => true,
  }
);

injectTrackingIndicator("Grok");
console.log("[Eidetic] Grok content script loaded");
