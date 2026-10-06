#!/bin/sh
set -e

echo "Esperando a Postgres..."
until npx prisma migrate deploy; do
  echo "Postgres no disponible todavía, reintentando en 2s..."
  sleep 2
done

npx prisma generate
npm run db:seed

exec npm run start
