# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
```

No lint script and no test suite exist in this project.

## Required Environment Variables

```
GEMINI_API_KEY                       # Google Gemini API key
SUPABASE_URL                         # Supabase project URL
SUPABASE_SERVICE_KEY                 # Supabase service role key (not anon key)
SITE_ACCESS_KEY                      # Optional site-wide password (empty = open access)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
```

## Architecture Overview

This is a Next.js 15 (JavaScript, no TypeScript) Bagrut history exam practice platform for Israeli high school students. It uses Tailwind 3, Clerk v6, Gemini 2.5 Flash for AI grading, and Supabase for grade persistence.

### Data Flow

All question/text data lives in `data/questions.json` and `data/texts.json` (static files). They are read at request time on the **server** in `app/page.js` via `fs.readFileSync`, then passed as props to the client component. There is no API route for questions — the data pipeline goes through Google Sheets (see Apps Script below).

### Single Client Component Architecture

The entire student experience lives in one large client component: `components/BagrutApp.jsx`. It handles:

1. **Site password gate** — if `SITE_ACCESS_KEY` is set, users must enter it before anything else. The password is checked against `localStorage` on mount.
2. **Admin detection** — `yaacovbod@gmail.com` (hardcoded, also in `app/api/grades/route.js`) renders `AdminPanel` instead of the student flow.
3. **Dashboard navigation** — questions are grouped into `category → subcategory → topic_id` via a `useMemo` that builds a tree from `questions.json`.
4. **Step-by-step exam flow** — filtered by `topic_id`, steps are rendered one at a time. `step_type` values include `intro`, multiple-choice questions, and essay questions.
5. **AI grading** — essay answers are sent to `POST /api/grade` (Gemini), which returns a score and short feedback. The score is parsed from the text (the model is instructed to start with "ציון [number]").
6. **Grade saving** — after grading, `POST /api/save-grade` writes to Supabase's `grades` table.

### API Routes

- `POST /api/grade` — sends `{ prompt }` to Gemini 2.5 Flash with a Hebrew history-teacher system prompt. Returns `{ status, feedback }`. Grading rubric is embedded in the system prompt (keyword grading, source anchoring, answer length rules per Israeli Ministry of Education standards).
- `POST /api/save-grade` — writes `{ topic_id, studentName, studentClass, score, essay, feedback }` to Supabase `grades` table via REST.
- `GET /api/grades` — admin-only (checks Clerk identity against `ADMIN_EMAIL`), fetches all rows from `grades` ordered by `created_at`.

### Google Apps Script (Content Pipeline)

`apps-script/apps-script/קוד.js` is a Google Sheets Web App that exports `questions` and `texts` sheets as JSON. It is the source of truth for content — editors update the spreadsheet, run the script, and copy the output into `data/questions.json` and `data/texts.json`. The `options` column is pipe-delimited (`|`), `correct_answer` is comma-delimited for multi-select. The script also reads a `settings` sheet for the site password.

### Data Schemas

`questions.json` — array of step objects:
```
{ topic_id, step_type, title, category, subcategory, question_text,
  options[], correct_answer (int or int[]), explanation, image_url,
  reference_answer, ... }
```

`texts.json` — object keyed by `topic_id`, each value is an array of source text objects:
```
{ id, text }
```

`grades` Supabase table columns: `id, topic_id, student_name, student_class, score, essay, feedback, created_at`
