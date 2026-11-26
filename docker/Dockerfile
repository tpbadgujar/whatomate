# Frontend build stage — commented out because UI is deployed separately
# FROM --platform=$BUILDPLATFORM node:22-alpine AS frontend-builder
#
# WORKDIR /app/frontend
#
# # Copy frontend dependency files first for caching
# COPY frontend/package.json frontend/package-lock.json ./
# RUN npm ci
#
# # Copy frontend source and build
# COPY frontend/ .
# RUN npm run build

# Go build stage — runs on BUILDPLATFORM, cross-compiles to TARGETOS/TARGETARCH
# so multi-arch builds don't emulate the Go toolchain under QEMU.
FROM --platform=$BUILDPLATFORM golang:1.26.0-alpine AS builder

ARG TARGETOS
ARG TARGETARCH

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git ca-certificates

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Embed frontend build into Go binary (commented out — UI deployed separately; internal/frontend/dist/.gitkeep keeps go:embed valid)
# COPY --from=frontend-builder /app/frontend/dist/ ./internal/frontend/dist/

# Build the binary
RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -a -installsuffix cgo -o whatomate ./cmd/whatomate

# Piper TTS download stage — commented out for faster builds when TTS is not needed
# FROM --platform=$BUILDPLATFORM debian:bookworm-slim AS piper-dl
# ARG TARGETARCH
# RUN apt-get update && apt-get install -y --no-install-recommends wget ca-certificates && rm -rf /var/lib/apt/lists/*
# RUN case "${TARGETARCH}" in \
#       amd64) PIPER_ARCH=x86_64 ;; \
#       arm64) PIPER_ARCH=aarch64 ;; \
#       *) echo "unsupported TARGETARCH: ${TARGETARCH}" >&2; exit 1 ;; \
#     esac \
#     && wget -q "https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_linux_${PIPER_ARCH}.tar.gz" -O /tmp/piper.tar.gz \
#     && tar xf /tmp/piper.tar.gz -C /tmp \
#     && rm /tmp/piper.tar.gz
# # Download default English voice model (~60MB)
# RUN mkdir -p /tmp/piper-models \
#     && wget -q https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx \
#        -O /tmp/piper-models/en_US-lessac-medium.onnx \
#     && wget -q https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json \
#        -O /tmp/piper-models/en_US-lessac-medium.onnx.json

# Final stage
FROM debian:bookworm-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates tzdata \
    && rm -rf /var/lib/apt/lists/*

# Copy binary from builder
COPY --from=builder /app/whatomate .

# Copy config example (will be overridden by env vars in production)
COPY --from=builder /app/config.example.toml ./config.toml

# Piper TTS binary + shared libraries + voice model (commented out)
# COPY --from=piper-dl /tmp/piper/piper /usr/local/bin/piper
# COPY --from=piper-dl /tmp/piper/lib*.so* /usr/local/lib/
# COPY --from=piper-dl /tmp/piper/espeak-ng-data /usr/share/espeak-ng-data
# RUN ldconfig
# COPY --from=piper-dl /tmp/piper-models /opt/piper/models

# Create directories
RUN mkdir -p /app/uploads /app/audio

# Expose port
EXPOSE 8080

# Match the GoReleaser image's launch convention so the same orchestrator
# args work against both tags: the binary is the ENTRYPOINT and CMD holds
# only the default subcommand/flags. A Nomad job that sets
# `args = ["server", "-migrate", ...]` (no `command`) then appends to the
# entrypoint instead of replacing the binary with "server".
ENTRYPOINT ["./whatomate"]
CMD ["server", "-config", "config.toml", "-migrate"]
