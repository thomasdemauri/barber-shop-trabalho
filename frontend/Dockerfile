FROM node:22-alpine AS build

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
ARG VITE_API_URL=http://localhost:3000/api
ARG VITE_PROD=false
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_PROD=$VITE_PROD
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf.template /etc/nginx/templates/default.conf.template
ENV BACKEND_INTERNAL_URL=http://backend:3000
EXPOSE 80
