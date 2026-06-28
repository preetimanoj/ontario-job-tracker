// src/config/app.config.ts
// Central application configuration.
// Values come from environment variables where sensitive,
// or fall back to safe defaults for development.

import path from "path";
import { ScraperConfig } from "../types";

// --- Scraper Settings ---
export const SCRAPER_CONFIG: ScraperConfig = {
  // Wait up to 30 seconds for a page to load
  timeoutMs: 30_000,

  // Wait 2 seconds between requests — respectful to servers
  // In production we might increase this to 3-5 seconds
  delayMs: 2_000,

  // true = browser runs invisibly (production)
  // false = you see the browser open (useful for debugging scrapers)
  headless: process.env.NODE_ENV !== "development",
};

// --- File Storage Settings ---
export const STORAGE_CONFIG = {
  // Where we save job snapshots (today's jobs, yesterday's jobs)
  snapshotsDir: path.join(process.cwd(), "data", "snapshots"),

  // Where we save generated reports
  reportsDir: path.join(process.cwd(), "reports"),

  // How many days of snapshots to keep before deleting old ones
  retentionDays: 7,
} as const;

// --- Email Settings ---
// All sensitive values come from .env — never hardcode passwords
export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM ?? "",
  to: process.env.EMAIL_TO ?? "",
  smtpHost: process.env.EMAIL_SMTP_HOST ?? "smtp.gmail.com",
  smtpPort: Number(process.env.EMAIL_SMTP_PORT ?? "587"),
  smtpUser: process.env.EMAIL_SMTP_USER ?? "",
  smtpPass: process.env.EMAIL_SMTP_PASS ?? "",
} as const;

// --- Logging Settings ---
export const LOG_CONFIG = {
  // 'debug' | 'info' | 'warn' | 'error'
  level: process.env.LOG_LEVEL ?? "info",

  // Include timestamps in log output
  timestamps: true,
} as const;

// --- App-wide Settings ---
export const APP_CONFIG = {
  name: "Ontario Public Sector Job Tracker",
  version: "1.0.0",
  environment: process.env.NODE_ENV ?? "development",
} as const;
