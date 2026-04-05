import { create } from "zustand";
import { db } from "./db";
import { formatForPlatform } from "./formatter";
import type {
  Memory,
  Conflict,
  PlatformConfig,
  MemoryCategory,
  SyncLog,
  PlatformId,
} from "./types";

type Tab = "dashboard" | "memories" | "conflicts" | "platforms" | "settings";
type SyncInterval = "on_change" | "15min" | "1hr" | "manual";
type ExtractionMode = "pattern" | "llm";

interface EideticState {
  // Navigation
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;

  // Memories
  memories: Memory[];
  loadMemories: () => Promise<void>;
  addMemory: (memory: Memory) => Promise<void>;
  updateMemory: (id: string, updates: Partial<Memory>) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;

  // Conflicts
  conflicts: Conflict[];
  loadConflicts: () => Promise<void>;
  resolveConflict: (id: string, resolution: Conflict["resolution"]) => Promise<void>;
  addConflict: (conflict: Conflict) => Promise<void>;

  // Platforms
  platforms: PlatformConfig[];
  loadPlatforms: () => Promise<void>;
  updatePlatform: (id: string, updates: Partial<PlatformConfig>) => Promise<void>;

  // Sync
  syncLogs: SyncLog[];
  loadSyncLogs: () => Promise<void>;
  syncAll: () => Promise<void>;
  syncToPlatform: (platformId: string) => Promise<void>;

  // Settings (persisted via chrome.storage.local or localStorage)
  syncInterval: SyncInterval;
  setSyncInterval: (interval: SyncInterval) => void;
  extractionMode: ExtractionMode;
  setExtractionMode: (mode: ExtractionMode) => void;
  loadSettings: () => void;

