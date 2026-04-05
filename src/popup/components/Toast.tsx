import { useStore } from "@/lib/store";

export function Toast() {
  const toasts = useStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-14 left-4 right-4 flex flex-col gap-2 z-50 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="px-4 py-2.5 text-[11px] font-medium pointer-events-auto transition-all uppercase tracking-wide"
          style={
            t.type === "success"
              ? { background: "rgba(90, 158, 111, 0.12)", color: "#5a9e6f", border: "1px solid rgba(90, 158, 111, 0.25)" }
              : t.type === "error"
              ? { background: "rgba(196, 84, 84, 0.12)", color: "#c45454", border: "1px solid rgba(196, 84, 84, 0.25)" }
              : { background: "rgba(181, 147, 90, 0.12)", color: "#b5935a", border: "1px solid rgba(181, 147, 90, 0.25)" }
          }
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
