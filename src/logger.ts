const IsDev = process.env.NODE_ENV === 'development';

export function debug(message: string, ...args: Array<unknown>): void {
  if (IsDev) {
    // eslint-disable-next-line no-console
    console.debug(`Debug: ${message}`, ...args);
  }
}

export function info(message: string, ...args: Array<unknown>): void {
  // eslint-disable-next-line no-console
  console.info(message, ...args);
}

export function log(message: string, ...args: Array<unknown>): void {
  // eslint-disable-next-line no-console
  console.log(message, ...args);
}

export function warn(message: string, ...args: Array<unknown>): void {
  // eslint-disable-next-line no-console
  console.warn(message, ...args);
}