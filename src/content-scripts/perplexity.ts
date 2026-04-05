import { observeMessages } from "./shared";

observeMessages(
  "[class*='thread'], main",
  "[class*='query'], textarea[class*='question']",
  "perplexity",
  {
    fallbackSelector: "[role='main']",
    isUserMessage: () => true,
  }
);

console.log("[Eidetic] Perplexity content script loaded");
