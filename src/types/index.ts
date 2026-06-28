// src/types/index.ts
// Barrel file — re-exports all types from one place.
// This means anywhere in the app you can write:
//   import { Job, Scraper, EmailNotification } from '../types'
// instead of:
//   import { Job } from '../types/job.types'
//   import { Scraper } from '../types/scraper.types'
//   import { EmailNotification } from '../types/notification.types'

export * from "./job.types";
export * from "./scraper.types";
export * from "./notification.types";
