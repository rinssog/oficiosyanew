# syntax=docker/dockerfile:1
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci
# Generar Prisma client durante el build (no requiere DB)
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY ./.env.example ./.env
EXPOSE 4000
CMD ["node","dist/index.js"]
