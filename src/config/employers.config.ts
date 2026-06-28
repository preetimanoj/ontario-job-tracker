// src/config/employers.config.ts
// Master list of all employers we scrape.
// Each entry maps to exactly one scraper file in src/scrapers/.
// To add a new employer: add an entry here and create the scraper file.

export type EmployerCategory =
  | "municipality"
  | "regional"
  | "provincial"
  | "federal"
  | "school_board"
  | "hospital"
  | "university"
  | "college"
  | "transit"
  | "utility";

export interface EmployerConfig {
  // Unique identifier — used to find the matching scraper file
  // Must match the filename in src/scrapers/ e.g. 'toronto' → toronto.scraper.ts
  id: string;

  // Human-readable name shown in emails and logs
  name: string;

  // Category for grouping in reports
  category: EmployerCategory;

  // The careers page URL — starting point for the scraper
  careersUrl: string;

  // Whether this employer is active — set to false to skip without deleting
  enabled: boolean;
}

export const EMPLOYERS: readonly EmployerConfig[] = [
  // --- GTA Municipalities ---
  {
    id: "toronto",
    name: "City of Toronto",
    category: "municipality",
    careersUrl:
      "https://jobs.toronto.ca/jobsatcity/search/?q=&l=&domain=jobsatcity.com",
    enabled: true,
  },
  {
    id: "mississauga",
    name: "City of Mississauga",
    category: "municipality",
    careersUrl: "https://careers.mississauga.ca/go/All-Jobs/2669717/",
    enabled: false, // Will enable when we build this scraper
  },
  {
    id: "brampton",
    name: "City of Brampton",
    category: "municipality",
    careersUrl: "https://careers.brampton.ca/",
    enabled: false,
  },
  {
    id: "markham",
    name: "City of Markham",
    category: "municipality",
    careersUrl: "https://www.markham.ca/wps/portal/home/about/careers",
    enabled: false,
  },
  {
    id: "vaughan",
    name: "City of Vaughan",
    category: "municipality",
    careersUrl: "https://www.vaughan.ca/jobs",
    enabled: false,
  },

  // --- Regional Governments ---
  {
    id: "peel-region",
    name: "Region of Peel",
    category: "regional",
    careersUrl: "https://careers.peelregion.ca/",
    enabled: false,
  },
  {
    id: "york-region",
    name: "York Region",
    category: "regional",
    careersUrl: "https://www.york.ca/business/employment-york-region",
    enabled: false,
  },
  {
    id: "durham-region",
    name: "Durham Region",
    category: "regional",
    careersUrl: "https://www.durham.ca/en/regional-government/careers.aspx",
    enabled: false,
  },

  // --- School Boards ---
  {
    id: "tdsb",
    name: "Toronto District School Board",
    category: "school_board",
    careersUrl: "https://www.tdsb.on.ca/About-Us/Employment",
    enabled: false,
  },
  {
    id: "yrdsb",
    name: "York Region District School Board",
    category: "school_board",
    careersUrl: "https://www.yrdsb.ca/about/careers",
    enabled: false,
  },

  // --- Provincial ---
  {
    id: "ontario-public-service",
    name: "Ontario Public Service",
    category: "provincial",
    careersUrl: "https://www.gojobs.gov.on.ca/Jobs.aspx",
    enabled: false,
  },

  // --- Federal ---
  {
    id: "government-of-canada",
    name: "Government of Canada",
    category: "federal",
    careersUrl:
      "https://www.canada.ca/en/services/jobs/opportunities/government.html",
    enabled: false,
  },
] as const;

// Helper — returns only enabled employers
export function getEnabledEmployers(): readonly EmployerConfig[] {
  return EMPLOYERS.filter((employer) => employer.enabled);
}

// Helper — find a single employer by ID
export function getEmployerById(id: string): EmployerConfig | undefined {
  return EMPLOYERS.find((employer) => employer.id === id);
}
