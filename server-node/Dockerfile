# syntax=docker/dockerfile:1
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
# Bust Docker layer cache when deps change (increment this value)
ARG CACHEBUST=2026052401
RUN npm install
# Generar Prisma client durante el build (no requiere DB en build time)
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
# Copiar datos iniciales (JSON seed) — Railway inyecta las env vars, no uses .env
COPY --from=build /app/data ./data
# El PORT lo inyecta Railway dinámicamente — no exponer fijo
EXPOSE 4000
CMD ["node","dist/index.js"]
