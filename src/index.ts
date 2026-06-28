// src/index.ts
import { rootLogger } from "./utils";
import { APP_CONFIG } from "./config";
import { TorontoScraper } from "./scrapers";
import { StorageService } from "./services";

async function main(): Promise<void> {
  rootLogger.info(`${APP_CONFIG.name} v${APP_CONFIG.version}`);
  rootLogger.info(`Environment: ${APP_CONFIG.environment}`);

  const storage = new StorageService();
  const scraper = new TorontoScraper();

  // Run the scraper
  const jobs = await scraper.scrape();

  rootLogger.info(`Total IT jobs found: ${jobs.length}`);

  // Save today's snapshot
  await storage.saveSnapshot({
    capturedAt: new Date().toISOString(),
    employer: scraper.employerName,
    jobs,
  });

  // List all snapshots on disk so we can see what's there
  const snapshots = await storage.listSnapshots();
  rootLogger.info(`Snapshots on disk: ${snapshots.join(", ")}`);
}

main().catch((error: unknown) => {
  rootLogger.error("Fatal error", error);
  process.exit(1);
});
