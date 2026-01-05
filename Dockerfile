FROM node:22.21-alpine AS base

## Setup
ARG CONTEXT
ENV NODE_VERSION=22.17.0
ENV APP_CONTEXT=${CONTEXT}

## Packages
COPY packages /packages

WORKDIR /packages/openslides-motion-diff
RUN npm ci && \
    npm run build

## Installs
WORKDIR /app
COPY client/package.json .
COPY client/package-lock.json .
RUN npm ci

COPY client ./

## Command
COPY ./dev/command.sh ./
RUN chmod +x command.sh
CMD ["./command.sh"]

# Development Image
FROM base AS dev

COPY ./meta ./meta

RUN apk add --no-cache git

# Testing Image

FROM dev AS tests

# Production Image
FROM base AS build

ARG VERSION=dev
RUN [ -n "$VERSION" ] && echo "$VERSION ($(date +%Y-%m-%d))" >src/assets/version.txt || true

# compile the angular project
RUN npm run build

# Prod wants nginx as base image for some reason
FROM nginx:1.29.4 AS prod

## Setup
ARG CONTEXT
ENV APP_CONTEXT=prod
# User is given by nginx image

LABEL org.opencontainers.image.title="OpenSlides Client"
LABEL org.opencontainers.image.description="Web client for OpenSlides which serves as the users main interaction point while using the OpenSlides system. "
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/OpenSlides/openslides-client"

COPY --from=build /app/dist/client/browser /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf
