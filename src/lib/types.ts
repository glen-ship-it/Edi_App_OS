export type MemoryCategory =
  | "identity"
  | "preferences"
  | "products"
  | "professional"
  | "technical"
  | "relationships"
  | "infrastructure"
  | "active_context"
  | "boundaries";

export type SyncPriority = "always_sync" | "high" | "medium" | "low";

export type MemorySource =
  | "manual"
  | "extracted_claude"
  | "extracted_gemini"
  | "extracted_chatgpt"
  | "extracted_perplexity"
  | "extracted_grok"
  | "imported";

export type PlatformId =
  | "claude_web"
  | "claude_api"
  | "gemini_web"
  | "gemini_api"
  | "chatgpt_web"
  | "chatgpt_api"
  | "perplexity_web"
  | "grok_web";

export type IntegrationMode = "web_tracking" | "api_sync";

export type PlatformRole = "primary" | "secondary";

export type ConflictResolution =
  | "pending"
  | "accept_primary"
  | "accept_secondary"
  | "merged"
  | "dismissed";

export type SyncAction = "push" | "extract" | "conflict" | "error";
export type SyncStatus = "success" | "failed" | "partial" | "skipped";

export interface Memory {
  id: string;
  category: MemoryCategory;
  key: string;
  value: string;
  tags: string[];
  priority: SyncPriority;
  source: MemorySource;
  redact_for: PlatformId[];
  created_at: string;
  updated_at: string;
  version: number;
}

export interface Conflict {
  id: string;
  memory_id: string | null;
  primary_value: string;
  secondary_value: string;
  secondary_platform: string;
  extracted_from: string;
  resolution: ConflictResolution;
  resolved_at: string | null;
  created_at: string;
}

export interface SyncLog {
  id: string;
  platform: PlatformId;
  action: SyncAction;
  memories_affected: string[];
  payload_hash: string;
  payload_size: number;
  status: SyncStatus;
  error_detail: string | null;
  created_at: string;
}

export interface PlatformConfig {
  id: string;
  platform: PlatformId;
  integration_mode: IntegrationMode;
  role: PlatformRole;
  enabled: boolean;
  config: {
    api_key?: string;
    auto_extract: boolean;
    auto_push: boolean;
  };
  last_sync_at: string | null;
  last_sync_status: SyncStatus | null;
}

export interface VersionHistory {
  id: string;
  memory_id: string;
  previous_value: string;
  new_value: string;
  changed_by: "manual" | "conflict_resolution" | "extraction";
  changed_at: string;
}

export const CATEGORY_LABELS: Record<MemoryCategory, string> = {
  identity: "Identity",
  preferences: "Preferences",
  products: "Products",
  professional: "Professional",
  technical: "Technical",
  relationships: "Relationships",
  infrastructure: "Infrastructure",
  active_context: "Active Context",
  boundaries: "Boundaries",
};

export const PLATFORM_LABELS: Record<PlatformId, string> = {
  claude_web: "Claude",
  claude_api: "Claude (API)",
  gemini_web: "Gemini",
  gemini_api: "Gemini (API)",
  chatgpt_web: "ChatGPT",
  chatgpt_api: "ChatGPT (API)",
  perplexity_web: "Perplexity",
  grok_web: "Grok",
};

/** Map content script platform names to their web PlatformId */
export const WEB_PLATFORM_MAP: Record<string, PlatformId> = {
  claude: "claude_web",
  gemini: "gemini_web",
  chatgpt: "chatgpt_web",
  perplexity: "perplexity_web",
  grok: "grok_web",
};
