// src/services/storage.service.ts
// Handles all file system operations for job snapshots.
// Saves today's jobs, loads yesterday's jobs, cleans up old files.
// All other parts of the system talk to this service — never to the
// file system directly. This makes it easy to swap to SQLite later.

import fs from "fs";
import path from "path";
import { Job, JobSnapshot } from "../types";
import { STORAGE_CONFIG } from "../config";
import { createLogger } from "../utils";

export class StorageService {
  private readonly logger = createLogger("StorageService");
  private readonly snapshotsDir: string;

  constructor() {
    this.snapshotsDir = STORAGE_CONFIG.snapshotsDir;
    // Ensure the snapshots directory exists when service is created
    // recursive: true means it creates parent folders too if needed
    // and doesn't throw if the folder already exists
    this.ensureDirectoryExists(this.snapshotsDir);
  }

  // --- Public Methods ---

  // Save a snapshot of all jobs found for one employer in this run
  // filename format: 2026-06-28_city-of-toronto.json
  async saveSnapshot(snapshot: JobSnapshot): Promise<void> {
    const filename = this.buildSnapshotFilename(snapshot.employer);
    const filepath = path.join(this.snapshotsDir, filename);

    const json = JSON.stringify(snapshot, null, 2);

    // fs.promises.writeFile — the async version of writing a file
    // 'utf-8' specifies the text encoding
    await fs.promises.writeFile(filepath, json, "utf-8");

    this.logger.info(
      `Saved snapshot → ${filename} (${snapshot.jobs.length} jobs)`,
    );
  }

  // Load yesterday's snapshot for a given employer
  // Returns null if no snapshot exists (e.g. first run ever)
  async loadPreviousSnapshot(employer: string): Promise<JobSnapshot | null> {
    const filename = this.buildSnapshotFilename(employer, -1);
    const filepath = path.join(this.snapshotsDir, filename);

    // Check if the file exists before trying to read it
    if (!fs.existsSync(filepath)) {
      this.logger.info(
        `No previous snapshot found for ${employer} — first run`,
      );
      return null;
    }

    const json = await fs.promises.readFile(filepath, "utf-8");

    // Parse the JSON back into our JobSnapshot type
    // 'as JobSnapshot' tells TypeScript to trust us here
    // In a production system we'd validate this with a schema (e.g. zod)
    const snapshot = JSON.parse(json) as JobSnapshot;

    this.logger.info(
      `Loaded previous snapshot → ${filename} (${snapshot.jobs.length} jobs)`,
    );

    return snapshot;
  }

  // Load today's snapshot for a given employer
  // Returns null if today's scrape hasn't run yet
  async loadTodaySnapshot(employer: string): Promise<JobSnapshot | null> {
    const filename = this.buildSnapshotFilename(employer, 0);
    const filepath = path.join(this.snapshotsDir, filename);

    if (!fs.existsSync(filepath)) {
      return null;
    }

    const json = await fs.promises.readFile(filepath, "utf-8");
    return JSON.parse(json) as JobSnapshot;
  }

  // Delete snapshots older than STORAGE_CONFIG.retentionDays
  // Call this at the end of each run to keep disk usage low
  async cleanupOldSnapshots(): Promise<void> {
    const files = await fs.promises.readdir(this.snapshotsDir);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - STORAGE_CONFIG.retentionDays);

    let deleted = 0;

    for (const file of files) {
      // Skip non-JSON files
      if (!file.endsWith(".json")) continue;

      const filepath = path.join(this.snapshotsDir, file);
      const stats = await fs.promises.stat(filepath);

      // Compare file's last modified time to our cutoff date
      if (stats.mtime < cutoffDate) {
        await fs.promises.unlink(filepath);
        deleted++;
        this.logger.debug(`Deleted old snapshot: ${file}`);
      }
    }

    if (deleted > 0) {
      this.logger.info(`Cleaned up ${deleted} old snapshot(s)`);
    }
  }

  // List all snapshot files — useful for debugging
  async listSnapshots(): Promise<string[]> {
    const files = await fs.promises.readdir(this.snapshotsDir);
    return files.filter((f) => f.endsWith(".json")).sort();
  }

  // --- Private Helpers ---

  // Builds a consistent filename for a snapshot
  // dayOffset: 0 = today, -1 = yesterday, -2 = two days ago
  private buildSnapshotFilename(
    employer: string,
    dayOffset: number = 0,
  ): string {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);

    // Format date as YYYY-MM-DD
    const dateStr = date.toISOString().substring(0, 10);

    // Slugify the employer name for use in a filename
    // "City of Toronto" → "city-of-toronto"
    const employerSlug = employer
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

    return `${dateStr}_${employerSlug}.json`;
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      this.logger.info(`Created directory: ${dirPath}`);
    }
  }
}
