import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { logger } from './logger';

interface ErrorResponse {
  error: string;
  requestId?: string;
  stack?: string;
}

const isProduction = process.env.NODE_ENV === 'production';

// Códigos de error conocidos de Prisma → status HTTP y mensaje genérico
const PRISMA_ERRORS: Record<string, { status: number; message: string }> = {
  P2002: { status: 409, message: 'This resource already exists' },
  P2025: { status: 404, message: 'Resource not found' },
  P2003: { status: 409, message: 'Invalid reference to related resource' },
};

const getPrismaError = (error: Error) =>
  error instanceof Prisma.PrismaClientKnownRequestError ? PRISMA_ERRORS[error.code] : undefined;

// Mapeo de tipos de error a mensajes genéricos seguros
const getGenericMessage = (error: Error): string => {
  // Mensaje por defecto seguro
  if (error.name === 'ValidationError') {
    return 'Invalid input data';
  }
  if (error.name === 'UnauthorizedError') {
    return 'Authentication failed';
  }
  if (error.name === 'ForbiddenError') {
    return 'Access denied';
  }
  if (error.name === 'NotFoundError') {
    return 'Resource not found';
  }
  const prismaError = getPrismaError(error);
  if (prismaError) {
    return prismaError.message;
  }
  return 'An unexpected error occurred';
};

const getStatusCode = (error: Error): number => {
  if (error.name === 'ValidationError') return 400;
  if (error.name === 'UnauthorizedError') return 401;
  if (error.name === 'ForbiddenError') return 403;
  if (error.name === 'NotFoundError') return 404;
  const prismaError = getPrismaError(error);
  if (prismaError) return prismaError.status;
  return 500;
};

export const apiError = (e: unknown, requestId?: string) => {
  // Normalizar error
  const error = e instanceof Error ? e : new Error(String(e));
  const statusCode = getStatusCode(error);

  // Loguear internamente (SIEMPRE con stack trace)
  logger.error('HTTP Error occurred', error, {
    statusCode,
    errorName: error.name,
    requestId,
  });

  // Construir respuesta según ambiente
  const response: ErrorResponse = {
    error: isProduction ? getGenericMessage(error) : error.message,
  };

  // En desarrollo, incluir stack y requestId
  if (!isProduction) {
    response.stack = error.stack;
  }

  if (requestId) {
    response.requestId = requestId;
  }

  return NextResponse.json(response, { status: statusCode });
};

// Exportar para uso en middleware/API routes
export const errorHandler = (err: Error, statusCode = 500) => {
  // Loguear internamente
  logger.error('API Error', err, { statusCode });

  const response: ErrorResponse = {
    error: isProduction ? 'An unexpected error occurred' : err.message,
  };

  if (!isProduction) {
    response.stack = err.stack;
  }

  return {
    status: statusCode,
    body: response,
  };
};
