/**
 * Logging levels for the application.
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const isDev = __DEV__;

/**
 * Robust logging utility for React Native 2026.
 * - Supports log levels
 * - Environment aware (strips debug/info in production)
 * - Extensible for remote observability (e.g., Sentry)
 */
class Logger {
  private level: LogLevel = isDev ? LogLevel.DEBUG : LogLevel.WARN;

  /**
   * Log a debug message. Useful for development and tracing.
   */
  debug(message: string, ...args: any[]): void {
    if (this.canLog(LogLevel.DEBUG)) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Log an informational message.
   */
  info(message: string, ...args: any[]): void {
    if (this.canLog(LogLevel.INFO)) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Log a warning message.
   */
  warn(message: string, ...args: any[]): void {
    if (this.canLog(LogLevel.WARN)) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  /**
   * Log an error message.
   */
  error(message: string, ...args: any[]): void {
    if (this.canLog(LogLevel.ERROR)) {
      console.error(`[ERROR] ${message}`, ...args);
      // Future: Add Sentry.captureException(error) here
    }
  }

  /**
   * Track performance of an operation.
   * Useful for React Native DevTools Performance panel.
   */
  startPerformanceMark(name: string): void {
    if (isDev && typeof performance !== "undefined") {
      performance.mark(`${name}-start`);
    }
  }

  endPerformanceMark(name: string): void {
    if (isDev && typeof performance !== "undefined") {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      this.debug(`Performance for ${name}:`, performance.getEntriesByName(name).pop());
    }
  }

  private canLog(level: LogLevel): boolean {
    return level >= this.level;
  }
}

export const logger = new Logger();
