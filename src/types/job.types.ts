// src/types/job.types.ts
// Defines the shape of a job posting throughout the entire system.
// Every scraper must return jobs in this exact shape.

export type JobStatus = 'new' | 'existing' | 'removed';

export interface Job {
  // Unique identifier — we generate this from employer + title + location
  // so we can detect duplicates across runs
  id: string;

  // The job title exactly as it appears on the employer's website
  title: string;

  // Name of the employer e.g. "City of Toronto"
  employer: string;

  // Direct URL to the job posting
  url: string;

  // City or location as listed on the posting e.g. "Toronto, ON"
  location: string;

  // The date the job was posted — as a string because websites
  // format dates inconsistently. We normalize later.
  postedDate: string;

  // The date our scraper first discovered this job
  // We generate this ourselves using new Date().toISOString()
  scrapedAt: string;

  // Optional — not all sites show closing dates
  closingDate?: string;

  // Optional — some sites show department e.g. "Information Technology"
  department?: string;

  // Optional — some sites show job type e.g. "Full-time", "Contract"
  jobType?: string;

  // Optional — salary range if listed
  salary?: string;
}

// What we save to disk each run — a snapshot of all jobs found
export interface JobSnapshot {
  // When this snapshot was taken
  capturedAt: string;

  // Which employer this snapshot belongs to
  employer: string;

  // All jobs found in this run
  jobs: Job[];
}