# ---- Stage 1: install production dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Stage 2: minimal runtime image ----
FROM node:20-alpine AS runtime
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app

# Copy installed dependencies and only the files needed to run the server
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json server.js ./

# Run as the unprivileged "node" user that ships with the base image
USER node

EXPOSE 3000

# Lightweight healthcheck against the times API (no Azure key required)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider "http://localhost:${PORT}/api/times" || exit 1

CMD ["node", "server.js"]
