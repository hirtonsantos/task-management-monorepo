/* eslint-disable */
import { Injectable } from "@nestjs/common"

@Injectable()
export class LoggerService {
  private formatTimestamp(): string {
    return new Date().toISOString()
  }

  log(message: string, data?: any): void {
    console.log(`[${this.formatTimestamp()}] [INFO] ${message}`, data ? JSON.stringify(data, null, 2) : "")
  }

  warn(message: string, data?: any): void {
    console.warn(`[${this.formatTimestamp()}] [WARN] ${message}`, data ? JSON.stringify(data, null, 2) : "")
  }

  error(message: string, error?: any): void {
    console.error(
      `[${this.formatTimestamp()}] [ERROR] ${message}`,
      error instanceof Error ? { message: error.message, stack: error.stack } : error,
    )
  }

  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[${this.formatTimestamp()}] [DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : "")
    }
  }
}
