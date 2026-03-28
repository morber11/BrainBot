FROM node:18-bookworm-slim AS build

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
FROM node:18-bookworm-slim
WORKDIR /app

# Install runtime OS deps if needed
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    libsqlite3-0 \
    libopus0 \
  && rm -rf /var/lib/apt/lists/*

# Copy app and node_modules from build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app .

ENV NODE_ENV=production

# Use npm start as the default command
CMD ["npm", "start"]