  // Filter
  categoryFilter: MemoryCategory | "all";
  setCategoryFilter: (filter: MemoryCategory | "all") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // UI
  editingMemory: Memory | null;
  setEditingMemory: (memory: Memory | null) => void;
  toasts: Array<{ id: string; message: string; type: "success" | "error" | "info" }>;
  addToast: (message: string, type: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
}

// Helpers for settings persistence (works in both extension and browser contexts)
function saveSetting(key: string, value: string) {
  try {
    localStorage.setItem(`eidetic_${key}`, value);
  } catch {}
}

function loadSetting(key: string, fallback: string): string {
  try {
    return localStorage.getItem(`eidetic_${key}`) ?? fallback;
  } catch {
    return fallback;
  }
}

export const useStore = create<EideticState>((set, get) => ({
  // Navigation
  activeTab: "dashboard",
  setActiveTab: (tab) => set({ activeTab: tab, editingMemory: null }),

  // Memories
  memories: [],
  loadMemories: async () => {
    const memories = await db.memories.orderBy("updated_at").reverse().toArray();
    set({ memories });
  },
  addMemory: async (memory) => {
    await db.memories.add(memory);
    await get().loadMemories();
    get().addToast("Memory added", "success");
  },
  updateMemory: async (id, updates) => {
    const existing = await db.memories.get(id);
    if (!existing) return;
    // Save version history when value changes
    if (updates.value && updates.value !== existing.value) {
      await db.version_history.add({
        id: crypto.randomUUID(),
        memory_id: id,
        previous_value: existing.value,
        new_value: updates.value,
        changed_by: "manual",
        changed_at: new Date().toISOString(),
      });
    }
    await db.memories.update(id, {
      ...updates,
      updated_at: new Date().toISOString(),
      version: existing.version + 1,
    });
    await get().loadMemories();
    get().addToast("Memory updated", "success");
  },
  deleteMemory: async (id) => {
    await db.memories.delete(id);
    await db.version_history.where("memory_id").equals(id).delete();
    await get().loadMemories();
    get().addToast("Memory deleted", "info");
  },

  // Conflicts
  conflicts: [],
  loadConflicts: async () => {
    const conflicts = await db.conflicts
      .where("resolution")
      .equals("pending")
      .reverse()
      .sortBy("created_at");
    set({ conflicts });
  },
  addConflict: async (conflict) => {
    await db.conflicts.add(conflict);
    await get().loadConflicts();
  },
  resolveConflict: async (id, resolution) => {
    const conflict = await db.conflicts.get(id);
    if (!conflict) return;

    await db.conflicts.update(id, {
      resolution,
      resolved_at: new Date().toISOString(),
    });

    if (resolution === "accept_secondary") {
      if (conflict.memory_id) {
        // Update existing memory
        const existing = await db.memories.get(conflict.memory_id);
        if (existing) {
          await db.version_history.add({
            id: crypto.randomUUID(),
            memory_id: conflict.memory_id,
            previous_value: existing.value,
            new_value: conflict.secondary_value,
            changed_by: "conflict_resolution",
            changed_at: new Date().toISOString(),
          });
          await db.memories.update(conflict.memory_id, {
            value: conflict.secondary_value,
            updated_at: new Date().toISOString(),
            version: existing.version + 1,
          });
        }
      } else {
        // New fact from secondary — create new memory
        await db.memories.add({
          id: crypto.randomUUID(),
          category: "active_context",
          key: conflict.secondary_value.slice(0, 40).toLowerCase().replace(/[^a-z0-9]+/g, "_"),
          value: conflict.secondary_value,
          tags: [],
          priority: "medium",
          source: `extracted_${conflict.secondary_platform}` as Memory["source"],
          redact_for: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: 1,
        });
      }
      await get().loadMemories();
    }

    await get().loadConflicts();
    get().addToast(`Conflict resolved: ${resolution.replace(/_/g, " ")}`, "success");
  },

  // Platforms
  platforms: [],
  loadPlatforms: async () => {
    const platforms = await db.platform_configs.toArray();
    set({ platforms });
  },
  updatePlatform: async (id, updates) => {
    // For nested config, do a manual read-merge-write
    if (updates.config) {
      const existing = await db.platform_configs.get(id);
      if (existing) {
        updates.config = { ...existing.config, ...updates.config };
      }
    }
    await db.platform_configs.update(id, updates);
    await get().loadPlatforms();
  },

  // Sync
  syncLogs: [],
  loadSyncLogs: async () => {
    const logs = await db.sync_log.orderBy("created_at").reverse().limit(50).toArray();
    set({ syncLogs: logs });
  },
  syncToPlatform: async (platformId: string) => {
    const platform = await db.platform_configs.get(platformId);
    if (!platform || !platform.enabled) return;

    const memories = get().memories;
    const output = formatForPlatform(memories, platform.platform);

    try {
      await navigator.clipboard.writeText(output);

      // Log sync
      const logEntry: SyncLog = {
        id: crypto.randomUUID(),
        platform: platform.platform,
        action: "push",
        memories_affected: memories.map((m) => m.id),
        payload_hash: await hashString(output),
        payload_size: output.length,
        status: "success",
        error_detail: null,
        created_at: new Date().toISOString(),
      };
      await db.sync_log.add(logEntry);

      // Update platform last sync
      await db.platform_configs.update(platformId, {
        last_sync_at: new Date().toISOString(),
        last_sync_status: "success",
      });
    } catch (err) {
      const logEntry: SyncLog = {
        id: crypto.randomUUID(),
        platform: platform.platform,
        action: "push",
        memories_affected: [],
        payload_hash: "",
        payload_size: 0,
        status: "failed",
        error_detail: err instanceof Error ? err.message : "Unknown error",
        created_at: new Date().toISOString(),
      };
      await db.sync_log.add(logEntry);

      await db.platform_configs.update(platformId, {
        last_sync_at: new Date().toISOString(),
        last_sync_status: "failed",
      });
    }
  },
  syncAll: async () => {
    const platforms = get().platforms.filter((p) => p.enabled);
    if (platforms.length === 0) {
      get().addToast("No enabled platforms to sync", "error");
      return;
    }

    const memories = get().memories;
    if (memories.length === 0) {
      get().addToast("No memories to sync", "error");
      return;
    }

    // Build combined output for clipboard (all platforms)
    let clipboardOutput = "";
    for (const p of platforms) {
      const output = formatForPlatform(memories, p.platform);
      clipboardOutput = output; // Last one wins for clipboard

      // Log each platform sync
      const logEntry: SyncLog = {
        id: crypto.randomUUID(),
        platform: p.platform,
        action: "push",
        memories_affected: memories.map((m) => m.id),
        payload_hash: await hashString(output),
        payload_size: output.length,
        status: "success",
        error_detail: null,
        created_at: new Date().toISOString(),
      };
      await db.sync_log.add(logEntry);

      await db.platform_configs.update(p.id, {
        last_sync_at: new Date().toISOString(),
        last_sync_status: "success",
      });
    }

    try {
      await navigator.clipboard.writeText(clipboardOutput);
    } catch {}

    await get().loadPlatforms();
    await get().loadSyncLogs();
    get().addToast(
      `Synced to ${platforms.length} platform${platforms.length > 1 ? "s" : ""} — context copied to clipboard`,
      "success"
    );
  },

  // Settings
  syncInterval: loadSetting("sync_interval", "on_change") as SyncInterval,
  setSyncInterval: (interval) => {
    set({ syncInterval: interval });
    saveSetting("sync_interval", interval);
  },
  extractionMode: loadSetting("extraction_mode", "pattern") as ExtractionMode,
  setExtractionMode: (mode) => {
    set({ extractionMode: mode });
    saveSetting("extraction_mode", mode);
  },
  loadSettings: () => {
    set({
      syncInterval: loadSetting("sync_interval", "on_change") as SyncInterval,
      extractionMode: loadSetting("extraction_mode", "pattern") as ExtractionMode,
    });
  },

  // Filter
  categoryFilter: "all",
  setCategoryFilter: (filter) => set({ categoryFilter: filter }),
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  // UI
  editingMemory: null,
  setEditingMemory: (memory) => set({ editingMemory: memory }),
  toasts: [],
  addToast: (message, type) => {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 3000);
  },
  removeToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
