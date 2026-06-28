// src/index.ts
import { rootLogger } from "./utils";
import { APP_CONFIG } from "./config";

async function main(): Promise<void> {
  rootLogger.info(`${APP_CONFIG.name} v${APP_CONFIG.version}`);
  rootLogger.info(`Environment: ${APP_CONFIG.environment}`);
}

main().catch((error: unknown) => {
  rootLogger.error("Fatal error", error);
  process.exit(1);
});
