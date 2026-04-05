import type { ReactNode } from "react";
import { useStore } from "@/lib/store";

const TABS = [
  { id: "dashboard" as const, label: "Home" },
  { id: "memories" as const, label: "Vault" },
  { id: "conflicts" as const, label: "Conflicts" },
  { id: "platforms" as const, label: "Platforms" },
  { id: "settings" as const, label: "Settings" },
];

export function Layout({ children }: { children: ReactNode }) {
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const conflicts = useStore((s) => s.conflicts);

  return (
    <div className="flex flex-col h-screen max-h-[600px] w-full max-w-[400px] mx-auto bg-[#060606] overflow-hidden">
      {/* Header */}
      <header
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid rgba(181, 147, 90, 0.1)", background: "rgba(6, 6, 6, 0.95)" }}
      >
        <div className="flex items-center gap-2.5">
          <img src="/public/icons/icon-48.png" alt="Eidetic" className="w-7 h-7" />
          <span className="text-xs font-medium text-[#efefef] tracking-[1.4px] uppercase">
            Eidetic
          </span>
        </div>
        <span className="text-[10px] text-[#8a8a8a] font-mono">v0.1.0</span>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* Tab Bar */}
      <nav
        className="flex items-center"
        style={{ borderTop: "1px solid rgba(181, 147, 90, 0.1)", background: "rgba(6, 6, 6, 0.95)" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 transition-colors relative text-[10px] font-medium uppercase tracking-wider ${
              activeTab === tab.id
                ? "text-[#b5935a]"
                : "text-[#8a8a8a] hover:text-[#ababab]"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-[#b5935a]" />
            )}
            {tab.id === "conflicts" && conflicts.length > 0 && (
              <span
                className="absolute top-1 right-1/4 w-4 h-4 text-[9px] text-[#060606] flex items-center justify-center font-bold bg-[#b5935a]"
              >
                {conflicts.length}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
