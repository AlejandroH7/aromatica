#!/bin/sh
set -e

# Si se pasan argumentos (ej: docker compose run web npx prisma migrate status), ejecutarlos tal cual.
if [ "$#" -gt 0 ]; then
  exec "$@"
fi

echo "Esperando a Postgres y aplicando migraciones..."
until npx prisma migrate deploy; do
  echo "Postgres no disponible todavía, reintentando en 2s..."
  sleep 2
done

# El seed NO corre automáticamente (borra todos los datos). Ejecutar a mano: npm run db:seed

# Mejora de Ivan: producción con `next start` sobre el build de la imagen (antes `next dev`). Prisma Client ya se generó en el build.
exec npm start
