# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:10 as build-stage

# set working dir
WORKDIR /app

# Set the package files first, so they can be cached
COPY client/package*.json ./

# install npm dependencies, should be cached
RUN npm install

# Copy the angular client code
COPY client/ ./

# compile the angular project
RUN npm run build

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:latest

# Copy the compildes app to nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy the nginx.conf
COPY nginx/nginx.conf /etc/nginx/nginx.conf
