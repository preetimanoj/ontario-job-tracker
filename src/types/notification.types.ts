// src/types/notification.types.ts
// Defines the shape of data used for sending notifications.

import { Job } from "./job.types";

// What we pass to the email service
export interface EmailNotification {
  // Who the email is going to
  to: string;

  // Email subject line
  subject: string;

  // Plain text fallback (some email clients don't render HTML)
  textBody: string;

  // HTML version of the email
  htmlBody: string;

  // The new jobs we're notifying about
  newJobs: Job[];

  // When the report was generated
  generatedAt: string;
}

// Summary statistics included in every email
export interface JobReportSummary {
  // Total employers scraped this run
  totalEmployersScraped: number;

  // How many employers had errors
  failedEmployers: number;

  // Total new jobs found across all employers
  totalNewJobs: number;

  // When the run started
  runStartedAt: string;

  // When the run finished
  runFinishedAt: string;

  // Total duration in seconds
  durationSeconds: number;
}
