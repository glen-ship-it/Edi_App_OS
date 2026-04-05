import { useState } from "react";
import { useStore } from "@/lib/store";
import { PLATFORM_LABELS } from "@/lib/types";

export function Platforms() {
  const platforms = useStore((s) => s.platforms);
  const updatePlatform = useStore((s) => s.updatePlatform);
  const addToast = useStore((s) => s.addToast);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="p-5 space-y-3 pb-6">
      <h3 className="text-[10px] text-[#8a8a8a] uppercase tracking-[1.4px]">
        Connected Platforms
      </h3>

      {platforms.map((p) => {
        const expanded = expandedId === p.id;
        return (
          <div key={p.id} className="card">
            {/* Summary row */}
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedId(expanded ? null : p.id)}
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
                      ? { color: "#5a9e6f", border: "1px solid rgba(90, 158, 111, 0.3)", background: "rgba(90, 158, 111, 0.08)" }
                      : { color: "#8a8a8a", border: "1px solid rgba(138, 138, 138, 0.2)" }
                  }
                >
                  {p.enabled ? "Active" : "Off"}
                </span>
                <span className="text-[#8a8a8a] text-[10px]">{expanded ? "▾" : "▸"}</span>
              </div>
            </div>

            {/* Expanded config */}
            {expanded && (
              <div className="space-y-3 pt-3 mt-3" style={{ borderTop: "1px solid rgba(181, 147, 90, 0.1)" }}>
                {/* Enable toggle */}
                <label className="flex items-center justify-between text-xs text-[#efefef] cursor-pointer">
                  <span>Enabled</span>
                  <input
                    type="checkbox"
                    checked={p.enabled}
                    onChange={() => updatePlatform(p.id, { enabled: !p.enabled })}
                    className="accent-accent"
                  />
                </label>

                {/* Auto-extract toggle */}
                <label className="flex items-center justify-between text-xs text-[#efefef] cursor-pointer">
                  <span>Auto-extract facts</span>
                  <input
                    type="checkbox"
                    checked={p.config.auto_extract}
                    onChange={() =>
                      updatePlatform(p.id, {
                        config: { ...p.config, auto_extract: !p.config.auto_extract },
                      })
                    }
                    className="accent-accent"
                  />
                </label>

                {/* Auto-push toggle */}
                <label className="flex items-center justify-between text-xs text-[#efefef] cursor-pointer">
                  <span>Auto-push updates</span>
                  <input
                    type="checkbox"
                    checked={p.config.auto_push}
                    onChange={() =>
                      updatePlatform(p.id, {
                        config: { ...p.config, auto_push: !p.config.auto_push },
                      })
                    }
                    className="accent-accent"
                  />
                </label>

                {/* API Key */}
                <div>
                  <label className="text-[10px] text-[#8a8a8a] uppercase tracking-[1.4px] block mb-1.5">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={p.config.api_key || ""}
                    onChange={(e) =>
                      updatePlatform(p.id, {
                        config: { ...p.config, api_key: e.target.value || undefined },
                      })
                    }
                    placeholder="sk-..."
                    className="input font-mono text-[11px]"
                  />
                </div>

                {/* Last sync info */}
                <div className="text-[10px] text-[#8a8a8a]">
                  Last sync:{" "}
                  {p.last_sync_at
                    ? new Date(p.last_sync_at).toLocaleString()
                    : "Never"}
                </div>

                {/* Test connection */}
                <button
                  onClick={() => addToast(`Connection to ${PLATFORM_LABELS[p.platform]} OK`, "success")}
                  className="btn-ghost w-full text-[10px]"
                >
                  Test Connection
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
