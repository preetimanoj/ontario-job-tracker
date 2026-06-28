// src/scrapers/base.scraper.ts
// Abstract base class that all employer scrapers extend.
// Provides shared functionality: logging, filtering, delays,
// retry logic, and ID generation.
// Scrapers only need to implement the scrapeJobs() method.

import crypto from "crypto";
import { Job, Scraper, ScraperConfig, ScraperResult } from "../types";
import { matchesKeyword } from "../config/keywords.config";
import { SCRAPER_CONFIG } from "../config/app.config";
import { createLogger, Logger } from "../utils/logger";

// 'abstract' means you cannot do: new BaseScraper()
// You can only do: new TorontoScraper() which extends BaseScraper
export abstract class BaseScraper implements Scraper {
  // Every scraper gets its own logger with its name as context
  // e.g. logs will show [CityOfToronto] prefix
  protected readonly logger: Logger;

  // Config controls timeouts, delays, headless mode
  protected readonly config: ScraperConfig;

  // These two are required by the Scraper interface
  // 'abstract' means subclasses MUST provide these values
  abstract readonly employerName: string;
  abstract readonly baseUrl: string;

  constructor(config: ScraperConfig = SCRAPER_CONFIG) {
    this.config = config;
    // Logger context is set after construction once employerName is available
    // We use a temporary name here — subclasses can call this.logger after super()
    this.logger = createLogger(this.constructor.name);
  }

  // --- The Main Public Method ---
  // This is what the scraper runner calls.
  // It wraps scrapeJobs() with timing, error handling, and result formatting.
  // Subclasses never override this — they override scrapeJobs() instead.
  async scrape(): Promise<Job[]> {
    const startTime = Date.now();
    this.logger.scrapeStart(this.employerName);

    try {
      // Call the subclass implementation
      const rawJobs = await this.scrapeJobs();

      // Filter to only IT/software jobs
      const filteredJobs = this.filterByKeyword(rawJobs);

      const durationMs = Date.now() - startTime;
      this.logger.scrapeEnd(this.employerName, filteredJobs.length, durationMs);

      return filteredJobs;
    } catch (error: unknown) {
      this.logger.scrapeError(this.employerName, error);
      // Return empty array instead of throwing — one failed scraper
      // should not stop the entire run
      return [];
    }
  }

  // --- The Method Subclasses Must Implement ---
  // This is where each scraper puts its employer-specific logic.
  // It returns ALL jobs found — filtering happens in scrape() above.
  protected abstract scrapeJobs(): Promise<Job[]>;

  // --- Shared Helper Methods ---
  // These are available to all subclasses via 'this.'

  // Generates a stable unique ID for a job.
  // Built from employer + title + location so the same job
  // gets the same ID every run — critical for detecting duplicates.
  protected generateJobId(
    employer: string,
    title: string,
    location: string,
  ): string {
    const raw = `${employer}-${title}-${location}`.toLowerCase().trim();
    // MD5 hash gives us a short, consistent ID
    // We're not using this for security so MD5 is fine
    return crypto.createHash("md5").update(raw).digest("hex");
  }

  // Filters a list of jobs to only those matching our keywords
  protected filterByKeyword(jobs: Job[]): Job[] {
    const filtered = jobs.filter((job) => matchesKeyword(job.title));

    this.logger.debug(
      `Keyword filter: ${jobs.length} total → ${filtered.length} matched`,
    );

    return filtered;
  }

  // Pauses execution for a set time — prevents hammering servers
  // Usage: await this.delay() — uses config default
  // Usage: await this.delay(5000) — waits 5 seconds
  protected async delay(ms: number = this.config.delayMs): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Wraps a scrape attempt with automatic retry on failure
  // Usage: await this.withRetry(() => this.fetchPage(url))
  protected async withRetry<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delayMs: number = 2_000,
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error: unknown) {
        lastError = error;
        const message = error instanceof Error ? error.message : String(error);

        this.logger.warn(`Attempt ${attempt}/${retries} failed: ${message}`);

        // Don't wait after the last attempt
        if (attempt < retries) {
          await this.delay(delayMs * attempt); // Progressive delay: 2s, 4s, 6s
        }
      }
    }

    // All retries exhausted — throw the last error
    throw lastError;
  }

  // Builds a ScraperResult object — used by the orchestrator (coming later)
  // to track what happened across all scrapers in a run
  buildResult(jobs: Job[], durationMs: number, error?: string): ScraperResult {
    return {
      employer: this.employerName,
      success: error === undefined,
      jobsFound: jobs.length,
      durationMs,
      jobs,
      error,
    };
  }

  // Normalizes a date string — different sites format dates differently
  // e.g. "Jan 15, 2024" or "2024-01-15" or "January 15 2024"
  // We store a normalized ISO string for consistency
  protected normalizeDate(dateString: string): string {
    if (!dateString || dateString.trim() === "") {
      return new Date().toISOString();
    }

    const parsed = new Date(dateString);

    // If parsing failed, Date returns an Invalid Date object
    if (isNaN(parsed.getTime())) {
      this.logger.debug(`Could not parse date: "${dateString}" — using today`);
      return new Date().toISOString();
    }

    return parsed.toISOString();
  }
}
