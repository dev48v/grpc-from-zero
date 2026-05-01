// STEP 8 — Connect-RPC client setup.
//   ONE source of truth for the dictionary client. Components import this
//   `client` and call `client.define({ word })` etc. — fully typed from
//   the same .proto that drives the server.
//
//   The transport URL resolves in this order:
//     1. VITE_RPC_URL  (set on Vercel → https://grpc-from-zero.onrender.com)
//     2. window.location.origin (dev: Vite proxies /dictionary.v1.* → :4000)

import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";

import { DictionaryService } from "./gen/dictionary_pb";

const baseUrl =
  (import.meta.env.VITE_RPC_URL as string | undefined) ??
  (typeof window !== "undefined" ? window.location.origin : "");

const transport = createConnectTransport({
  baseUrl,
  // Use Connect protocol (HTTP/JSON over fetch) — works in every browser
  // without an Envoy proxy. gRPC-Web is also supported by toggling here.
  useBinaryFormat: false,
});

export const client = createClient(DictionaryService, transport);
