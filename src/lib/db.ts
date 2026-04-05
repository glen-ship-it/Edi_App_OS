import Dexie, { type EntityTable } from "dexie";
import type {
  Memory,
  Conflict,
  SyncLog,
  PlatformConfig,
  VersionHistory,
} from "./types";

class EideticDB extends Dexie {
  memories!: EntityTable<Memory, "id">;
  conflicts!: EntityTable<Conflict, "id">;
  sync_log!: EntityTable<SyncLog, "id">;
  platform_configs!: EntityTable<PlatformConfig, "id">;
  version_history!: EntityTable<VersionHistory, "id">;

  constructor() {
    super("eidetic");

    this.version(1).stores({
      memories: "id, category, key, priority, source, updated_at",
      conflicts: "id, memory_id, resolution, created_at",
      sync_log: "id, platform, action, status, created_at",
      platform_configs: "id, platform, role",
      version_history: "id, memory_id, changed_at",
    });

    this.version(2)
      .stores({
        platform_configs: "id, platform, role, integration_mode",
      })
      .upgrade((tx) => {
        return tx
          .table("platform_configs")
          .toCollection()
          .modify((config) => {
            // Migrate existing records: infer mode from platform ID
            if (!config.integration_mode) {
              config.integration_mode = config.platform.endsWith("_api")
                ? "api_sync"
                : "web_tracking";
            }
          });
      });
  }
}

export const db = new EideticDB();
