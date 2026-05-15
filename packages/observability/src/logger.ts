import { redactSensitiveFields } from "./redaction";
import { getRequestId } from "./correlation";
import { serializeError } from "./errors";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  error?: Record<string, unknown>;
  [key: string]: unknown;
}

export class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = "info") {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error"];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
    };
    
    const reqId = getRequestId();
    if (reqId) {
      entry.requestId = reqId;
    }

    if (meta) {
      // Redact sensitive data before logging
      const safeMeta = redactSensitiveFields(meta) as Record<string, unknown>;
      
      for (const key in safeMeta) {
        if (key === "error") {
          entry.error = serializeError(safeMeta[key]);
        } else {
          entry[key] = safeMeta[key];
        }
      }
    }

    const output = JSON.stringify(entry);

    if (level === "error") {
      console.error(output);
    } else if (level === "warn") {
      console.warn(output);
    } else if (level === "debug") {
      console.debug(output);
    } else {
      console.log(output);
    }
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.log("info", message, meta);
  }

  error(message: string, meta?: Record<string, unknown>) {
    this.log("error", message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.log("warn", message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>) {
    this.log("debug", message, meta);
  }
}

export const logger = new Logger(
  (process.env.LOG_LEVEL as LogLevel) || "info"
);
