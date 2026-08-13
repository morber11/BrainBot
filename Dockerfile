FROM node:22-bookworm-slim AS build

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    python3 \
    python-is-python3 \
    build-essential \
    make \
    g++ \
    libsqlite3-dev \
    libopus-dev \
    pkg-config \
    git \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# install dependencies
COPY package*.json ./
# Force building sqlite3 from source to avoid prebuilt binaries requiring newer glibc
ENV npm_config_build_from_source=true
ENV PYTHON=python3

  RUN set -eux; \
  npm ci --unsafe-perm --verbose || ( \
    echo "--- NPM install failed; printing npm debug logs ---"; \
    ls -la /root/.npm/_logs || true; \
    for f in /root/.npm/_logs/*.log; do \
      echo "--- $f ---"; cat "$f"; \
    done || true; \
    exit 1; \
  ); \
  # Ensure sqlite3 native module is rebuilt against this image's glibc
  npm rebuild sqlite3 --build-from-source --unsafe-perm || ( \
    echo "--- npm rebuild sqlite3 failed; printing npm debug logs ---"; \
    ls -la /root/.npm/_logs || true; \
    for f in /root/.npm/_logs/*.log; do \
      echo "--- $f ---"; cat "$f"; \
    done || true; \
    exit 1; \
  )

# copy source
COPY . .

# prune dev dependencies for production image
RUN npm prune --production

# Runtime image
FROM node:22-bookworm-slim
WORKDIR /app

ARG TARGETARCH
ARG YT_DLP_VERSION=2026.07.04

# Install runtime OS deps if needed
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    libsqlite3-0 \
    libopus0 \
    ca-certificates \
    curl \
  && case "$TARGETARCH" in \
    amd64) YT_DLP_ASSET="yt-dlp_linux"; YT_DLP_SHA="6bbb3d314cde4febe36e5fa1d55462e29c974f63444e707871834f6d8cc210ae" ;; \
    arm64) YT_DLP_ASSET="yt-dlp_linux_aarch64"; YT_DLP_SHA="b6ce97646773070d7a7ffd6bbbdcaecb47c48483909c54c915bf08a7a9b5e0b1" ;; \
    *) echo "Unsupported Docker architecture: $TARGETARCH"; exit 1 ;; \
  esac \
  && curl -fsSL "https://github.com/yt-dlp/yt-dlp/releases/download/${YT_DLP_VERSION}/${YT_DLP_ASSET}" -o /usr/local/bin/yt-dlp \
  && echo "$YT_DLP_SHA  /usr/local/bin/yt-dlp" | sha256sum -c - \
  && chmod 755 /usr/local/bin/yt-dlp \
  && rm -rf /var/lib/apt/lists/*

# Copy app and node_modules from build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app .

ENV NODE_ENV=production

# Use npm start as the default command
CMD ["npm", "start"]
