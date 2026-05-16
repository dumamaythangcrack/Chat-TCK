type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  timestamp: string;
  traceId?: string;
}

function formatLog(entry: LogEntry): string {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  const ctx = entry.context ? ` [${entry.context}]` : '';
  const data = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
  return `${prefix}${ctx} ${entry.message}${data}`;
}

function createLogEntry(level: LogLevel, message: string, context?: string, data?: Record<string, unknown>): LogEntry {
  return { level, message, context, data, timestamp: new Date().toISOString() };
}

export const logger = {
  debug(message: string, context?: string, data?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatLog(createLogEntry('debug', message, context, data)));
    }
  },
  info(message: string, context?: string, data?: Record<string, unknown>) {
    console.info(formatLog(createLogEntry('info', message, context, data)));
  },
  warn(message: string, context?: string, data?: Record<string, unknown>) {
    console.warn(formatLog(createLogEntry('warn', message, context, data)));
  },
  error(message: string, context?: string, data?: Record<string, unknown>) {
    console.error(formatLog(createLogEntry('error', message, context, data)));
  },
  /** Log API request with timing */
  api(method: string, path: string, status: number, durationMs: number, userId?: string) {
    const entry = createLogEntry(status >= 400 ? 'error' : 'info', `${method} ${path} → ${status} (${durationMs}ms)`, 'API', { userId });
    if (status >= 400) console.error(formatLog(entry));
    else console.info(formatLog(entry));
  },
};
