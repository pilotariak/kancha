const TAG = "[kancha]";

function debug(message: string, ...args: unknown[]): void {
  if (__DEV__) {
    console.debug(`${TAG} ${message}`, ...args);
  }
}

function info(message: string, ...args: unknown[]): void {
  if (__DEV__) {
    console.info(`${TAG} ${message}`, ...args);
  }
}

function warn(message: string, ...args: unknown[]): void {
  if (__DEV__) {
    console.warn(`${TAG} ${message}`, ...args);
  }
}

function error(message: string, ...args: unknown[]): void {
  console.error(`${TAG} ${message}`, ...args);
}

function startPerformanceMark(name: string): void {
  if (__DEV__) {
    performance.mark(`${name}:start`);
  }
}

function endPerformanceMark(name: string): void {
  if (__DEV__) {
    performance.mark(`${name}:end`);
    performance.measure(name, `${name}:start`, `${name}:end`);
  }
}

export const logger = {
  debug,
  info,
  warn,
  error,
  startPerformanceMark,
  endPerformanceMark,
};
