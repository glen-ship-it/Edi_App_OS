import { observeMessages, injectTrackingIndicator } from "./shared";

observeMessages(
  "[class*='thread'], main",
  "[class*='query'], textarea[class*='question']",
  "perplexity",
  {
    fallbackSelector: "[role='main']",
    isUserMessage: () => true,
  }
);

injectTrackingIndicator("Perplexity");
console.log("[Eidetic] Perplexity content script loaded");
