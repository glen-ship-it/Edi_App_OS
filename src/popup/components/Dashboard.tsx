import { useState } from "react";
import { useStore } from "@/lib/store";
import { PLATFORM_LABELS } from "@/lib/types";

export function Dashboard() {
  const memories = useStore((s) => s.memories);
  const conflicts = useStore((s) => s.conflicts);
  const platforms = useStore((s) => s.platforms);
  const syncLogs = useStore((s) => s.syncLogs);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const setEditingMemory = useStore((s) => s.setEditingMemory);
  const syncAll = useStore((s) => s.syncAll);
  const [syncing, setSyncing] = useState(false);

  const handleSyncAll = async () => {
    setSyncing(true);
    await syncAll();
    setSyncing(false);
  };

  const handleQuickAdd = () => {
    setEditingMemory({
      id: "",
      category: "active_context",
      key: "",
      value: "",
      tags: [],
      priority: "medium",
      source: "manual",
      redact_for: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
    });
  };

  return (
    <div className="p-5 space-y-5">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className="card text-center cursor-pointer py-4"
          onClick={() => setActiveTab("memories")}
        >
          <div className="text-2xl font-serif font-bold text-[#ffffff]">{memories.length}</div>
          <div className="text-[9px] text-[#8a8a8a] uppercase tracking-[1.4px] mt-1">Memories</div>
        </div>
        <div
          className="card text-center cursor-pointer py-4"
          onClick={() => setActiveTab("conflicts")}
        >
          <div className={`text-2xl font-serif font-bold ${conflicts.length > 0 ? "text-[#d4a94e]" : "text-[#ffffff]"}`}>
            {conflicts.length}
          </div>
          <div className="text-[9px] text-[#8a8a8a] uppercase tracking-[1.4px] mt-1">Conflicts</div>
        </div>
        <div
          className="card text-center cursor-pointer py-4"
          onClick={() => setActiveTab("platforms")}
        >
          <div className="text-2xl font-serif font-bold text-[#ffffff]">
            {platforms.filter((p) => p.enabled).length}
          </div>
          <div className="text-[9px] text-[#8a8a8a] uppercase tracking-[1.4px] mt-1">Platforms</div>
        </div>
      </div>

      {/* Conflict Banner */}
      {conflicts.length > 0 && (
        <div
          className="px-4 py-2.5 flex items-center justify-between cursor-pointer"
          style={{ border: "1px solid rgba(212, 169, 78, 0.3)", background: "rgba(212, 169, 78, 0.06)" }}
          onClick={() => setActiveTab("conflicts")}
        >
          <span className="text-[11px] text-[#d4a94e] font-medium uppercase tracking-wide">
            {conflicts.length} conflict{conflicts.length > 1 ? "s" : ""} pending review
          </span>
          <span className="text-[#d4a94e] text-xs">→</span>
        </div>
      )}

      {/* Platform Status */}
      <div className="space-y-2">
        <h3 className="text-[10px] text-[#8a8a8a] uppercase tracking-[1.4px]">
          Sync Status
        </h3>
        {platforms.map((p) => (
          <div key={p.id} className="card flex items-center justify-between py-2.5 px-3">
            <div className="flex items-center gap-2.5">
              <span
                className={`status-dot ${
                  !p.enabled
                    ? "bg-[#8a8a8a]"
                    : p.last_sync_status === "success"
                    ? "bg-[#5a9e6f]"
                    : p.last_sync_status === "failed"
                    ? "bg-[#c45454]"
                    : "bg-[#b5935a]"
                }`}
              />
              <div>
                <div className="text-xs font-medium text-[#efefef]">
                  {PLATFORM_LABELS[p.platform]}
                </div>
                <div className="text-[10px] text-[#8a8a8a]">
                  {p.role === "primary" ? "Primary" : "Secondary"}
                  {!p.enabled && " · Disabled"}
                </div>
              </div>
            </div>
            <div className="text-[10px] text-[#8a8a8a] font-mono">
              {p.last_sync_at
                ? new Date(p.last_sync_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "—"}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      {syncLogs.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] text-[#8a8a8a] uppercase tracking-[1.4px]">
            Recent Activity
          </h3>
          {syncLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="flex items-center gap-2 text-[11px] text-[#8a8a8a] px-1">
              <span
                className={`status-dot flex-shrink-0 ${
                  log.status === "success" ? "bg-[#5a9e6f]" : "bg-[#c45454]"
                }`}
              />
              <span className="truncate">
                {log.action} → {PLATFORM_LABELS[log.platform]} ({log.payload_size} chars)
              </span>
              <span className="ml-auto flex-shrink-0 font-mono">
                {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={handleSyncAll}
          disabled={syncing}
          className="btn-primary flex-1 disabled:opacity-50"
        >
          {syncing ? "Syncing..." : "Sync All"}
        </button>
        <button onClick={handleQuickAdd} className="btn-ghost flex-shrink-0">
          + Add
        </button>
      </div>
    </div>
  );
}
