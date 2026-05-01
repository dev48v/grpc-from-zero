// STEP 5 — Service implementation.
//   Implements the DictionaryService contract from the .proto file using
//   Connect-RPC's typed handlers. Each handler maps upstream REST shapes
//   into the proto-shaped response, and translates error sentinels into
//   the right gRPC status codes (NotFound, Internal).

import {
  Code,
  ConnectError,
  type ConnectRouter,
} from "@connectrpc/connect";
import {
  DictionaryService,
  type DefineRequest,
  type Entry,
  type Meaning,
  type Definition,
  type Phonetic,
} from "./gen/dictionary_pb.js";
import {
  lookup,
  WordNotFoundError,
  type UpstreamEntry,
} from "./dictionary-api.js";
import { wordOfTheDay } from "./wordlist.js";

// --- Mappers: upstream JSON → proto-shaped objects ----------------------

function mapPhonetic(p: NonNullable<UpstreamEntry["phonetics"]>[number]): Phonetic {
  return {
    $typeName: "dictionary.v1.Phonetic",
    text: p.text ?? "",
    audio: p.audio ?? "",
  };
}

function mapDefinition(d: UpstreamEntry["meanings"][number]["definitions"][number]): Definition {
  return {
    $typeName: "dictionary.v1.Definition",
    definition: d.definition,
    example: d.example ?? "",
    synonyms: d.synonyms ?? [],
    antonyms: d.antonyms ?? [],
  };
}

function mapMeaning(m: UpstreamEntry["meanings"][number]): Meaning {
  return {
    $typeName: "dictionary.v1.Meaning",
    partOfSpeech: m.partOfSpeech,
    definitions: m.definitions.map(mapDefinition),
    synonyms: m.synonyms ?? [],
    antonyms: m.antonyms ?? [],
  };
}

function mapEntry(e: UpstreamEntry): Entry {
  return {
    $typeName: "dictionary.v1.Entry",
    word: e.word,
    phonetic: e.phonetic ?? "",
    phonetics: (e.phonetics ?? []).map(mapPhonetic),
    meanings: e.meanings.map(mapMeaning),
    sourceUrls: e.sourceUrls ?? [],
  };
}

// --- RPC handlers (typed individually so TS can narrow each request) ----
//
// We split each handler into a stand-alone async function and cast at the
// router boundary. ServiceImpl<typeof DictionaryService> in @connectrpc
// 2.x has a known inference quirk with @bufbuild/protobuf 2.x's
// GenMessage<T> brand — TS widens `request` to `Message<string>` even
// though the runtime correctly receives `DefineRequest`. Casting at
// registration time keeps each handler body fully typed.

async function handleDefine(
  req: DefineRequest
): Promise<{ entries: Entry[] }> {
  const word = req.word?.trim();
  if (!word) {
    throw new ConnectError("word is required", Code.InvalidArgument);
  }
  try {
    const upstream = await lookup(word);
    return { entries: upstream.map(mapEntry) };
  } catch (err) {
    if (err instanceof WordNotFoundError) {
      throw new ConnectError(err.message, Code.NotFound);
    }
    throw err;
  }
}

async function handleWordOfTheDay(): Promise<{
  word: string;
  entry?: Entry;
}> {
  const word = wordOfTheDay();
  try {
    const [first] = await lookup(word);
    return { word, entry: first ? mapEntry(first) : undefined };
  } catch (err) {
    if (err instanceof WordNotFoundError) {
      // Curated list shouldn't yield 404s — log and surface a soft
      // response so the UI can still render the word itself.
      console.warn(`word-of-the-day "${word}" missing upstream`);
      return { word, entry: undefined };
    }
    throw err;
  }
}

async function handleHealth(): Promise<{ status: string; service: string }> {
  return { status: "ok", service: "grpc-from-zero" };
}

export function registerRoutes(router: ConnectRouter) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router.service(DictionaryService, {
    define: handleDefine,
    wordOfTheDay: handleWordOfTheDay,
    health: handleHealth,
  } as never);
}
