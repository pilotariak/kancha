const IS_DEV = process.env.NODE_ENV !== "production";

const marks: Record<string, number> = {};

export const logger = {
  debug: (message: string, data?: unknown) => {
    if (IS_DEV) console.debug(`[kancha] ${message}`, data ?? "");
  },
  info: (message: string, data?: unknown) => {
    if (IS_DEV) console.info(`[kancha] ${message}`, data ?? "");
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`[kancha] ${message}`, data ?? "");
  },
  error: (message: string, data?: unknown) => {
    console.error(`[kancha] ${message}`, data ?? "");
  },
  startPerformanceMark: (name: string) => {
    marks[name] = Date.now();
  },
  endPerformanceMark: (name: string) => {
    const start = marks[name];
    if (start !== undefined) {
      const ms = Date.now() - start;
      if (IS_DEV) console.debug(`[kancha] ⏱ ${name}: ${ms}ms`);
      delete marks[name];
    }
  },
};
