ARG CONTEXT=prod
ARG NODE_IMAGE_VERSION=22.15

FROM node:${NODE_IMAGE_VERSION}-alpine as base

## Setup
ARG CONTEXT
ARG NODE_IMAGE_VERSION
ENV NODE_VERSION=${NODE_IMAGE_VERSION}.0
WORKDIR /app
ENV ${CONTEXT}=1

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

# Playwright Image

FROM mcr.microsoft.com/playwright:v1.52.0-jammy as playwright

WORKDIR /

COPY ./package.json .
COPY ./package-lock.json .
ENV CI=1
RUN npm ci


# Production Image
FROM base as build

ARG VERSION=dev
RUN if [ -n "$VERSION" ]; then echo "$VERSION ($(date +%Y-%m-%d))" > src/assets/version.txt; fi

# compile the angular project
RUN npm run build


# Prod wants nginx as base image for some reason
FROM nginx:latest as prod

WORKDIR /

# User is given by nginx image

LABEL org.opencontainers.image.title="OpenSlides Client"
LABEL org.opencontainers.image.description="Web client for OpenSlides which serves as the users main interaction point while using the OpenSlides system. "
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/OpenSlides/openslides-client"

COPY --from=build /app/dist/client/browser /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf
