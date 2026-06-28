// src/scrapers/toronto.scraper.ts
// Scraper for the City of Toronto careers page.
// Uses Axios (HTTP requests) + Cheerio (HTML parsing).
//
// SITE STRUCTURE NOTES (inspected June 2026):
// - Job card wrapper: div.job-tile-cell
// - Each card renders 3 times (desktop/tablet/mobile) — we target desktop only
// - No per-listing location field — defaults to "Toronto, ON"
// - Date field uses dynamic IDs ending in "-value"

import axios from "axios";
import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import { Job } from "../types";
import { BaseScraper } from "./base.scraper";

export class TorontoScraper extends BaseScraper {
  readonly employerName = "City of Toronto";
  readonly baseUrl = "https://jobs.toronto.ca";

  private readonly searchUrl =
    "https://jobs.toronto.ca/jobsatcity/search/?q=&l=&domain=jobsatcity.com";

  protected async scrapeJobs(): Promise<Job[]> {
    this.logger.info("Fetching Toronto job listings...");

    const html = await this.fetchPage(this.searchUrl);
    const jobs = this.parseJobs(html);

    this.logger.info(`Found ${jobs.length} total jobs before keyword filter`);

    return jobs;
  }

  private async fetchPage(url: string): Promise<string> {
    const response = await this.withRetry(async () => {
      return axios.get<string>(url, {
        timeout: this.config.timeoutMs,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-CA,en;q=0.9",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
    });

    return response.data;
  }

  private parseJobs(html: string): Job[] {
    const $ = cheerio.load(html);
    const jobs: Job[] = [];

    // Select each job card by its wrapper class
    // Each div.job-tile-cell represents one unique job posting
    $("div.job-tile-cell").each((_index, element) => {
      try {
        const job = this.parseJobElement($, element);
        if (job !== null) {
          jobs.push(job);
        }
      } catch (error: unknown) {
        this.logger.warn(`Failed to parse a job listing: ${error}`);
      }
    });

    return jobs;
  }

  private parseJobElement($: cheerio.CheerioAPI, element: Element): Job | null {
    // Target the desktop sub-section only to avoid triple-counting
    // Each job card has desktop + tablet + mobile versions in the HTML
    const desktop = $(element).find(".sub-section-desktop");

    // Title — the anchor tag with class jobTitle-link
    const titleEl = desktop.find(".jobTitle-link");
    const title = titleEl.text().trim();

    // Relative URL e.g. "/jobsatcity/job/Toronto-SOFTWARE-DEVELOPER.../123456/"
    const relativeUrl = titleEl.attr("href") ?? "";
    const jobUrl = relativeUrl.startsWith("http")
      ? relativeUrl
      : `${this.baseUrl}${relativeUrl}`;

    // Skip listings missing essential fields
    if (!title || !jobUrl) {
      this.logger.debug("Skipping listing — missing title or URL");
      return null;
    }

    // Department — the div whose id ends with "-department-value"
    // e.g. "Human Resources"
    const department = desktop
      .find('.section-field.department [id$="-value"]')
      .text()
      .trim();

    // Job type — the div whose id ends with "-shifttype-value"
    // e.g. "Full-time", "Temporary", "Part-time"
    const jobType = desktop
      .find('.section-field.shifttype [id$="-value"]')
      .text()
      .trim();

    // Posted date — the div whose id ends with "-date-value"
    // e.g. "Jun 26, 2026"
    const postedDate = desktop
      .find('.section-field.date [id$="-value"]')
      .text()
      .trim();

    // Toronto's job board doesn't list location per posting
    // All City of Toronto positions are in Toronto
    const location = "Toronto, ON";

    const id = this.generateJobId(this.employerName, title, location);

    const job: Job = {
      id,
      title,
      employer: this.employerName,
      url: jobUrl,
      location,
      postedDate: this.normalizeDate(postedDate),
      scrapedAt: new Date().toISOString(),
      department: department || undefined,
      jobType: jobType || undefined,
    };

    this.logger.debug(`Parsed: ${title} | ${department} | ${postedDate}`);

    return job;
  }
}
