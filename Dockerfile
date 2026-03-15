FROM node:20-alpine AS base
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine AS production
COPY --from=base /app/dist /usr/share/nginx/html
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
