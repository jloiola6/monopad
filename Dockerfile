FROM node:24-bookworm-slim AS monocode-host
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates build-essential python3 && rm -rf /var/lib/apt/lists/*
WORKDIR /src/monocode
ARG MONOCODE_COMMIT=98da85ae7c2b44c2f2427c17b381433ef4f23ea9
RUN git clone --filter=blob:none https://github.com/hardbeat920/monocode.git . && git checkout "$MONOCODE_COMMIT"
RUN npm ci && npm run host:build

FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends build-essential python3 git openssh-client ca-certificates procps && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends bash git openssh-client ca-certificates procps && rm -rf /var/lib/apt/lists/*
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=monocode-host /src/monocode/build/host /opt/monocode-host
COPY package.json package-lock.json ./
COPY public ./public
COPY server ./server
COPY scripts ./scripts
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod 0755 ./docker-entrypoint.sh
ENV NODE_ENV=production MONOPAD_HOST=127.0.0.1 MONOPAD_PORT=8787 MONOCODE_HOST_URL=http://127.0.0.1:3774
EXPOSE 8787
ENTRYPOINT ["./docker-entrypoint.sh"]
