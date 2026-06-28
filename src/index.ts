// src/index.ts
import { rootLogger } from "./utils";
import { APP_CONFIG } from "./config";
import { TorontoScraper } from "./scrapers";
import { StorageService, ComparisonService } from "./services";

async function main(): Promise<void> {
  rootLogger.info(`${APP_CONFIG.name} v${APP_CONFIG.version}`);
  rootLogger.info(`Environment: ${APP_CONFIG.environment}`);

  const storage = new StorageService();
  const comparison = new ComparisonService();
  const scraper = new TorontoScraper();

  // Step 1 — Load yesterday's snapshot BEFORE scraping
  // We load it first so we have it ready for comparison
  const previousSnapshot = await storage.loadPreviousSnapshot(
    scraper.employerName,
  );

  // Step 2 — Run today's scrape
  const jobs = await scraper.scrape();

  // Step 3 — Build today's snapshot
  const todaySnapshot = {
    capturedAt: new Date().toISOString(),
    employer: scraper.employerName,
    jobs,
  };

  // Step 4 — Save today's snapshot to disk
  await storage.saveSnapshot(todaySnapshot);

  // Step 5 — Compare today vs yesterday
  const result = comparison.compare(todaySnapshot, previousSnapshot);

  // Step 6 — Report
  rootLogger.info(`--- SUMMARY ---`);
  rootLogger.info(`Today: ${result.totalToday} jobs`);
  rootLogger.info(`Yesterday: ${result.totalYesterday} jobs`);
  rootLogger.info(`New: ${result.newJobs.length} jobs`);
  rootLogger.info(`Removed: ${result.removedJobs.length} jobs`);
}

main().catch((error: unknown) => {
  rootLogger.error("Fatal error", error);
  process.exit(1);
});
