// src/index.ts
import { rootLogger } from "./utils";
import { APP_CONFIG } from "./config";
import { TorontoScraper } from "./scrapers";

async function main(): Promise<void> {
  rootLogger.info(`${APP_CONFIG.name} v${APP_CONFIG.version}`);
  rootLogger.info(`Environment: ${APP_CONFIG.environment}`);

  const scraper = new TorontoScraper();
  const jobs = await scraper.scrape();

  rootLogger.info(`Total IT jobs found: ${jobs.length}`);

  jobs.forEach((job, index) => {
    rootLogger.info(`${index + 1}. ${job.title} | ${job.department ?? "N/A"}`);
  });
  jobs.forEach((job, index) => {
    rootLogger.info(
      `${index + 1}. "${job.title}" | dept: "${job.department ?? "none"}"`,
    );
  });
}

main().catch((error: unknown) => {
  rootLogger.error("Fatal error", error);
  process.exit(1);
});
