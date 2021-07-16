FROM node:16 as build

WORKDIR /app

COPY client/package.json .
COPY client/package-lock.json .
RUN npm ci
RUN npm run postinstall

COPY client /app/

# compile the angular project
RUN npm run build

FROM nginx:latest
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf
