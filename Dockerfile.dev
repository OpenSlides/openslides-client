# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:10 as build-stage

WORKDIR /app
ARG REPOSITORY_URL=https://github.com/OpenSlides/openslides-client.git
ARG GIT_CHECKOUT=master
RUN git clone --no-checkout -- $REPOSITORY_URL .
RUN git checkout $GIT_CHECKOUT

# install npm dependencies, should be cached
WORKDIR /app/client
RUN npm install

# compile the angular project
RUN npm run build

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:latest

# Copy the compildes app to nginx
COPY --from=build-stage /app/client/dist /usr/share/nginx/html

# Copy the nginx.conf
COPY --from=build-stage /app/nginx/nginx.conf /etc/nginx/nginx.conf
