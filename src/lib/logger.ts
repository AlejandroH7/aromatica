import { writeFileSync, existsSync, mkdirSync, appendFileSync } from 'fs';
import { join } from 'path';

const LOG_DIR = join(process.cwd(), 'logs');
const ERROR_LOG = join(LOG_DIR, 'errors.log');

// Crear directorio de logs si no existe
if (!existsSync(LOG_DIR)) {
  try {
    mkdirSync(LOG_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create logs directory:', err);
  }
}

interface LogEntry {
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO';
  message: string;
  stack?: string;
  metadata?: Record<string, unknown>;
}

export const logger = {
  error: (message: string, error?: Error, metadata?: Record<string, unknown>) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      stack: error?.stack,
      metadata,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${entry.timestamp}] ${message}`, error, metadata);
    }

    // Write to file
    try {
      appendFileSync(
        ERROR_LOG,
        JSON.stringify(entry) + '\n',
        { encoding: 'utf-8' }
      );
    } catch (err) {
      console.error('Failed to write error log:', err);
    }
  },

  warn: (message: string, metadata?: Record<string, unknown>) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      metadata,
    };

    try {
      appendFileSync(
        ERROR_LOG,
        JSON.stringify(entry) + '\n',
        { encoding: 'utf-8' }
      );
    } catch (err) {
      console.error('Failed to write warn log:', err);
    }
  },

  info: (message: string, metadata?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, metadata);
    }
  },
};
