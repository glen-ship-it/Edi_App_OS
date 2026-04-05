import type { MemoryCategory } from "./types";

interface ExtractionResult {
  category: MemoryCategory;
  key: string;
  value: string;
  confidence: number;
}

interface ExtractionRule {
  patterns: RegExp[];
  category: MemoryCategory;
  key: string | ((match: RegExpMatchArray) => string);
  value: (match: RegExpMatchArray) => string;
}

const RULES: ExtractionRule[] = [
  // Identity — location
  {
    patterns: [
      /\bI\s+live\s+in\s+(.+?)(?:\.|,|$)/i,
      /\bI(?:'m|\s+am)\s+(?:based|located)\s+in\s+(.+?)(?:\.|,|$)/i,
      /\bI\s+(?:just\s+)?moved\s+to\s+(.+?)(?:\.|,|$)/i,
    ],
    category: "identity",
    key: "location",
    value: (m) => m[1].trim(),
  },
  // Identity — name
  {
    patterns: [
      /\bmy\s+name\s+is\s+(\w+)/i,
      /\bI(?:'m|\s+am)\s+(\w+)(?:\s*,|\s*\.|\s+and\b)/i,
      /\bcall\s+me\s+(\w+)/i,
    ],
    category: "identity",
    key: "name",
    value: (m) => m[1].trim(),
  },
  // Identity — age / birthday
  {
    patterns: [/\bI(?:'m|\s+am)\s+(\d{1,3})\s+years?\s+old/i],
    category: "identity",
    key: "age",
    value: (m) => m[1],
  },
  // Identity — timezone
  {
    patterns: [
      /\bmy\s+timezone?\s+is\s+(.+?)(?:\.|,|$)/i,
      /\bI(?:'m|\s+am)\s+(?:in|on)\s+([\w\s]+time)/i,
    ],
    category: "identity",
    key: "timezone",
    value: (m) => m[1].trim(),
  },
  // Professional — role
  {
    patterns: [
      /\bI(?:'m|\s+am)\s+(?:a|an|the)\s+(.+?)\s+at\s+(.+?)(?:\.|,|$)/i,
    ],
    category: "professional",
    key: "role",
    value: (m) => `${m[1].trim()} at ${m[2].trim()}`,
  },
  {
    patterns: [/\bI\s+work\s+(?:at|for)\s+(.+?)(?:\.|,|$)/i],
    category: "professional",
    key: "employer",
    value: (m) => m[1].trim(),
  },
  // Preferences
  {
    patterns: [
      /\bI\s+prefer\s+(.+?)(?:\.|,|$)/i,
      /\bI\s+(?:like|want|love)\s+(.+?)(?:\.|,|$)/i,
    ],
    category: "preferences",
    key: (m) => slugify(m[1].trim().slice(0, 40)),
    value: (m) => m[1].trim(),
  },
  // Relationships
  {
    patterns: [/\bmy\s+(\w+(?:\s+\w+)?)\s+is\s+(\w+(?:\s+\w+)?)/i],
    category: "relationships",
    key: (m) => m[1].trim().toLowerCase(),
    value: (m) => m[2].trim(),
  },
  // Products / projects
  {
    patterns: [
      /\bI(?:'m|\s+am)\s+(?:working\s+on|building)\s+(.+?)(?:\.|,|$)/i,
    ],
    category: "products",
    key: (m) => slugify(m[1].trim().slice(0, 40)),
    value: (m) => m[1].trim(),
  },
  // Boundaries
  {
    patterns: [
      /\b(?:don't|do\s+not|never)\s+(.+?)(?:\.|$)/i,
      /\balways\s+(.+?)(?:\.|$)/i,
    ],
    category: "boundaries",
    key: (m) => slugify(m[1].trim().slice(0, 40)),
    value: (m) => m[0].trim(),
  },
  // Active context — explicit remember
  {
    patterns: [/\bremember\s+that\s+(.+?)(?:\.|$)/i],
    category: "active_context",
    key: (m) => slugify(m[1].trim().slice(0, 40)),
    value: (m) => m[1].trim(),
  },
];

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

const CONFIDENCE_THRESHOLD = 0.7;

/**
 * Extract facts from a user message using pattern matching.
 * Returns only extractions above the confidence threshold.
 */
export function extractFacts(text: string): ExtractionResult[] {
  const results: ExtractionResult[] = [];
  const seen = new Set<string>();

  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      const match = text.match(pattern);
      if (!match) continue;

      const key = typeof rule.key === "function" ? rule.key(match) : rule.key;
      const value = rule.value(match);
      const confidence = isDirectStatement(text, match) ? 0.95 : 0.7;

      if (confidence < CONFIDENCE_THRESHOLD) continue;

      const dedupKey = `${rule.category}:${key}`;
      if (seen.has(dedupKey)) continue;
      seen.add(dedupKey);

      results.push({
        category: rule.category,
        key,
        value,
        confidence,
      });
      break; // first pattern match per rule is enough
    }
  }

  return results;
}

/** Direct statements like "I live in X" get higher confidence than contextual ones. */
function isDirectStatement(text: string, match: RegExpMatchArray): boolean {
  const prefix = text.slice(0, match.index ?? 0).trim();
  // If the match is near the start of the sentence, it's likely direct
  return prefix.length < 20 || /^(so|well|yeah|oh|btw|also|and)\b/i.test(prefix);
}
