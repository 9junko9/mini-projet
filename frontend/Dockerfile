FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install && npm install -D @angular-devkit/build-angular@^18.0.0

COPY . .

EXPOSE 4200

CMD ["npm", "start"]
