FROM node:18.13 as build
ENV NODE_VERSION=18.13.0

WORKDIR /app

COPY client/package.json .
COPY client/package-lock.json .
RUN npm ci

COPY client /app/

# compile the angular project
RUN npm run build

FROM nginx:latest
COPY --from=build /app/dist/client /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf

LABEL org.opencontainers.image.title="OpenSlides Client"
LABEL org.opencontainers.image.description="Web client for OpenSlides which serves as the users main interaction point while using the OpenSlides system. "
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/OpenSlides/openslides-client"
