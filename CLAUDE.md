# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A single-page Hebrew RTL web app for Israeli high school history Bagrut (matriculation exam) preparation. Students practice with interactive questions, text-selection exercises, and AI-graded open-ended essay questions.

## Architecture

Everything lives in a single `index.html` file — there is no build step, bundler, or package manager. The app runs entirely in the browser using:

- **React 18** via ESM imports (`esm.sh`)
- **Babel Standalone** for JSX transpilation at runtime
- **Tailwind CSS** via CDN
- **Google Fonts** (Rubik) for Hebrew text

The app communicates with a Google Apps Script backend (`GOOGLE_SCRIPT_URL`) that serves JSON data and handles AI essay grading and grade submission.

## Data Model

All data is fetched on load from the Google Apps Script endpoint. The response shape:

```js
{
  questions: [],          // array of step objects
  texts: {},              // map of topic_id → array of text segments
  dashboardStructure: {}, // nested: category → subcategories → topics[]
  accessKey: "..."        // optional password for site access
}
```

**Step types** (`step.step_type`):
- `intro` — displays topic intro text + full source text
- `question` — multiple choice with `options` (pipe-delimited string or array), `correct_answer` (index)
- `text-selection` — click segments of source text; supports `require_multiple` for multi-select
- `ai-practice` — open-ended essay graded by AI via POST to `GOOGLE_SCRIPT_URL`

## Navigation Flow

Category → Subcategory → Topic → Steps (indexed by `currentStep`)

The `resetQuestionState` helper function exists to reset all step-level state when navigating back. When adding new state tied to a step, ensure it's also cleared in: `resetQuestionState`, the back button handler in the header, and the `handleSubmitGrade` timeout callback.

## No Build / Development Setup

Open `index.html` directly in a browser — no server required. All CDN resources are loaded at runtime, so an internet connection is needed.

To preview changes, just refresh the browser after editing `index.html`.

## Deployment

The app is a static file. Deployment means committing `index.html` and pushing to the repo (which is likely served via GitHub Pages or similar).
