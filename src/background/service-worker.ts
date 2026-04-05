import { extractFacts } from "@/lib/extractor";
import { db } from "@/lib/db";
import { WEB_PLATFORM_MAP } from "@/lib/types";
import type { Memory, Conflict } from "@/lib/types";

// Handle port connections — wakes the service worker when popup opens (MV3 requirement)
chrome.runtime.onConnect.addListener((_port) => {
  // Accept connection; service worker is now awake
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // PING: lets the popup wake the service worker before any real message
  if (message.type === "PING") {
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === "EXTRACT_FACTS") {
    const facts = extractFacts(message.text);
    sendResponse({ facts });
    return true;
  }

  if (message.type === "NEW_USER_MESSAGE") {
    handleNewUserMessage(message.text, message.platform).then(() => {
      sendResponse({ ok: true });
    });
    return true; // keep channel open for async
  }

  return false;
});

async function handleNewUserMessage(text: string, platform: string) {
  const facts = extractFacts(text);
  if (facts.length === 0) return;

  const platformConfigs = await db.platform_configs.toArray();
  const webPlatformId = WEB_PLATFORM_MAP[platform];
  const matchingConfig = platformConfigs.find((pc) =>
    pc.platform === webPlatformId && pc.enabled
  );
  if (!matchingConfig) return;

  const isPrimary = matchingConfig.role === "primary";

  for (const fact of facts) {
    const existing = await db.memories
      .where("category")
      .equals(fact.category)
      .filter((m) => m.key === fact.key)
      .first();

    if (existing) {
      if (existing.value === fact.value) continue;

      if (isPrimary) {
        await db.version_history.add({
          id: crypto.randomUUID(),
          memory_id: existing.id,
          previous_value: existing.value,
          new_value: fact.value,
          changed_by: "extraction",
          changed_at: new Date().toISOString(),
        });
        await db.memories.update(existing.id, {
          value: fact.value,
          updated_at: new Date().toISOString(),
          version: existing.version + 1,
          source: `extracted_${platform}` as Memory["source"],
        });
      } else {
        await db.conflicts.add({
          id: crypto.randomUUID(),
          memory_id: existing.id,
          primary_value: existing.value,
          secondary_value: fact.value,
          secondary_platform: platform,
          extracted_from: `${platform} conversation: "${text.slice(0, 120)}${text.length > 120 ? "..." : ""}"`,
          resolution: "pending",
          resolved_at: null,
          created_at: new Date().toISOString(),
        });
      }
    } else {
      if (isPrimary) {
        await db.memories.add({
          id: crypto.randomUUID(),
          category: fact.category,
          key: fact.key,
          value: fact.value,
          tags: [],
          priority: "medium",
          source: `extracted_${platform}` as Memory["source"],
          redact_for: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: 1,
        });
      } else {
        await db.conflicts.add({
          id: crypto.randomUUID(),
          memory_id: null,
          primary_value: "",
          secondary_value: fact.value,
          secondary_platform: platform,
          extracted_from: `${platform} conversation: "${text.slice(0, 120)}${text.length > 120 ? "..." : ""}"`,
          resolution: "pending",
          resolved_at: null,
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  // Notify popup to reload if open — .catch() handles promise rejection when popup is closed
  chrome.runtime.sendMessage({ type: "VAULT_UPDATED" }).catch(() => {});
}

// Extension install handler
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("[Eidetic] Extension installed. Welcome!");
  }
});
