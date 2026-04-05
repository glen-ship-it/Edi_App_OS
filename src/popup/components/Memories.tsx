import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { CATEGORY_LABELS, type MemoryCategory } from "@/lib/types";

const CATEGORIES: Array<MemoryCategory | "all"> = [
  "all",
  "identity",
  "professional",
  "products",
  "preferences",
  "technical",
  "relationships",
  "infrastructure",
  "active_context",
  "boundaries",
];

export function Memories() {
  const memories = useStore((s) => s.memories);
  const categoryFilter = useStore((s) => s.categoryFilter);
  const setCategoryFilter = useStore((s) => s.setCategoryFilter);
  const searchQuery = useStore((s) => s.searchQuery);
  const setSearchQuery = useStore((s) => s.setSearchQuery);
  const setEditingMemory = useStore((s) => s.setEditingMemory);
  const deleteMemory = useStore((s) => s.deleteMemory);

  const filtered = useMemo(() => {
    let result = memories;
    if (categoryFilter !== "all") {
      result = result.filter((m) => m.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.key.toLowerCase().includes(q) ||
          m.value.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [memories, categoryFilter, searchQuery]);

  const handleNew = () => {
    setEditingMemory({
      id: "",
      category: categoryFilter === "all" ? "active_context" : categoryFilter,
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
    <div className="flex flex-col h-full relative">
      {/* Search + Category Filter Row */}
      <div className="px-4 pt-3 pb-2 flex gap-2">
        <input
          type="text"
          placeholder="Search vault..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input flex-1"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as MemoryCategory | "all")}
          className="input w-auto text-[11px] px-2 py-1"
          style={{ maxWidth: "120px" }}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "all" ? "All" : CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      {/* Active filter indicator */}
      {categoryFilter !== "all" && (
        <div className="px-4 pb-2 flex items-center gap-2">
          <span
            className="text-[10px] text-[#b5935a] uppercase tracking-[1.4px] px-2 py-0.5 flex items-center gap-1.5"
            style={{ border: "1px solid rgba(181, 147, 90, 0.3)", background: "rgba(181, 147, 90, 0.08)" }}
          >
            {CATEGORY_LABELS[categoryFilter]}
            <button
              onClick={() => setCategoryFilter("all")}
              className="text-[#8a8a8a] hover:text-[#efefef] ml-0.5"
            >
              ✕
            </button>
          </span>
        </div>
      )}

      {/* Memory List */}
      <div className="flex-1 overflow-y-auto px-4 pb-14 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-[#8a8a8a]">
            <span className="text-3xl font-serif text-[#b5935a4d] mb-3">◇</span>
            <span className="text-xs uppercase tracking-wide">No memories yet</span>
            <button onClick={handleNew} className="text-[#b5935a] text-xs mt-3 uppercase tracking-[1.4px] hover:text-[#d4b277] transition-colors">
              + Add your first memory
            </button>
          </div>
        ) : (
          filtered.map((m) => (
            <div
              key={m.id}
              className="card group cursor-pointer transition-colors"
              onClick={() => setEditingMemory(m)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] text-[#b5935a] uppercase tracking-[1.4px] font-medium">
                      {CATEGORY_LABELS[m.category]}
                    </span>
                    {m.priority === "always_sync" && (
                      <span className="text-[9px] text-[#b5935a99] font-mono">PINNED</span>
                    )}
                  </div>
                  <div className="text-xs font-medium text-[#ffffff]">
                    {m.key.replace(/_/g, " ")}
                  </div>
                  <div className="text-[11px] text-[#8a8a8a] mt-0.5 line-clamp-2">
                    {m.value}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMemory(m.id);
                  }}
                  className="text-[#8a8a8a] hover:text-[#c45454] text-xs opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
              {m.tags.length > 0 && (
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {m.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[9px] text-[#8a8a8a] px-2 py-0.5"
                      style={{ border: "1px solid rgba(181, 147, 90, 0.1)", background: "rgba(181, 147, 90, 0.04)" }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={handleNew}
        className="absolute bottom-4 right-4 w-10 h-10 flex items-center justify-center font-bold shadow-lg transition-colors"
        style={{ background: "#b5935a", color: "#060606" }}
      >
        +
      </button>
    </div>
  );
}
