# STEP 7 — Multi-stage build for Render's free Docker tier.
#   Build context is the REPO ROOT (not server/) because the TS compiler
#   needs both server/src AND shared/gen to produce dist. The render.yaml
#   sets dockerContext: "." and dockerfilePath: "./server/Dockerfile".
#
#   Stage 1 compiles TS → JS. Stage 2 ships only the compiled output and
#   production deps, so the final image is ~200 MB and contains no dev
#   tooling, no .ts source, no buf, no codegen plugins.

# ---- Stage 1: build ------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy workspace manifests so npm can resolve the workspaces graph before
# any source is present — keeps `npm ci` layer-cacheable when only code
# (not deps) changes. We list the client manifest too because npm refuses
# to read package-lock.json with a missing workspace, but we only install
# the server workspace itself, plus root devDeps for buf-generated types.
COPY package.json package-lock.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/

RUN npm ci --workspace=server --include-workspace-root

# Now copy the source we actually compile.
COPY server/tsconfig.json ./server/
COPY server/src ./server/src
COPY shared ./shared

RUN npm run -w server build

# ---- Stage 2: runtime ----------------------------------------------------
FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

# Production deps only — no tsx, no @types/*, no typescript, no buf.
COPY package.json package-lock.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/
RUN npm ci --omit=dev --workspace=server --include-workspace-root \
  && npm cache clean --force

COPY --from=builder /app/server/dist ./server/dist

EXPOSE 4000
USER node
CMD ["node", "server/dist/server/src/index.js"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT:-4000}/health || exit 1
