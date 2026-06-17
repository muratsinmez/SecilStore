# 1. Aşama: React kodlarını derleme
FROM node:22-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. Aşama: Nginx ile sunma
FROM nginx:alpine
# React'in derlenmiş halini Nginx klasörüne kopyala
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]