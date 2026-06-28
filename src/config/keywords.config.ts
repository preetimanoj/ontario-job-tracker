// src/config/keywords.config.ts

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
  "Systems Administrator",
  "System Administrator",
  "Database Administrator",
  "Database Analyst",
  "Infrastructure",

  // Network & Support
  "Network Support",
  "Network Analyst",
  "Network Engineer",
  "Network Administrator",
  "Tech Support",
  "Technical Support",
  "Application Support",
  "Tech Supp",

  // Data / Cloud
  "Data Analyst",
  "Data Engineer",
  "Data Specialist",
  "Data Scientist",
  "Data Manager",
  "Business Intelligence",
  "Cloud Engineer",
  "DevOps",
  "Platform Engineer",
  "GIS",

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
  "Information & Technology",
  "Digital",
  "I&T",
] as const;

export type JobKeyword = (typeof JOB_KEYWORDS)[number];

export function matchesKeyword(title: string): boolean {
  const normalizedTitle = title.toLowerCase();
  return JOB_KEYWORDS.some((keyword) =>
    normalizedTitle.includes(keyword.toLowerCase()),
  );
}

// NEW — department-based matching
// Some government job titles are cryptic but the department is clear
export const IT_DEPARTMENTS: readonly string[] = [
  "Information & Technology",
  "Information Technology",
  "Information and Technology",
  "IT Services",
  "Digital Services",
  "Technology Services",
] as const;

export function matchesDepartment(department: string): boolean {
  const normalizedDept = department.toLowerCase();
  return IT_DEPARTMENTS.some((dept) =>
    normalizedDept.includes(dept.toLowerCase()),
  );
}
