import { extractFacts } from "@/lib/extractor";
import { db } from "@/lib/db";
import type { Memory, Conflict } from "@/lib/types";

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
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

  // Determine if this platform is primary or secondary
  const platformConfigs = await db.platform_configs.toArray();
  const matchingConfig = platformConfigs.find((pc) =>
    pc.platform.startsWith(platform) && pc.enabled
  );
  if (!matchingConfig) return;

  const isPrimary = matchingConfig.role === "primary";

  for (const fact of facts) {
    // Check if a memory with this key+category already exists
    const existing = await db.memories
      .where("category")
      .equals(fact.category)
      .filter((m) => m.key === fact.key)
      .first();

    if (existing) {
      if (existing.value === fact.value) continue; // No change

      if (isPrimary) {
        // Primary agent: auto-update vault
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
        // Secondary agent: queue as conflict
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
        // Primary agent: auto-add to vault
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
        // Secondary agent with new fact: queue as conflict for review
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

  // Notify popup to reload if it's open
  try {
    chrome.runtime.sendMessage({ type: "VAULT_UPDATED" });
  } catch {
    // Popup not open — that's fine
  }
}

// Extension install handler
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("[Eidetic] Extension installed. Welcome!");
  }
});
