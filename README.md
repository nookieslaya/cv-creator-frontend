# Frontend (CV Management System)

## Tech stack
- React
- TypeScript
- Tailwind CSS
- Clerk (auth)
- Fetch API

## Architecture overview
- Pages live in `src/pages/` (Profile, Skills, Projects, Experience, Education, Languages, CV Generator).
- Shared UI in `src/components/`.
- API layer in `src/api/` (thin wrappers around backend endpoints).
- Types in `src/types/`.

## Key features
- Dashboard layout with CRUD forms for CV data.
- CV generator with live preview, variants, and premium theme controls.
- Manual content selection panel for advanced overrides.
- Clerk authentication on all requests.

## Notes
- API base URL comes from `VITE_API_BASE_URL` (see `.env.example`).
- CV preview and export rely on backend templates and rules.
