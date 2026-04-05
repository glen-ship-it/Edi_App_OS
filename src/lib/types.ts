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
  | "claude_api"
  | "claude_web"
  | "gemini_gem"
  | "gemini_api"
  | "chatgpt_custom";

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
  claude_api: "Claude (API)",
  claude_web: "Claude (Web)",
  gemini_gem: "Gemini (Gem)",
  gemini_api: "Gemini (API)",
  chatgpt_custom: "ChatGPT",
};
