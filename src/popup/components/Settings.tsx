import { db } from "@/lib/db";
import { useStore } from "@/lib/store";
import type { Memory } from "@/lib/types";

export function Settings() {
  const memories = useStore((s) => s.memories);
  const syncLogs = useStore((s) => s.syncLogs);
  const loadMemories = useStore((s) => s.loadMemories);
  const loadConflicts = useStore((s) => s.loadConflicts);
  const loadSyncLogs = useStore((s) => s.loadSyncLogs);
  const addToast = useStore((s) => s.addToast);
  const syncInterval = useStore((s) => s.syncInterval);
  const setSyncInterval = useStore((s) => s.setSyncInterval);
  const extractionMode = useStore((s) => s.extractionMode);
  const setExtractionMode = useStore((s) => s.setExtractionMode);

  const handleExport = () => {
    if (memories.length === 0) {
      addToast("No memories to export", "error");
      return;
    }
    const data = JSON.stringify(memories, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eidetic-vault-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast("Vault exported", "success");
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        if (!Array.isArray(imported)) throw new Error("Invalid format");

        let validCount = 0;
        for (const item of imported) {
          if (!item.id || !item.category || !item.key || !item.value) continue;
          const memory: Memory = {
            id: item.id,
            category: item.category,
            key: item.key,
            value: item.value,
            tags: Array.isArray(item.tags) ? item.tags : [],
            priority: item.priority || "medium",
            source: item.source || "imported",
            redact_for: Array.isArray(item.redact_for) ? item.redact_for : [],
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || new Date().toISOString(),
            version: item.version || 1,
          };
          await db.memories.put(memory);
          validCount++;
        }

        if (validCount === 0) throw new Error("No valid memories found");
        await loadMemories();
        addToast(`Imported ${validCount} memories`, "success");
      } catch (err) {
        addToast(
          err instanceof Error ? `Import failed: ${err.message}` : "Import failed",
          "error"
        );
      }
    };
    input.click();
  };

  const handleClearAll = async () => {
    await db.memories.clear();
    await db.conflicts.clear();
    await db.sync_log.clear();
    await db.version_history.clear();
    await loadMemories();
    await loadConflicts();
    await loadSyncLogs();
    addToast("All data cleared", "info");
  };

  return (
    <div className="px-4 py-3 space-y-3">
      {/* Sync Interval + Extraction Mode — side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[9px] text-[#8a8a8a] uppercase tracking-[1.4px] block mb-1">
            Sync Interval
          </label>
          <select
            value={syncInterval}
            onChange={(e) => setSyncInterval(e.target.value as typeof syncInterval)}
            className="input text-[11px] py-2"
          >
            <option value="on_change">On change</option>
            <option value="15min">Every 15m</option>
            <option value="1hr">Every 1hr</option>
            <option value="manual">Manual</option>
          </select>
        </div>
        <div>
          <label className="text-[9px] text-[#8a8a8a] uppercase tracking-[1.4px] block mb-1">
            Extraction
          </label>
          <select
            value={extractionMode}
            onChange={(e) => setExtractionMode(e.target.value as typeof extractionMode)}
            className="input text-[11px] py-2"
          >
            <option value="pattern">Pattern (free)</option>
            <option value="llm">LLM-assisted</option>
          </select>
        </div>
      </div>
      <p className="text-[9px] text-[#8a8a8a] leading-relaxed">
        Pattern-based runs on-device at zero cost. LLM uses Claude Haiku (~$0.001/extraction).
      </p>

      <div className="divider" />

      {/* Data Management */}
      <div>
        <label className="text-[9px] text-[#8a8a8a] uppercase tracking-[1.4px] block mb-1.5">
          Data Management
        </label>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-ghost flex-1 text-[10px] py-1.5">
            Export
          </button>
          <button onClick={handleImport} className="btn-ghost flex-1 text-[10px] py-1.5">
            Import
          </button>
        </div>
      </div>

      {/* Vault Info */}
      <div className="card space-y-1.5 py-3 px-3">
        <div className="flex justify-between text-[11px]">
          <span className="text-[#8a8a8a]">Memories</span>
          <span className="text-[#ffffff] font-mono">{memories.length}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-[#8a8a8a]">Syncs</span>
          <span className="text-[#ffffff] font-mono">{syncLogs.length}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-[#8a8a8a]">Storage</span>
          <span className="text-[#ffffff] font-mono">IndexedDB</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-[#8a8a8a]">Encryption</span>
          <span className="text-[#ffffff] font-mono">AES-GCM</span>
        </div>
      </div>

      <div className="divider" />

      {/* Danger Zone */}
      <div>
        <button onClick={handleClearAll} className="btn-danger w-full text-[10px] py-1.5">
          Delete All Data
        </button>
        <p className="text-[9px] text-[#8a8a8a] mt-1 text-center">
          Permanently deletes all memories, conflicts, and sync logs.
        </p>
      </div>

      {/* Footer */}
      <div className="text-center text-[9px] text-[#8a8a8a] pt-1 pb-1 space-y-0.5">
        <div className="font-serif text-[#b5935a80]">Eidetic v0.1.0</div>
        <div>Ironclad Consulting LLC</div>
      </div>
    </div>
  );
}
