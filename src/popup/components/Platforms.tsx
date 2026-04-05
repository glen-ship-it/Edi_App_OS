import { useState } from "react";
import { useStore } from "@/lib/store";
import { PLATFORM_LABELS } from "@/lib/types";
import type { PlatformConfig } from "@/lib/types";

export function Platforms() {
  const platforms = useStore((s) => s.platforms);
  const updatePlatform = useStore((s) => s.updatePlatform);
  const addToast = useStore((s) => s.addToast);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showApiSection, setShowApiSection] = useState(false);

  const webPlatforms = platforms.filter(
    (p) => p.integration_mode === "web_tracking"
  );
  const apiPlatforms = platforms.filter(
    (p) => p.integration_mode === "api_sync"
  );

  return (
    <div className="p-5 space-y-4 pb-6">
      {/* Web Tracking Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: "#b5935a",
              boxShadow: "0 0 6px rgba(181, 147, 90, 0.5)",
            }}
          />
          <h3 className="text-[10px] text-[#8a8a8a] uppercase tracking-[1.4px]">
            Web Tracking
          </h3>
          <span className="text-[9px] text-[#b5935a] ml-auto">
            No auth required
          </span>
        </div>

        <div className="space-y-2">
          {webPlatforms.map((p) => (
            <WebPlatformRow
              key={p.id}
              platform={p}
              expanded={expandedId === p.id}
              onToggleExpand={() =>
                setExpandedId(expandedId === p.id ? null : p.id)
              }
              onUpdate={updatePlatform}
            />
          ))}
        </div>

        {webPlatforms.length === 0 && (
          <div className="card text-center text-[11px] text-[#8a8a8a] py-4">
            No web platforms configured. Restart the extension to seed defaults.
          </div>
        )}
      </div>

      {/* API Sync Section — Collapsed */}
      <div>
        <div
          className="flex items-center justify-between cursor-pointer py-2"
          style={{ borderTop: "1px solid rgba(181, 147, 90, 0.1)" }}
          onClick={() => setShowApiSection(!showApiSection)}
        >
          <h3 className="text-[10px] text-[#8a8a8a] uppercase tracking-[1.4px]">
            API Sync (Advanced)
          </h3>
          <span className="text-[#8a8a8a] text-[10px]">
            {showApiSection ? "▾" : "▸"}
          </span>
        </div>

        {showApiSection && (
          <div className="space-y-2 mt-2">
            {apiPlatforms.length === 0 && (
              <div className="card text-[11px] text-[#8a8a8a] py-3">
                <p>
                  Push memories directly via API. Add a platform to get started.
                </p>
                <button
                  onClick={() => addToast("API sync coming in v0.2.0", "info")}
                  className="btn-ghost w-full text-[10px] mt-2"
                >
                  + Add API Platform
                </button>
              </div>
            )}
            {apiPlatforms.map((p) => (
              <ApiPlatformRow
                key={p.id}
                platform={p}
                expanded={expandedId === p.id}
                onToggleExpand={() =>
                  setExpandedId(expandedId === p.id ? null : p.id)
                }
                onUpdate={updatePlatform}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WebPlatformRow({
  platform: p,
  expanded,
  onToggleExpand,
  onUpdate,
}: {
  platform: PlatformConfig;
  expanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (id: string, updates: Partial<PlatformConfig>) => Promise<void>;
}) {
  return (
    <div className="card">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{
              background: p.enabled ? "#5a9e6f" : "#8a8a8a",
              boxShadow: p.enabled
                ? "0 0 4px rgba(90, 158, 111, 0.4)"
                : "none",
            }}
          />
          <div>
            <div className="text-xs font-medium text-[#ffffff]">
              {PLATFORM_LABELS[p.platform]}
            </div>
            <div className="text-[10px] text-[#8a8a8a]">
              {p.role === "primary" ? "Primary Agent" : "Secondary Agent"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span
            className="text-[9px] uppercase tracking-[1.4px] px-2 py-0.5"
            style={
              p.enabled
                ? {
                    color: "#5a9e6f",
                    border: "1px solid rgba(90, 158, 111, 0.3)",
                    background: "rgba(90, 158, 111, 0.08)",
                  }
                : {
                    color: "#8a8a8a",
                    border: "1px solid rgba(138, 138, 138, 0.2)",
                  }
            }
          >
            {p.enabled ? "Tracking" : "Off"}
          </span>
          <span className="text-[#8a8a8a] text-[10px]">
            {expanded ? "▾" : "▸"}
          </span>
        </div>
      </div>

      {expanded && (
        <div
          className="space-y-3 pt-3 mt-3"
          style={{ borderTop: "1px solid rgba(181, 147, 90, 0.1)" }}
        >
          <label className="flex items-center justify-between text-xs text-[#efefef] cursor-pointer">
            <span>Enabled</span>
            <input
              type="checkbox"
              checked={p.enabled}
              onChange={() => onUpdate(p.id, { enabled: !p.enabled })}
              className="accent-accent"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-[#efefef] cursor-pointer">
            <span>Auto-extract facts</span>
            <input
              type="checkbox"
              checked={p.config.auto_extract}
              onChange={() =>
                onUpdate(p.id, {
                  config: {
                    ...p.config,
                    auto_extract: !p.config.auto_extract,
                  },
                })
              }
              className="accent-accent"
            />
          </label>

          <div className="text-[10px] text-[#8a8a8a]">
            <span className="text-[#b5935a]">How it works:</span> When you chat
            on {PLATFORM_LABELS[p.platform]}, Eidetic watches for personal facts
            in your messages and saves them to the vault.{" "}
            {p.role === "primary"
              ? "As the primary agent, new facts are trusted automatically."
              : "As a secondary agent, new facts are queued for your review."}
          </div>
        </div>
      )}
    </div>
  );
}

function ApiPlatformRow({
  platform: p,
  expanded,
  onToggleExpand,
  onUpdate,
}: {
  platform: PlatformConfig;
  expanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (id: string, updates: Partial<PlatformConfig>) => Promise<void>;
}) {
  return (
    <div className="card">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggleExpand}
      >
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
          <div className="text-xs font-medium text-[#ffffff]">
            {PLATFORM_LABELS[p.platform]}
          </div>
        </div>
        <span className="text-[#8a8a8a] text-[10px]">
          {expanded ? "▾" : "▸"}
        </span>
      </div>

      {expanded && (
        <div
          className="space-y-3 pt-3 mt-3"
          style={{ borderTop: "1px solid rgba(181, 147, 90, 0.1)" }}
        >
          <label className="flex items-center justify-between text-xs text-[#efefef] cursor-pointer">
            <span>Enabled</span>
            <input
              type="checkbox"
              checked={p.enabled}
              onChange={() => onUpdate(p.id, { enabled: !p.enabled })}
              className="accent-accent"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-[#efefef] cursor-pointer">
            <span>Auto-push updates</span>
            <input
              type="checkbox"
              checked={p.config.auto_push}
              onChange={() =>
                onUpdate(p.id, {
                  config: { ...p.config, auto_push: !p.config.auto_push },
                })
              }
              className="accent-accent"
            />
          </label>

          <div>
            <label className="text-[10px] text-[#8a8a8a] uppercase tracking-[1.4px] block mb-1.5">
              API Key
            </label>
            <input
              type="password"
              value={p.config.api_key || ""}
              onChange={(e) =>
                onUpdate(p.id, {
                  config: {
                    ...p.config,
                    api_key: e.target.value || undefined,
                  },
                })
              }
              placeholder="sk-..."
              className="input font-mono text-[11px]"
            />
          </div>

          <div className="text-[10px] text-[#8a8a8a]">
            Last sync:{" "}
            {p.last_sync_at
              ? new Date(p.last_sync_at).toLocaleString()
              : "Never"}
          </div>
        </div>
      )}
    </div>
  );
}
