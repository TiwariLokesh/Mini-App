# syntax=docker/dockerfile:1.6
FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=base /app/dist ./dist
COPY --from=base /app/src ./src
COPY ./.env.example ./

EXPOSE 4000
CMD ["node", "dist/index.js"]
