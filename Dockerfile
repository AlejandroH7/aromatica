# Mejora de Ivan: build multi-stage para producción (antes corría `next dev` con el código montado).

# 1) deps: instala dependencias exactas del lockfile
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2) builder: genera Prisma Client y compila Next (sin secretos: .env no entra a la imagen)
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3) runner: solo lo necesario para `next start` y `prisma migrate deploy`
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
# Mejora de Ivan: NODE_ENV=production desactiva el stack trace en las respuestas de error.
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder --chown=node:node /app/package.json /app/package-lock.json /app/next.config.js ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/prisma ./prisma
RUN mkdir -p logs && chown node:node logs

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Mejora de Ivan: el proceso corre sin root.
USER node

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
