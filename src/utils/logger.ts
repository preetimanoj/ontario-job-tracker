// src/utils/logger.ts
// A lightweight, colourful, timestamped logger.
// Used by every scraper, service, and utility in the system.
// Respects the LOG_LEVEL environment variable.

import { LOG_CONFIG } from "../config";

// --- Log Levels ---
// Each level has a numeric value so we can compare them.
// e.g. if LOG_LEVEL is 'warn', we skip 'debug' and 'info' messages.
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

// --- ANSI Colour Codes ---
// These are special character sequences that terminals interpret as colours.
// They work in your terminal and in GitHub Actions logs.
const COLOURS = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",

  // Log level colours
  debug: "\x1b[36m", // Cyan
  info: "\x1b[32m", // Green
  warn: "\x1b[33m", // Yellow
  error: "\x1b[31m", // Red

  // Context colour (the [ScraperName] prefix)
  context: "\x1b[35m", // Magenta

  // Timestamp colour
  time: "\x1b[2m", // Dim white
} as const;

// --- Label Formatting ---
// Fixed-width labels so log lines stay aligned in the terminal
const LEVEL_LABELS: Record<LogLevel, string> = {
  debug: "DEBUG",
  info: " INFO", // Leading space keeps alignment with DEBUG/ERROR
  warn: " WARN",
  error: "ERROR",
};

// --- Logger Class ---
export class Logger {
  // The context is shown in every log line so you know which
  // part of the system produced the message.
  // e.g. new Logger('CityOfToronto') → [CityOfToronto] message here
  private readonly context: string;

  // The minimum level to log — comes from LOG_CONFIG which reads .env
  private readonly minLevel: LogLevel;

  constructor(context: string) {
    this.context = context;
    this.minLevel = (LOG_CONFIG.level as LogLevel) ?? "info";
  }

  // --- Public Methods ---
  // One method per log level. Call these throughout the app.

  debug(message: string, ...args: unknown[]): void {
    this.log("debug", message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log("info", message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log("warn", message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    this.log("error", message, ...args);
  }

  // --- Convenience Methods ---
  // These are common patterns we'll use a lot in scrapers

  // Call at the start of a scrape
  scrapeStart(employerName: string): void {
    this.info(`Starting scrape → ${employerName}`);
  }

  // Call at the end of a scrape
  scrapeEnd(employerName: string, jobCount: number, durationMs: number): void {
    this.info(
      `Finished scrape → ${employerName} | ` +
        `${jobCount} jobs found | ` +
        `${(durationMs / 1000).toFixed(2)}s`,
    );
  }

  // Call when a scraper fails
  scrapeError(employerName: string, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.error(`Scrape failed → ${employerName} | ${message}`);
  }

  // --- Private Implementation ---

  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    // Skip this message if its level is below our minimum
    if (LOG_LEVELS[level] < LOG_LEVELS[this.minLevel]) {
      return;
    }

    const parts: string[] = [];

    // Timestamp — e.g. "2024-01-15 09:23:45"
    if (LOG_CONFIG.timestamps) {
      const timestamp = new Date()
        .toISOString()
        .replace("T", " ") // "2024-01-15T09:23:45.123Z" → "2024-01-15 09:23:45.123Z"
        .substring(0, 19); // Drop milliseconds and Z → "2024-01-15 09:23:45"
      parts.push(`${COLOURS.time}${timestamp}${COLOURS.reset}`);
    }

    // Level label — e.g. " INFO" or "ERROR"
    parts.push(`${COLOURS[level]}${LEVEL_LABELS[level]}${COLOURS.reset}`);

    // Context — e.g. "[CityOfToronto]"
    parts.push(`${COLOURS.context}[${this.context}]${COLOURS.reset}`);

    // Message
    parts.push(message);

    // Build the final log line
    const line = parts.join(" ");

    // Route to the correct console method
    // This matters because some tools (like GitHub Actions) treat
    // console.error output differently from console.log
    if (level === "error") {
      console.error(line, ...args);
    } else if (level === "warn") {
      console.warn(line, ...args);
    } else {
      console.log(line, ...args);
    }
  }
}

// --- Convenience Factory ---
// Instead of: const logger = new Logger('MyContext')
// You can write: const logger = createLogger('MyContext')
// Small thing but reads more naturally
export function createLogger(context: string): Logger {
  return new Logger(context);
}

// --- Root Logger ---
// A pre-built logger for the main index.ts and orchestrator
// so they don't have to instantiate their own
export const rootLogger = createLogger("App");
