// STEP 4 — Free Dictionary REST client.
//   Wraps https://api.dictionaryapi.dev/api/v2/entries/en/{word}, which
//   needs no API key. We add a small in-process TTL cache because real
//   English vocabulary doesn't change between visits and the upstream
//   has been known to flake under load.
//
//   We expose a typed function `lookup(word)` and a sentinel error
//   `WordNotFoundError` so the Connect-RPC layer can map 404 to the
//   correct gRPC status code (NotFound).

const BASE = "https://api.dictionaryapi.dev/api/v2/entries/en";
const TTL_MS = 6 * 60 * 60 * 1000; // 6 hours — words don't churn

interface UpstreamPhonetic {
  text?: string;
  audio?: string;
}

interface UpstreamDefinition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

interface UpstreamMeaning {
  partOfSpeech: string;
  definitions: UpstreamDefinition[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface UpstreamEntry {
  word: string;
  phonetic?: string;
  phonetics?: UpstreamPhonetic[];
  meanings: UpstreamMeaning[];
  sourceUrls?: string[];
}

export class WordNotFoundError extends Error {
  constructor(public readonly word: string) {
    super(`No definition found for "${word}"`);
    this.name = "WordNotFoundError";
  }
}

type CacheEntry = { value: UpstreamEntry[]; expiresAt: number };
const cache = new Map<string, CacheEntry>();

/**
 * Look up a word against the Free Dictionary API. Returns one or more
 * `Entry` objects (homographs like "bow" come back with multiple entries).
 *
 * Throws `WordNotFoundError` on 404 — every other non-2xx becomes a
 * generic Error so it bubbles up as a Connect Internal status.
 */
export async function lookup(word: string): Promise<UpstreamEntry[]> {
  const key = word.trim().toLowerCase();
  if (!key) throw new WordNotFoundError(word);

  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiresAt > now) return hit.value;

  // 6 s timeout — upstream is fast in the happy path, occasional pauses.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`${BASE}/${encodeURIComponent(key)}`, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });

    if (res.status === 404) throw new WordNotFoundError(word);
    if (!res.ok) throw new Error(`Free Dictionary API ${res.status}`);

    const json = (await res.json()) as UpstreamEntry[];
    cache.set(key, { value: json, expiresAt: now + TTL_MS });
    return json;
  } finally {
    clearTimeout(timer);
  }
}
