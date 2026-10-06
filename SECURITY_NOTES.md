# 🔐 Error Handling Security Guide

## ✅ Problema Resuelto: Stack Traces Expuestos

### Antes (❌ INSEGURO)
```typescript
export function apiError(e: unknown) {
  const err = e instanceof Error ? e : new Error(String(e));
  return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
}
```

**Riesgos:**
- Stack traces exponen rutas internas del servidor
- Revelan nombres de librerías y versiones
- Facilitan reconocimiento para ataque dirigido

---

## Después (✅ SEGURO)

### Sistema de 3 capas:

#### 1. **Logger** (`src/lib/logger.ts`)
- Registra errores completos internamente en `logs/errors.log`
- Incluye stack trace, timestamp, metadata
- Nunca expone información en HTTP response

#### 2. **Error Handler** (`src/lib/errorHandler.ts`)
- Revisa `NODE_ENV` en cada request
- **Producción**: Retorna mensajes genéricos + requestId
- **Desarrollo**: Retorna mensaje real + stack para debugging

#### 3. **API Response**
- Diferente según ambiente
- Request ID para correlacionar con logs

---

## 📋 Comportamiento por Ambiente

### 🏭 Producción (`NODE_ENV=production`)

```json
{
  "error": "An unexpected error occurred",
  "requestId": "abc123def456..."
}
```

**Stack trace:**
- ❌ NO se retorna en HTTP
- ✅ Se registra en `logs/errors.log`
- ✅ Disponible para debugging interno

---

### 🔨 Desarrollo (`NODE_ENV=development`)

```json
{
  "error": "Cannot read properties of undefined (reading 'id')",
  "stack": "TypeError: Cannot read properties...\n    at ProductService.getById...",
  "requestId": "abc123def456..."
}
```

**Stack trace:**
- ✅ Se retorna para debugging rápido
- ✅ Se loguea en archivo para auditoría
- ✅ Se imprime en consola

---

## 💻 Cómo Usar

### En API Routes

```typescript
import { apiError } from "@/lib/apiError";
import { authService, AuthError } from "@/server/services/authService";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const result = await authService.login(email, password);
    return NextResponse.json(result);
  } catch (e) {
    // Para errores personalizados conocidos
    if (e instanceof AuthError) {
      return NextResponse.json(
        { error: e.message },
        { status: e.status }
      );
    }
    // Para cualquier otro error
    return apiError(e);
  }
}
```

### Con Request ID para tracking

```typescript
// En casos donde necesites correlacionar con logs
import { apiError } from "@/lib/apiError";
const requestId = request.headers.get('x-request-id');
return apiError(error, requestId);
```

### Crear Errores Personalizados

```typescript
// Estos se mapean a mensajes seguros
class ValidationError extends Error {
  name = 'ValidationError';
  constructor(message: string) {
    super(message);
  }
}

class NotFoundError extends Error {
  name = 'NotFoundError';
  constructor(message: string) {
    super(message);
  }
}

// Uso
throw new ValidationError("Email is invalid");  // → "Invalid input data"
throw new NotFoundError("Product not found");   // → "Resource not found"
```

---

## 📊 Logging

### Archivo de Logs: `logs/errors.log`

Formato JSON (una línea por error):

```json
{"timestamp":"2026-10-06T10:30:45.123Z","level":"ERROR","message":"Database connection failed","stack":"Error: ECONNREFUSED 127.0.0.1:5432...","metadata":{"statusCode":500,"errorName":"Error","requestId":"abc123"}}
```

### Ver logs en tiempo real

```bash
# Cola de errores
tail -f logs/errors.log

# Filtrar errores específicos
grep "Authentication" logs/errors.log

# Contar errores por tipo
grep -o '"errorName":"[^"]*"' logs/errors.log | sort | uniq -c
```

---

## 🛡️ Checklist de Seguridad

- [x] Stack traces NO se exponen en producción
- [x] Mensajes de error son genéricos en producción
- [x] Request IDs permiten correlacionar con logs
- [x] Todos los errores se registran internamente
- [x] Logs incluyen stack trace completo
- [x] Headers de seguridad en todas las responses
- [x] NODE_ENV se verifica en cada request

---

## ⚠️ Reglas Importantes

1. **NUNCA** retornes `error.stack` directamente en producción
2. **SIEMPRE** usa `apiError()` o `errorHandler()` para capturar excepciones
3. **SIEMPRE** registra errores personalizados con `logger.error()`
4. **NUNCA** expongas rutas de archivos o nombres de BD en mensajes
5. **SIEMPRE** incluye `requestId` para auditoría

---

## 🔍 Debugging en Desarrollo

Si necesitas ver logs en desarrollo:

```typescript
import { logger } from "@/lib/logger";

logger.error("Custom error message", error, {
  userId: user.id,
  endpoint: "/api/checkout",
  step: "payment_processing"
});
```

Los logs aparecerán:
- En consola (durante ejecución)
- En `logs/errors.log` (persistente)

---

## 📞 Soporte

Para reportar nuevos tipos de error que merezcan mensajes seguros específicos,
actualiza el mapeo en `src/lib/errorHandler.ts` función `getGenericMessage()`.

Ejemplo:
```typescript
if (error.message.includes('payment_declined')) {
  return 'Payment could not be processed';
}
```
