// src/services/comparison.service.ts
// Compares two sets of jobs and identifies what's new, what's gone,
// and what's unchanged. The core logic of the entire system.

import { Job, JobSnapshot } from "../types";
import { createLogger } from "../utils";

export interface ComparisonResult {
  // Jobs that exist today but not yesterday — these get emailed
  newJobs: Job[];

  // Jobs that existed yesterday but not today — position may be filled
  removedJobs: Job[];

  // Jobs that exist in both snapshots — unchanged
  persistingJobs: Job[];

  // Metadata
  totalToday: number;
  totalYesterday: number;
  comparedAt: string;
}

export class ComparisonService {
  private readonly logger = createLogger("ComparisonService");

  // Main comparison method
  // Takes today's and yesterday's snapshots, returns what changed
  compare(
    todaySnapshot: JobSnapshot,
    previousSnapshot: JobSnapshot | null,
  ): ComparisonResult {
    const todayJobs = todaySnapshot.jobs;

    // If there's no previous snapshot, everything is "new"
    // This happens on the very first run
    if (previousSnapshot === null) {
      this.logger.info(
        "No previous snapshot — treating all jobs as new (first run)",
      );

      return {
        newJobs: todayJobs,
        removedJobs: [],
        persistingJobs: [],
        totalToday: todayJobs.length,
        totalYesterday: 0,
        comparedAt: new Date().toISOString(),
      };
    }

    const previousJobs = previousSnapshot.jobs;

    // Build a Set of yesterday's job IDs for O(1) lookup
    // Using a Set instead of array.find() means lookups are instant
    // regardless of how many jobs we have — important at scale
    const previousJobIds = new Set(previousJobs.map((job) => job.id));
    const todayJobIds = new Set(todayJobs.map((job) => job.id));

    // New jobs — in today but NOT in yesterday
    const newJobs = todayJobs.filter((job) => !previousJobIds.has(job.id));

    // Removed jobs — in yesterday but NOT in today
    const removedJobs = previousJobs.filter((job) => !todayJobIds.has(job.id));

    // Persisting jobs — in both today and yesterday
    const persistingJobs = todayJobs.filter((job) =>
      previousJobIds.has(job.id),
    );

    this.logger.info(
      `Comparison complete — ` +
        `${newJobs.length} new, ` +
        `${removedJobs.length} removed, ` +
        `${persistingJobs.length} persisting`,
    );

    // Log each new job so we can see them in the console
    if (newJobs.length > 0) {
      this.logger.info("--- NEW JOBS ---");
      newJobs.forEach((job) => {
        this.logger.info(`  ✓ ${job.title} | ${job.employer}`);
      });
    } else {
      this.logger.info("No new jobs since last run");
    }

    return {
      newJobs,
      removedJobs,
      persistingJobs,
      totalToday: todayJobs.length,
      totalYesterday: previousJobs.length,
      comparedAt: new Date().toISOString(),
    };
  }

  // Compare across multiple employers and merge results
  // Used by the orchestrator when running all scrapers
  mergeComparisons(results: ComparisonResult[]): ComparisonResult {
    const merged: ComparisonResult = {
      newJobs: [],
      removedJobs: [],
      persistingJobs: [],
      totalToday: 0,
      totalYesterday: 0,
      comparedAt: new Date().toISOString(),
    };

    for (const result of results) {
      merged.newJobs.push(...result.newJobs);
      merged.removedJobs.push(...result.removedJobs);
      merged.persistingJobs.push(...result.persistingJobs);
      merged.totalToday += result.totalToday;
      merged.totalYesterday += result.totalYesterday;
    }

    this.logger.info(
      `Merged ${results.length} employer comparisons — ` +
        `${merged.newJobs.length} total new jobs`,
    );

    return merged;
  }
}
