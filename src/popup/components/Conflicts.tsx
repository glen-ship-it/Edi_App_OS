import { useStore } from "@/lib/store";

export function Conflicts() {
  const conflicts = useStore((s) => s.conflicts);
  const resolveConflict = useStore((s) => s.resolveConflict);

  if (conflicts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#8a8a8a] px-10">
        <span className="text-3xl font-serif text-[#b5935a33] mb-3">◇</span>
        <span className="text-sm font-serif text-[#efefef] mb-2">No conflicts</span>
        <span className="text-[11px] text-center text-[#8a8a8a] leading-relaxed">
          When a secondary platform detects information that differs from your
          primary vault, it will appear here for review.
        </span>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-3 pb-6">
      <h3 className="text-[10px] text-[#8a8a8a] uppercase tracking-[1.4px]">
        Pending Conflicts ({conflicts.length})
      </h3>

      {conflicts.map((c) => (
        <div key={c.id} className="card space-y-3">
          {/* Source context */}
          <div
            className="text-[10px] text-[#8a8a8a] px-2.5 py-2"
            style={{ background: "rgba(181, 147, 90, 0.04)", border: "1px solid rgba(181, 147, 90, 0.08)" }}
          >
            {c.extracted_from}
          </div>

          {/* Side by side comparison */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="text-[9px] text-[#5a9e6f] uppercase tracking-[1.4px] font-medium">
                Primary
              </div>
              <div
                className="text-xs text-[#efefef] px-2.5 py-2"
                style={{ background: "rgba(90, 158, 111, 0.08)", border: "1px solid rgba(90, 158, 111, 0.2)" }}
              >
                {c.primary_value || "(empty)"}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[9px] text-[#d4a94e] uppercase tracking-[1.4px] font-medium">
                {c.secondary_platform}
              </div>
              <div
                className="text-xs text-[#efefef] px-2.5 py-2"
                style={{ background: "rgba(212, 169, 78, 0.08)", border: "1px solid rgba(212, 169, 78, 0.2)" }}
              >
                {c.secondary_value}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => resolveConflict(c.id, "accept_primary")}
              className="flex-1 text-[10px] text-[#5a9e6f] uppercase tracking-wide py-1.5 transition-colors hover:bg-[#5a9e6f]/10"
              style={{ border: "1px solid rgba(90, 158, 111, 0.3)" }}
            >
              Keep Primary
            </button>
            <button
              onClick={() => resolveConflict(c.id, "accept_secondary")}
              className="flex-1 text-[10px] text-[#d4a94e] uppercase tracking-wide py-1.5 transition-colors hover:bg-[#d4a94e]/10"
              style={{ border: "1px solid rgba(212, 169, 78, 0.3)" }}
            >
              Accept New
            </button>
            <button
              onClick={() => resolveConflict(c.id, "dismissed")}
              className="text-[10px] text-[#8a8a8a] uppercase tracking-wide py-1.5 px-3 transition-colors hover:text-[#ababab]"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
