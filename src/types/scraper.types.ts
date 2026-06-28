// src/types/scraper.types.ts
// Defines what every scraper in our system must look like.
// This is the "contract" all scrapers must follow.
// If a scraper doesn't follow this shape, TypeScript will refuse to compile.

import { Job } from "./job.types";

// Every scraper must implement this interface.
// Think of it as a job description for a scraper:
// "You must be able to tell us your name and return a list of jobs."
export interface Scraper {
  // Human-readable name e.g. "City of Toronto"
  readonly employerName: string;

  // The base URL of the careers page — useful for logging and debugging
  readonly baseUrl: string;

  // The main method — visits the careers page and returns all matching jobs.
  // It's async because network requests take time.
  // It returns a Promise<Job[]> — a list of jobs, possibly empty.
  scrape(): Promise<Job[]>;
}

// The result of running a scraper — includes metadata about the run
// so we can log what happened even if something went wrong
export interface ScraperResult {
  // Which employer this result is for
  employer: string;

  // Whether the scraper completed without errors
  success: boolean;

  // How many jobs were found
  jobsFound: number;

  // How long the scrape took in milliseconds
  durationMs: number;

  // All jobs found — empty array if scraper failed
  jobs: Job[];

  // Only present if success is false
  error?: string;
}

// Configuration for a scraper — passed in at construction time
// Keeps scrapers flexible without hardcoding values
export interface ScraperConfig {
  // How long to wait for a page to load before giving up (milliseconds)
  timeoutMs: number;

  // How long to wait between requests so we don't hammer servers
  delayMs: number;

  // Whether to run browser in headless mode (true = invisible, false = you see the browser)
  // Always true in production, false when debugging
  headless: boolean;
}
