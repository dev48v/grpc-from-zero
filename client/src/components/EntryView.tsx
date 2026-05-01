// STEP 9 — Render a single proto-shaped Entry.
//   Reused by both the Home preview (compact) and the Detail page (full).
//   The Entry type comes straight from shared/gen/dictionary_pb, so any
//   schema change shows up here as a TS error first.

import type { Entry } from "../../../shared/gen/dictionary_pb";

interface Props {
  entry: Entry;
  compact?: boolean;
}

export function EntryView({ entry, compact = false }: Props) {
  const audio = entry.phonetics.find((p) => p.audio)?.audio;

  return (
    <article className={`entry ${compact ? "entry-compact" : ""}`}>
      <header className="entry-head">
        <h2 className="entry-word">{entry.word}</h2>
        {entry.phonetic && <span className="entry-ipa">{entry.phonetic}</span>}
        {audio && (
          <button
            type="button"
            className="entry-play"
            onClick={() => new Audio(audio).play().catch(() => undefined)}
            aria-label={`Pronounce ${entry.word}`}
          >
            ▶
          </button>
        )}
      </header>

      {entry.meanings.slice(0, compact ? 1 : entry.meanings.length).map((m, mi) => (
        <section key={mi} className="meaning">
          <span className="part-of-speech">{m.partOfSpeech}</span>
          <ol className="defs">
            {m.definitions
              .slice(0, compact ? 1 : m.definitions.length)
              .map((d, di) => (
                <li key={di}>
                  <p className="def">{d.definition}</p>
                  {d.example && <p className="ex">"{d.example}"</p>}
                </li>
              ))}
          </ol>
          {!compact && m.synonyms.length > 0 && (
            <p className="syn">
              <span>Synonyms:</span> {m.synonyms.slice(0, 8).join(", ")}
            </p>
          )}
          {!compact && m.antonyms.length > 0 && (
            <p className="ant">
              <span>Antonyms:</span> {m.antonyms.slice(0, 8).join(", ")}
            </p>
          )}
        </section>
      ))}

      {!compact && entry.sourceUrls.length > 0 && (
        <footer className="entry-foot">
          {entry.sourceUrls.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noreferrer">
              source {i + 1}
            </a>
          ))}
        </footer>
      )}
    </article>
  );
}
