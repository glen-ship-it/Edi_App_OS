import { db } from "./db";
import type { PlatformConfig } from "./types";

/** Seed default web-tracking platform configs on first run. */
export async function seedDefaults() {
  const defaults: PlatformConfig[] = [
    {
      id: "platform-claude-web",
      platform: "claude_web",
      integration_mode: "web_tracking",
      role: "primary",
      enabled: true,
      config: { auto_extract: true, auto_push: false },
      last_sync_at: null,
      last_sync_status: null,
    },
    {
      id: "platform-gemini-web",
      platform: "gemini_web",
      integration_mode: "web_tracking",
      role: "secondary",
      enabled: true,
      config: { auto_extract: true, auto_push: false },
      last_sync_at: null,
      last_sync_status: null,
    },
    {
      id: "platform-chatgpt-web",
      platform: "chatgpt_web",
      integration_mode: "web_tracking",
      role: "secondary",
      enabled: true,
      config: { auto_extract: true, auto_push: false },
      last_sync_at: null,
      last_sync_status: null,
    },
    {
      id: "platform-perplexity-web",
      platform: "perplexity_web",
      integration_mode: "web_tracking",
      role: "secondary",
      enabled: true,
      config: { auto_extract: true, auto_push: false },
      last_sync_at: null,
      last_sync_status: null,
    },
    {
      id: "platform-grok-web",
      platform: "grok_web",
      integration_mode: "web_tracking",
      role: "secondary",
      enabled: true,
      config: { auto_extract: true, auto_push: false },
      last_sync_at: null,
      last_sync_status: null,
    },
  ];

  // Migrate: remove legacy platform configs from v0.1.0
  const legacyIds = [
    "platform-claude-api",
    "platform-gemini-gem",
    "platform-chatgpt-custom",
  ];
  for (const id of legacyIds) {
    const exists = await db.platform_configs.get(id);
    if (exists) {
      await db.platform_configs.delete(id);
    }
  }

  // Seed new defaults if missing
  for (const d of defaults) {
    const exists = await db.platform_configs.get(d.id);
    if (!exists) {
      await db.platform_configs.add(d);
    }
  }
}
