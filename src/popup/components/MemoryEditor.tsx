import { useState } from "react";
import { useStore } from "@/lib/store";
import {
  CATEGORY_LABELS,
  PLATFORM_LABELS,
  type MemoryCategory,
  type SyncPriority,
  type PlatformId,
} from "@/lib/types";

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [MemoryCategory, string][];
const PRIORITIES: SyncPriority[] = ["always_sync", "high", "medium", "low"];
const ALL_PLATFORMS = Object.entries(PLATFORM_LABELS) as [PlatformId, string][];

export function MemoryEditor() {
  const editingMemory = useStore((s) => s.editingMemory)!;
  const setEditingMemory = useStore((s) => s.setEditingMemory);
  const addMemory = useStore((s) => s.addMemory);
  const updateMemory = useStore((s) => s.updateMemory);

  const isNew = editingMemory.id === "";

  const [form, setForm] = useState({
    category: editingMemory.category,
    key: editingMemory.key,
    value: editingMemory.value,
    tags: editingMemory.tags.join(", "),
    priority: editingMemory.priority,
    redact_for: editingMemory.redact_for,
  });

  const handleSave = async () => {
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (!form.key.trim() || !form.value.trim()) return;

    if (isNew) {
      await addMemory({
        id: crypto.randomUUID(),
        category: form.category,
        key: form.key.trim(),
        value: form.value.trim(),
        tags,
        priority: form.priority,
        source: "manual",
        redact_for: form.redact_for,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1,
      });
    } else {
      await updateMemory(editingMemory.id, {
        category: form.category,
        key: form.key.trim(),
        value: form.value.trim(),
        tags,
        priority: form.priority,
        redact_for: form.redact_for,
      });
    }

    setEditingMemory(null);
  };

  const toggleRedact = (platform: PlatformId) => {
    setForm((f) => ({
      ...f,
      redact_for: f.redact_for.includes(platform)
        ? f.redact_for.filter((p) => p !== platform)
        : [...f.redact_for, platform],
    }));
  };

  return (
    <div className="px-4 py-3 space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => setEditingMemory(null)} className="text-[#b5935a] text-xs uppercase tracking-[1.4px] hover:text-[#d4b277] transition-colors">
          ← Back
        </button>
        <h2 className="text-sm font-serif font-bold text-[#ffffff]">
          {isNew ? "New Memory" : "Edit Memory"}
        </h2>
        <div className="w-12" />
      </div>

      <div className="divider" />

      {/* Category + Key — side by side */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] text-[#8a8a8a] uppercase tracking-[1.4px] block mb-1">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value as MemoryCategory }))
            }
            className="input text-[11px] py-2"
          >
            {CATEGORIES.map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[9px] text-[#8a8a8a] uppercase tracking-[1.4px] block mb-1">
            Key
          </label>
          <input
            type="text"
            value={form.key}
            onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
            placeholder="location, role..."
            className="input text-[11px] py-2"
          />
        </div>
      </div>

      {/* Value */}
      <div>
        <label className="text-[9px] text-[#8a8a8a] uppercase tracking-[1.4px] block mb-1">
          Value
        </label>
        <textarea
          value={form.value}
          onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
          placeholder="The actual content..."
          rows={2}
          className="input resize-none text-[12px]"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="text-[9px] text-[#8a8a8a] uppercase tracking-[1.4px] block mb-1">
          Tags
        </label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          placeholder="personal, work, important"
          className="input text-[11px] py-2"
        />
      </div>

      {/* Priority */}
      <div>
        <label className="text-[9px] text-[#8a8a8a] uppercase tracking-[1.4px] block mb-1">
          Sync Priority
        </label>
        <div className="flex gap-1">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => setForm((f) => ({ ...f, priority: p }))}
              className={`text-[9px] px-2 py-1 uppercase tracking-wide cursor-pointer transition-colors ${
                form.priority === p
                  ? "text-[#060606]"
                  : "text-[#8a8a8a] hover:text-[#ababab]"
              }`}
              style={
                form.priority === p
                  ? { background: "#b5935a" }
                  : { background: "#161616", border: "1px solid rgba(181, 147, 90, 0.1)" }
              }
            >
              {p.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Redaction — compact horizontal */}
      <div>
        <label className="text-[9px] text-[#8a8a8a] uppercase tracking-[1.4px] block mb-1">
          Exclude From
        </label>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {ALL_PLATFORMS.map(([id, label]) => (
            <label
              key={id}
              className="flex items-center gap-1.5 text-[10px] text-[#efefef] cursor-pointer"
            >
              <input
                type="checkbox"
                checked={form.redact_for.includes(id)}
                onChange={() => toggleRedact(id)}
                className="accent-[#b5935a] w-3 h-3"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button onClick={handleSave} className="btn-primary flex-1 py-2">
          {isNew ? "Save" : "Update"}
        </button>
        <button
          onClick={() => setEditingMemory(null)}
          className="btn-ghost py-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
