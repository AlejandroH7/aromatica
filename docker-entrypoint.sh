#!/bin/sh
set -e

echo "Esperando a Postgres..."
until npx prisma db push --skip-generate; do
  echo "Postgres no disponible todavía, reintentando en 2s..."
  sleep 2
done

npx prisma generate

npm run db:seed || echo "El seed falló; se continúa con el arranque."

exec npm run dev
