FROM node:20-slim AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install && npm install -D @angular-devkit/build-angular@^18.0.0

COPY . .
RUN npx ng build

FROM nginx:1.27-alpine

COPY --from=build /app/dist/inventory-frontend /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
