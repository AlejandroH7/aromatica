# Aromática

Tienda de perfumes construida con **Next.js 14 (App Router)**, **React 18**, **TypeScript**, **Tailwind CSS**, **Prisma** y **PostgreSQL 16**. Todo corre en Docker.

Este proyecto es una **prueba técnica**: la aplicación contiene vulnerabilidades de seguridad y malas prácticas sembradas a propósito.

## Objetivo

Encontrar y **corregir el mayor número posible** de vulnerabilidades de seguridad y malas prácticas, tanto de arquitectura como de base de datos. Puedes usar herramientas de IA, siempre que entiendas y puedas justificar cada hallazgo y cada corrección.

No se te dice cuántas hay ni dónde están. Revisa el código, prueba la aplicación y usa tus herramientas habituales.

## Pistas por categoría

Revisa al menos estas áreas (OWASP Top 10, 2021):

- A01: Broken Access Control
- A02: Cryptographic Failures
- A03: Injection
- A04: Insecure Design
- A05: Security Misconfiguration
- A06: Vulnerable and Outdated Components
- A07: Identification and Authentication Failures
- A08: Software and Data Integrity Failures
- A09: Security Logging and Monitoring Failures
- A10: Server-Side Request Forgery

Además:

- Arquitectura por capas
- Integridad de datos y concurrencia en compras

## Roles y credenciales de prueba

| Rol | Correo | Contraseña |
|-----|--------|-----------|
| ADMIN | admin@aromatica.gt | admin123 |
| CUSTOMER | cliente@aromatica.gt | 123456 |

## Cómo levantar el proyecto

```bash
docker compose up --build
```

La aplicación queda en http://localhost:3000. Al arrancar, el contenedor aplica el esquema de la base de datos y carga los datos de ejemplo. Para detenerla: `docker compose down` (con `-v` también se borran los datos).

Los cambios en `src/` y `prisma/` se recargan automáticamente. Si modificas dependencias, variables de entorno o la configuración de Next.js, vuelve a ejecutar `docker compose up --build`.

## Cómo entregar

1. Deja el **código corregido**.
2. Crea un archivo `HALLAZGOS.md` en la raíz que documente **cada falla encontrada**:
   - **Dónde** está (archivo y línea aproximada).
   - **Por qué** es un problema (impacto y cómo se podría abusar de ella).
   - **El fix** aplicado.
3. Comprueba que la aplicación sigue levantando con `docker compose up --build` y que sus funciones siguen operando.
