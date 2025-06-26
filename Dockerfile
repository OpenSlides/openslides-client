ARG CONTEXT=prod
FROM node:22.16-alpine as base

## Setup
ARG CONTEXT
ENV NODE_VERSION=22.16.0
WORKDIR /app
ENV APP_CONTEXT=${CONTEXT}

## Installs
COPY client/package.json .
COPY client/package-lock.json .
RUN npm ci

COPY client ./

## External Information
LABEL org.opencontainers.image.title="OpenSlides Client"
LABEL org.opencontainers.image.description="Web client for OpenSlides which serves as the users main interaction point while using the OpenSlides system. "
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/OpenSlides/openslides-client"

## Command
COPY ./dev/command.sh ./
RUN chmod +x command.sh
CMD ["./command.sh"]

# Development Image
FROM base as dev

RUN apk add --no-cache git

# Testing Image

FROM dev as tests

# Production Image
FROM base as build

ARG VERSION=dev
RUN [ -n "$VERSION" ] && echo "$VERSION ($(date +%Y-%m-%d))" >src/assets/version.txt || true

# compile the angular project
RUN npm run build

# Prod wants nginx as base image for some reason
FROM nginx:1.28.0 as prod

WORKDIR /

# User is given by nginx image

LABEL org.opencontainers.image.title="OpenSlides Client"
LABEL org.opencontainers.image.description="Web client for OpenSlides which serves as the users main interaction point while using the OpenSlides system. "
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/OpenSlides/openslides-client"

COPY --from=build /app/dist/client/browser /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf
