FROM node:22.14 as build
ENV NODE_VERSION=20.14.0

WORKDIR /app

COPY client/package.json .
COPY client/package-lock.json .
RUN npm ci

COPY client /app/

ARG VERSION=dev
RUN if [ -n "$VERSION" ]; then echo "$VERSION ($(date +%Y-%m-%d))" > src/assets/version.txt; fi

# compile the angular project
RUN npm run build

FROM nginx:latest
COPY --from=build /app/dist/client/browser /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf

LABEL org.opencontainers.image.title="OpenSlides Client"
LABEL org.opencontainers.image.description="Web client for OpenSlides which serves as the users main interaction point while using the OpenSlides system. "
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/OpenSlides/openslides-client"
