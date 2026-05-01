// STEP 9 — Home page: search input, word-of-the-day, recent searches.
//   On submit, we navigate to /word/:word — the Detail page handles the
//   actual lookup. Recent searches live in localStorage (last 8).

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ConnectError } from "@connectrpc/connect";
import { client } from "../connect";
import type { Entry } from "../../../shared/gen/dictionary_pb";
import { EntryView } from "../components/EntryView";

const HISTORY_KEY = "wl.history";
const HISTORY_MAX = 8;

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function Home() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>(loadHistory);
  const [wotd, setWotd] = useState<{ word: string; entry?: Entry } | null>(null);
  const [wotdError, setWotdError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    client
      .wordOfTheDay({})
      .then((res) => {
        if (!cancelled) setWotd({ word: res.word, entry: res.entry });
      })
      .catch((err) => {
        if (!cancelled)
          setWotdError(
            err instanceof ConnectError ? err.message : "RPC failed"
          );
      });
    // Fire a cheap Health RPC too — wakes a sleeping Render free dyno
    // before the user clicks anything.
    client.health({}).catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const word = input.trim().toLowerCase();
    if (!word) return;
    navigate(`/word/${encodeURIComponent(word)}`);
  }

  function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  }

  return (
    <section className="home">
      <header className="hero">
        <h1>Look up any English word.</h1>
        <p>
          A typed Connect-RPC microservice fronting the free Dictionary
          API. Same <code>.proto</code> drives the server AND this UI.
        </p>
        <form onSubmit={submit} className="search-form">
          <input
            type="search"
            className="search-box"
            placeholder="e.g. ephemeral, petrichor, halcyon"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
          <button type="submit" className="search-btn">
            Define
          </button>
        </form>
      </header>

      <section className="wotd">
        <h2 className="section-title">Word of the day</h2>
        {wotdError && <p className="state state-error">{wotdError}</p>}
        {!wotd && !wotdError && <p className="state state-loading">Loading…</p>}
        {wotd?.entry && (
          <Link to={`/word/${encodeURIComponent(wotd.word)}`} className="wotd-card">
            <EntryView entry={wotd.entry} compact />
            <span className="wotd-cta">Read more →</span>
          </Link>
        )}
        {wotd && !wotd.entry && (
          <p className="state state-empty">Today's word: {wotd.word}</p>
        )}
      </section>

      {history.length > 0 && (
        <section className="history">
          <h2 className="section-title">
            Recent
            <button
              type="button"
              className="link-btn"
              onClick={clearHistory}
              aria-label="Clear history"
            >
              clear
            </button>
          </h2>
          <ul className="chip-list">
            {history.map((w) => (
              <li key={w}>
                <Link to={`/word/${encodeURIComponent(w)}`} className="chip">
                  {w}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}

/**
 * Push a word onto the history list, dedup + truncate. Exposed so the
 * Detail page can call it after a successful lookup.
 */
export function pushHistory(word: string): void {
  const w = word.trim().toLowerCase();
  if (!w) return;
  const cur = loadHistory().filter((x) => x !== w);
  cur.unshift(w);
  const next = cur.slice(0, HISTORY_MAX);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // localStorage may be disabled (private mode) — just skip.
  }
}
