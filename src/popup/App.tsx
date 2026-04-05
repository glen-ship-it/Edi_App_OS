import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { seedDefaults } from "@/lib/seed";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Memories } from "./components/Memories";
import { Conflicts } from "./components/Conflicts";
import { Platforms } from "./components/Platforms";
import { Settings } from "./components/Settings";
import { Toast } from "./components/Toast";
import { MemoryEditor } from "./components/MemoryEditor";

function loadAll() {
  const s = useStore.getState();
  s.loadMemories();
  s.loadConflicts();
  s.loadPlatforms();
  s.loadSyncLogs();
  s.loadSettings();
}

export default function App() {
  const activeTab = useStore((s) => s.activeTab);
  const editingMemory = useStore((s) => s.editingMemory);

  useEffect(() => {
    seedDefaults().then(loadAll);

    // Listen for vault updates from service worker (when running as extension)
    function handleMessage(message: { type: string }) {
      if (message.type === "VAULT_UPDATED") {
        loadAll();
      }
    }

    try {
      chrome.runtime.onMessage.addListener(handleMessage);
      return () => chrome.runtime.onMessage.removeListener(handleMessage);
    } catch {
      // Not running as extension — that's fine for dev mode
    }
  }, []);

  return (
    <Layout>
      {editingMemory !== null ? (
        <MemoryEditor />
      ) : (
        <>
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "memories" && <Memories />}
          {activeTab === "conflicts" && <Conflicts />}
          {activeTab === "platforms" && <Platforms />}
          {activeTab === "settings" && <Settings />}
        </>
      )}
      <Toast />
    </Layout>
  );
}
