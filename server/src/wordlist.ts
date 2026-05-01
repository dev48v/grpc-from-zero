// STEP 4 — Word-of-the-day source list.
//   Hand-curated, on the higher-vocabulary end so the daily pick feels
//   like learning something new rather than "cat" or "run". The pick is
//   deterministic by UTC date — every visitor on the same day sees the
//   same word, no shared state needed.

const WORDS = [
  "ephemeral",
  "serendipity",
  "petrichor",
  "mellifluous",
  "ineffable",
  "halcyon",
  "ethereal",
  "limerence",
  "perspicacious",
  "sonder",
  "quixotic",
  "ubiquitous",
  "incandescent",
  "pernicious",
  "labyrinthine",
  "nebulous",
  "luminous",
  "redolent",
  "saccharine",
  "vicissitude",
  "esoteric",
  "fastidious",
  "obstreperous",
  "perfunctory",
  "recalcitrant",
  "salient",
  "tenuous",
  "ubiquity",
  "venerable",
  "wistful",
] as const;

/**
 * Pick today's word. Same word for every caller, every region, on a given
 * UTC day — so "word of the day" actually means "of the day".
 *
 * Algorithm: hash the YYYYMMDD into the wordlist index. Cheap and
 * stateless, and stable across server restarts.
 */
export function wordOfTheDay(now: Date = new Date()): string {
  const yyyy = now.getUTCFullYear();
  const mm = now.getUTCMonth() + 1;
  const dd = now.getUTCDate();
  const seed = yyyy * 10000 + mm * 100 + dd;
  return WORDS[seed % WORDS.length]!;
}
