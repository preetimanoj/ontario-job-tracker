# Ontario Public Sector Job Tracker

An automated job tracking system that monitors 150+ Ontario public sector employer career pages daily, filters for software and IT positions, and delivers email digests of newly posted roles.

## Tech Stack

- **Runtime**: Node.js 20+ / TypeScript
- **Scraping**: Playwright (dynamic sites) + Cheerio + Axios (static sites)
- **Notifications**: Nodemailer (email)
- **Automation**: GitHub Actions (daily cron)
- **Storage**: JSON snapshots (Phase 1) → SQLite (Phase 2)

## Architecture

Clean Architecture with SOLID principles. Each employer is a self-contained scraper module. Adding a new employer requires creating exactly one new file.

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env
# Fill in your .env values
npm run dev
```

## Project Status

🚧 Under active development
