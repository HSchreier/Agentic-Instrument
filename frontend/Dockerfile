FROM node:22-slim as builder

WORKDIR /app/frontend

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-slim

WORKDIR /app/frontend

COPY --from=builder /app/frontend/dist ./dist
COPY --from=builder /app/frontend/package*.json ./
RUN npm ci --only=production

EXPOSE 3000

CMD ["npm", "run", "preview"]
