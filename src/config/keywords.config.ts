// src/config/keywords.config.ts
// All job title keywords we consider relevant.
// A job is included if its title contains ANY of these keywords.
// Case-insensitive matching is handled in the scraper base class (coming later).

export const JOB_KEYWORDS: readonly string[] = [
  // Frontend / UI
  "Frontend Developer",
  "Frontend Engineer",
  "UI Developer",
  "React Developer",
  "Web Developer",

  // General Software
  "Software Developer",
  "Software Engineer",
  "Application Developer",
  "Full Stack Developer",
  "Full-Stack Developer",

  // IT / Systems
  "IT Developer",
  "JavaScript",
  "TypeScript",
  "Systems Analyst",
  "IT Analyst",
  "Business Analyst",
  "Technical Analyst",

  // Data / Cloud
  "Data Analyst",
  "Data Engineer",
  "Cloud Engineer",
  "DevOps",
  "Platform Engineer",

  // Management / Architecture
  "IT Manager",
  "IT Director",
  "Solutions Architect",
  "Technical Lead",
  "Tech Lead",

  // Security
  "Security Analyst",
  "Cybersecurity",
  "Information Security",

  // General IT
  "Information Technology",
  "Digital",
] as const;

// Type representing any valid keyword
// 'typeof JOB_KEYWORDS[number]' means "any string that exists in JOB_KEYWORDS"
export type JobKeyword = (typeof JOB_KEYWORDS)[number];

// Helper function — checks if a job title matches any of our keywords
// We put it here because it's tightly related to the keywords config
export function matchesKeyword(title: string): boolean {
  const normalizedTitle = title.toLowerCase();
  return JOB_KEYWORDS.some((keyword) =>
    normalizedTitle.includes(keyword.toLowerCase()),
  );
}
