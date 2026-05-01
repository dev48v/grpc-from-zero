import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, Vite serves the client on 5173 and proxies /dictionary.v1.* RPC
// calls to the Connect-RPC server on 4000 — that way the React code uses
// a relative URL in BOTH dev and prod.
//
// In prod, the client uses VITE_RPC_URL (e.g. https://grpc-from-zero
// .onrender.com) baked at build time on Vercel.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/dictionary.v1.": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
