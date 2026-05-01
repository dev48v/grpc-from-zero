// STEP 10 — Detail page: full word breakdown.
//   Reads :word from the URL, calls Define RPC, renders all entries with
//   meanings + definitions + examples + synonyms. Pushes the word into
//   localStorage history on success so the Home page can surface it.

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ConnectError, Code } from "@connectrpc/connect";
import { client } from "../connect";
import type {
  Entry,
  DefineResponse,
} from "../gen/dictionary_pb";
import { EntryView } from "../components/EntryView";
import { pushHistory } from "./Home";

type State =
  | { kind: "loading" }
  | { kind: "ok"; entries: Entry[] }
  | { kind: "not-found"; word: string }
  | { kind: "error"; message: string };

export function Detail() {
  const { word: raw } = useParams();
  const word = (raw ?? "").trim().toLowerCase();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!word) {
      setState({ kind: "error", message: "missing word" });
      return;
    }
    let cancelled = false;
    setState({ kind: "loading" });

    client
      .define({ word })
      .then((res: DefineResponse) => {
        if (cancelled) return;
        if (res.entries.length === 0) {
          setState({ kind: "not-found", word });
          return;
        }
        setState({ kind: "ok", entries: res.entries });
        pushHistory(word);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ConnectError && err.code === Code.NotFound) {
          setState({ kind: "not-found", word });
          return;
        }
        setState({
          kind: "error",
          message:
            err instanceof ConnectError
              ? `${err.code}: ${err.message}`
              : "RPC failed",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [word]);

  return (
    <section className="detail">
      <Link to="/" className="back">
        ← Search another word
      </Link>

      {state.kind === "loading" && (
        <p className="state state-loading">
          <span className="spinner" aria-hidden /> Looking up "{word}"…
        </p>
      )}

      {state.kind === "not-found" && (
        <div className="state state-empty">
          <h2>No definitions for "{state.word}"</h2>
          <p>Try a different spelling, or check the example words on the home page.</p>
        </div>
      )}

      {state.kind === "error" && (
        <div className="state state-error">
          <strong>Couldn't reach the dictionary service.</strong>
          <p>{state.message}</p>
        </div>
      )}

      {state.kind === "ok" &&
        state.entries.map((entry, i) => <EntryView key={i} entry={entry} />)}
    </section>
  );
}
