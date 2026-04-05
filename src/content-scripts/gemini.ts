import { observeMessages } from "./shared";

observeMessages(
  "[class*='chat-container'], main",
  "[class*='query-text'], [class*='user-message'], [data-message-author='user']",
  "gemini",
  {
    fallbackSelector: "[role='main']",
    isUserMessage: () => true, // selector already targets user messages
  }
);

console.log("[Eidetic] Gemini content script loaded");
