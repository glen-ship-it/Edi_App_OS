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
  }
}

export const db = new EideticDB();
