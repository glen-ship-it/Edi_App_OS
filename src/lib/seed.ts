import { db } from "./db";
import type { PlatformConfig } from "./types";

/** Seed default platform configs on first run. Uses deterministic IDs to prevent duplicates. */
export async function seedDefaults() {
  const defaults: PlatformConfig[] = [
    {
      id: "platform-claude-api",
      platform: "claude_api",
      role: "primary",
      enabled: true,
      config: { auto_extract: true, auto_push: true },
      last_sync_at: null,
      last_sync_status: null,
    },
    {
      id: "platform-gemini-gem",
      platform: "gemini_gem",
      role: "secondary",
      enabled: true,
      config: { auto_extract: true, auto_push: false },
      last_sync_at: null,
      last_sync_status: null,
    },
    {
      id: "platform-chatgpt-custom",
      platform: "chatgpt_custom",
      role: "secondary",
      enabled: false,
      config: { auto_extract: false, auto_push: false },
      last_sync_at: null,
      last_sync_status: null,
    },
  ];

  // Clear stale data and re-seed with deterministic IDs
  const existing = await db.platform_configs.count();
  if (existing > defaults.length) {
    await db.platform_configs.clear();
  }

  for (const d of defaults) {
    const exists = await db.platform_configs.get(d.id);
    if (!exists) {
      await db.platform_configs.add(d);
    }
  }
}
