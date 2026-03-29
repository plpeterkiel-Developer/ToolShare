import { APP_ENV, isDev } from '@/lib/env'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  environment: string
  timestamp: string
  [key: string]: unknown
}

function formatEntry(entry: LogEntry): string {
  if (isDev) {
    const extra = Object.keys(entry).filter(
      (k) => !['level', 'message', 'environment', 'timestamp'].includes(k)
    )
    const suffix =
      extra.length > 0
        ? ` ${JSON.stringify(Object.fromEntries(extra.map((k) => [k, entry[k]])))}`
        : ''
    return `[${entry.level.toUpperCase()}] ${entry.message}${suffix}`
  }
  return JSON.stringify(entry)
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  if (level === 'debug' && !isDev) return

  const entry: LogEntry = {
    level,
    message,
    environment: APP_ENV,
    timestamp: new Date().toISOString(),
    ...context,
  }

  const formatted = formatEntry(entry)

  switch (level) {
    case 'error':
      console.error(formatted)
      break
    case 'warn':
      console.warn(formatted)
      break
    case 'debug':
      console.debug(formatted)
      break
    default:
      console.log(formatted)
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => log('debug', message, context),
  info: (message: string, context?: Record<string, unknown>) => log('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => log('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => log('error', message, context),
}
