import type { Memory, MemoryCategory, PlatformId } from "./types";

const CAT_ORDER: MemoryCategory[] = [
  "identity",
  "professional",
  "products",
  "preferences",
  "technical",
  "relationships",
  "infrastructure",
  "active_context",
  "boundaries",
];

const CAT_LABELS: Record<MemoryCategory, string> = {
  identity: "Identity",
  preferences: "Preferences",
  products: "Active Products",
  professional: "Professional",
  technical: "Technical",
  relationships: "Relationships",
  infrastructure: "Infrastructure",
  active_context: "Active Context",
  boundaries: "Boundaries",
};

function groupByCategory(memories: Memory[]): Map<MemoryCategory, Memory[]> {
  const groups = new Map<MemoryCategory, Memory[]>();
  for (const m of memories) {
    const list = groups.get(m.category) ?? [];
    list.push(m);
    groups.set(m.category, list);
  }
  return groups;
}

function filterForPlatform(memories: Memory[], platform: PlatformId): Memory[] {
  return memories.filter((m) => !m.redact_for.includes(platform));
}

/** Claude adapter — markdown for API Memory Tool */
export function formatForClaude(memories: Memory[]): string {
  const filtered = filterForPlatform(memories, "claude_web");
  const groups = groupByCategory(filtered);
  const now = new Date().toISOString();

  let out = `# User Context — Synced by Eidetic\n## Last Updated: ${now}\n`;

  for (const cat of CAT_ORDER) {
    const items = groups.get(cat);
    if (!items?.length) continue;
    out += `\n## ${CAT_LABELS[cat]}\n`;
    for (const m of items) {
      if (cat === "boundaries") {
        out += `- **${m.value}**\n`;
      } else {
        out += `- ${capitalize(m.key)}: ${m.value}\n`;
      }
    }
  }

  return out;
}

/** Gemini adapter — system instruction text for Gem */
export function formatForGemini(memories: Memory[]): string {
  const filtered = filterForPlatform(memories, "gemini_web");
  const groups = groupByCategory(filtered);

  let out =
    "You are assisting a user with the following context. Use this to personalize all responses.\n\n";

  for (const cat of CAT_ORDER) {
    const items = groups.get(cat);
    if (!items?.length) continue;
    out += `${CAT_LABELS[cat].toUpperCase()}:\n`;
    for (const m of items) {
      out += `${capitalize(m.key)}: ${m.value}\n`;
    }
    out += "\n";
  }

  // Boundaries as rules
  const boundaries = groups.get("boundaries");
  if (boundaries?.length) {
    out += "RULES (ALWAYS ENFORCE):\n";
    for (const m of boundaries) {
      out += `- ${m.value}\n`;
    }
    out += "\n";
  }

  return out;
}

/** ChatGPT adapter — Custom Instructions format */
export function formatForChatGPT(memories: Memory[]): string {
  const filtered = filterForPlatform(memories, "chatgpt_web");
  const groups = groupByCategory(filtered);

  let aboutMe = "ABOUT ME:\n";
  let responsePrefs = "HOW SHOULD CHATGPT RESPOND:\n";

  for (const cat of CAT_ORDER) {
    const items = groups.get(cat);
    if (!items?.length) continue;
    if (cat === "preferences") {
      for (const m of items) {
        responsePrefs += `- ${m.value}\n`;
      }
    } else if (cat === "boundaries") {
      for (const m of items) {
        responsePrefs += `- ${m.value}\n`;
      }
    } else {
      for (const m of items) {
        aboutMe += `- ${capitalize(m.key)}: ${m.value}\n`;
      }
    }
  }

  return `${aboutMe}\n${responsePrefs}`;
}

/** Clipboard adapter — plain text optimized for manual paste */
export function formatForClipboard(memories: Memory[]): string {
  const groups = groupByCategory(memories);

  let out = "=== User Context (Eidetic Export) ===\n\n";

  for (const cat of CAT_ORDER) {
    const items = groups.get(cat);
    if (!items?.length) continue;
    out += `[${CAT_LABELS[cat]}]\n`;
    for (const m of items) {
      out += `  ${capitalize(m.key)}: ${m.value}\n`;
    }
    out += "\n";
  }

  return out;
}

function capitalize(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Get the right formatter for a platform */
export function formatForPlatform(
  memories: Memory[],
  platform: PlatformId
): string {
  switch (platform) {
    case "claude_web":
    case "claude_api":
      return formatForClaude(memories);
    case "gemini_web":
    case "gemini_api":
      return formatForGemini(memories);
    case "chatgpt_web":
    case "chatgpt_api":
      return formatForChatGPT(memories);
    case "perplexity_web":
    case "grok_web":
      return formatForClipboard(memories);
    default:
      return formatForClipboard(memories);
  }
}
