// STEP 6 — HTTP server. Mounts the Connect-RPC handler on /, plus a
//   plain JSON /health route for Render's liveness probe.
//
//   We use connectNodeAdapter with raw `http.createServer` rather than
//   Express because Connect-RPC v2 streams large responses chunked, and
//   most Express middleware (especially body parsers) interfere with
//   that. The few sibling routes we need (/health and /) are easy to
//   write inline.

import { createServer } from "node:http";
import { connectNodeAdapter } from "@connectrpc/connect-node";
import { registerRoutes } from "./service.js";

const PORT = Number(process.env.PORT ?? 4000);

const handler = connectNodeAdapter({
  routes: registerRoutes,
  // Disable strict gRPC HTTP/2 requirement — Connect protocol over HTTP/1.1
  // is what the browser uses, and we want both protocols on the same port.
});

const server = createServer((req, res) => {
  const url = req.url ?? "/";

  if (url === "/health") {
    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ status: "ok", service: "grpc-from-zero" }));
    return;
  }

  if (url === "/" && req.method === "GET") {
    res.statusCode = 200;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end(
      "grpc-from-zero — Day 26 of TechFromZero.\n" +
        "Connect-RPC service: /dictionary.v1.DictionaryService/*\n" +
        "Health: /health\n"
    );
    return;
  }

  // Everything else (Connect, gRPC, gRPC-Web) goes to the Connect handler.
  handler(req, res);
});

// Graceful shutdown so Render's SIGTERM doesn't truncate in-flight calls.
function shutdown(signal: string) {
  console.log(`${signal} received — closing server`);
  server.close(() => process.exit(0));
  // Hard-fail after 10 s if a connection refuses to drain.
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

server.listen(PORT, "0.0.0.0", () => {
  console.log(`grpc-from-zero ready on http://0.0.0.0:${PORT}`);
});
