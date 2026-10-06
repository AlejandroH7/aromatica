/**
 * ARCHIVO DE EJEMPLO: Cómo usar el nuevo error handler seguro
 * NO BORRAR: Este archivo documenta las mejores prácticas
 *
 * Ubicación real: src/app/api/[endpoint]/route.ts
 */

import { NextResponse } from 'next/server';
import { apiError, errorHandler } from '@/lib/errorHandler';

// ✅ EJEMPLO 1: API Route simple con try-catch
export async function GET_EXAMPLE() {
  try {
    // tu lógica aquí
    throw new Error('Database connection failed');
  } catch (e) {
    return apiError(e);
  }
}

// ✅ EJEMPLO 2: Con errores personalizados
class AuthenticationError extends Error {
  name = 'UnauthorizedError';
  status = 401;

  constructor(message = 'Invalid credentials') {
    super(message);
  }
}

export async function POST_EXAMPLE(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      throw new AuthenticationError('Token is required');
    }

    // Lógica de verificación
    return NextResponse.json({ success: true });
  } catch (e) {
    // El errorHandler mapea UnauthorizedError → 401 + mensaje seguro
    return apiError(e);
  }
}

// ✅ EJEMPLO 3: Con RequestID para auditoría
export async function PUT_EXAMPLE(req: Request) {
  const requestId = req.headers.get('x-request-id') || 'unknown';

  try {
    // tu lógica
    return NextResponse.json({ success: true });
  } catch (e) {
    // Incluir requestId para poder correlacionar con logs
    return apiError(e, requestId);
  }
}

// ✅ EJEMPLO 4: Diferenciando errores conocidos vs desconocidos
class ValidationError extends Error {
  name = 'ValidationError';
  constructor(message: string) {
    super(message);
  }
}

class ResourceNotFoundError extends Error {
  name = 'NotFoundError';
  constructor(message: string) {
    super(message);
  }
}

export async function PATCH_EXAMPLE(req: Request) {
  try {
    const body = await req.json();

    // Validación
    if (!body.email || !body.email.includes('@')) {
      throw new ValidationError('Invalid email format');
    }

    // Búsqueda
    const product = null; // simulando producto no encontrado
    if (!product) {
      throw new ResourceNotFoundError('Product not found');
    }

    return NextResponse.json(product);
  } catch (e) {
    // Todos estos errores se mapean automáticamente:
    // ValidationError → "Invalid input data" (400)
    // NotFoundError → "Resource not found" (404)
    // Error desconocido → "An unexpected error occurred" (500)
    return apiError(e);
  }
}

// ✅ EJEMPLO 5: Usando errorHandler en server actions o funciones internas
export function internalService() {
  try {
    throw new Error('Internal service error');
  } catch (err) {
    const { status, body } = errorHandler(
      err as Error,
      500
    );

    // En desarrollo: { error: "Internal service error", stack: "..." }
    // En producción: { error: "An unexpected error occurred" }
    console.log(`[${status}]`, body);
  }
}

/**
 * MAPEO AUTOMÁTICO DE ERRORES:
 *
 * Error.name = 'ValidationError'
 *   → Mensaje: "Invalid input data"
 *   → Status: 400
 *
 * Error.name = 'UnauthorizedError'
 *   → Mensaje: "Authentication failed"
 *   → Status: 401
 *
 * Error.name = 'ForbiddenError'
 *   → Mensaje: "Access denied"
 *   → Status: 403
 *
 * Error.name = 'NotFoundError'
 *   → Mensaje: "Resource not found"
 *   → Status: 404
 *
 * error.message contiene "UNIQUE constraint failed"
 *   → Mensaje: "This resource already exists"
 *   → Status: 409
 *
 * error.message contiene "Foreign key constraint failed"
 *   → Mensaje: "Invalid reference to related resource"
 *   → Status: 422
 *
 * Cualquier otro error
 *   → Mensaje: "An unexpected error occurred"
 *   → Status: 500
 *
 * LOGGING:
 * - Todos los errores se registran en logs/errors.log
 * - En desarrollo también aparecen en console.error
 * - Stack trace completo siempre se almacena internamente
 */
