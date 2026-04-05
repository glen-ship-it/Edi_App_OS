/**
 * Shared content script utilities for all platform interceptors.
 * Each platform content script uses MutationObserver to watch for new messages,
 * extracts user text, and sends to service worker for fact extraction.
 */

/** Inject a small gold tracking indicator dot on tracked pages */
export function injectTrackingIndicator(platformName: string) {
  if (document.getElementById("eidetic-tracking-dot")) return;

  const dot = document.createElement("div");
  dot.id = "eidetic-tracking-dot";
  dot.title = `Eidetic tracking active \u2014 ${platformName}`;
  dot.style.cssText = [
    "position: fixed",
    "bottom: 12px",
    "right: 12px",
    "width: 10px",
    "height: 10px",
    "border-radius: 50%",
    "background: #b5935a",
    "box-shadow: 0 0 6px rgba(181, 147, 90, 0.5)",
    "z-index: 2147483647",
    "pointer-events: none",
    "opacity: 0.8",
    "transition: opacity 0.3s",
  ].join("; ");

  function append() {
    if (document.body) {
      document.body.appendChild(dot);
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        document.body.appendChild(dot);
      });
    }
  }
  append();
}

export function sendToBackground(text: string, platform: string) {
  try {
    chrome.runtime.sendMessage(
      {
        type: "NEW_USER_MESSAGE",
        text,
        platform,
      },
      () => {
        // Suppress "receiving end does not exist" errors
        if (chrome.runtime.lastError) {
          // Extension context invalid — service worker may not be active
        }
      }
    );
  } catch {
    // chrome.runtime not available
  }
}

/**
 * Create a MutationObserver that watches a container for new child elements.
 * When new children appear, runs the extractor function on them.
 */
export function observeMessages(
  containerSelector: string,
  messageSelector: string,
  platform: string,
  options?: {
    fallbackSelector?: string;
    isUserMessage?: (el: Element) => boolean;
  }
) {
  const seen = new WeakSet<Node>();
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  function processNode(node: Element) {
    if (seen.has(node)) return;
    seen.add(node);

    // If provided, filter to user messages only
    if (options?.isUserMessage && !options.isUserMessage(node)) return;

    const text = node.textContent?.trim();
    if (text && text.length > 10 && text.length < 5000) {
      sendToBackground(text, platform);
    }
  }

  function scan() {
    const container =
      document.querySelector(containerSelector) ||
      (options?.fallbackSelector
        ? document.querySelector(options.fallbackSelector)
        : null);

    if (!container) return;

    const messages = container.querySelectorAll(messageSelector);
    messages.forEach(processNode);
  }

  // Debounced scan to avoid hammering on rapid DOM mutations
  function debouncedScan() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(scan, 500);
  }

  // Watch for new messages
  const observer = new MutationObserver(debouncedScan);

  function attach() {
    const container =
      document.querySelector(containerSelector) ||
      (options?.fallbackSelector
        ? document.querySelector(options.fallbackSelector)
        : null);

    if (container) {
      observer.observe(container, { childList: true, subtree: true });
      scan(); // Initial scan
    } else {
      // Retry until container appears (max 30 attempts = 60 seconds)
      let attempts = 0;
      const retry = setInterval(() => {
        attempts++;
        const el =
          document.querySelector(containerSelector) ||
          (options?.fallbackSelector
            ? document.querySelector(options.fallbackSelector)
            : null);
        if (el) {
          clearInterval(retry);
          observer.observe(el, { childList: true, subtree: true });
          scan();
        } else if (attempts >= 30) {
          clearInterval(retry);
          console.log(`[Eidetic] Could not find container for ${platform} after 60s`);
        }
      }, 2000);
    }
  }

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attach);
  } else {
    attach();
  }
}
