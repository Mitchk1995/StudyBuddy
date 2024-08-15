// study-buddy/client/src/utils/logger.ts

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private static log(level: LogLevel, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    console[level](`[${timestamp}] [${level.toUpperCase()}]:`, message, ...args);
  }

  static info(message: string, ...args: any[]) {
    this.log('info', message, ...args);
  }

  static warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args);
  }

  static error(message: string, ...args: any[]) {
    this.log('error', message, ...args);
  }

  static debug(message: string, ...args: any[]) {
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', message, ...args);
    }
  }
}

export const logger = Logger;