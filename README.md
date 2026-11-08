# Job Ready — front end

React + Vite front end for **Job Ready** (Hack the Change 2026). It talks to the Spring Boot back end
([job-ready-backend](https://github.com/Eight-AreaKeeper/job-ready-backend)) through `/api/v1` (API docs v0.5).

## Run it

1. Start the back end on port 8000 (MySQL running, `db/schema.sql` applied, test data on).
2. Then:

```bash
npm install
npm run dev          # http://localhost:5173
```

The dev server forwards `/api` to `http://localhost:8000`, so there is no CORS setup. To use another back end,
copy `.env.example` to `.env.local` and change `VITE_API_TARGET`.

Test accounts come from the back end's `db/test-data.sql` (password `password123`), for example
`maya.chen@test.jobready.dev` (student) and `daniel.lee@test.jobready.dev` (mentor).

## Pages

| Route | Page |
| --- | --- |
| `/` | Home |
| `/about` | About us |
| `/signin` | Sign in / create account (student or mentor) |
| `/profile/setup` | Questionnaire; AI builds the career profile |
| `/profile` | Edit my career profile, generate base resume |
| `/opportunities` | Browse jobs (deadline soonest first), filters, paging |
| `/opportunities/recommended` | AI-ranked matches with reasons |
| `/opportunities/:id` | Job details, requirements vs my skills |
| `/opportunities/:id/apply` | Apply step 1: tailor resume (AI) or use base resume |
| `/events` | Career events (soonest first), kind and format filters |
| `/resume` | Resume intro |
| `/resumes` | My resumes, preview, PDF download, AI suggestions, apply step 2 |
| `/interview` | AI mock interview with scores and feedback |
| `/mentors` | Mentor directory |
| `/mentors/:id/chat` | Request a coffee chat (AI-drafted message, pick times), my chats |
| `/mentor/signup` | Mentor card (create or edit) |
| `/mentor/dashboard` | Mentor: accept/decline requests, complete chats, points |

The navigation always shows About us, Resume, Opportunities and Mentors.

## Code layout

- `src/api.js`: every back-end call, token handling, `{ code, msg, data }` unwrapping.
- `src/auth.jsx`: signed-in user (token in `localStorage`).
- `src/pages/`: one file per page. `src/components/`: header and shared pieces.
- `src/styles.css`: colours, type and shared classes from the design.

## Integration tests (front end + real back end)

`e2e/` drives the real app in Chromium against the running back end: public pages, sign-in, the full
student journey (questionnaire → profile → resume + PDF + suggestions → jobs → apply/tailor → matches →
events → mock interview) and the mentor journey (card → request → accept/decline → complete → points).

```bash
npx playwright install chromium   # once
npm run test:e2e                  # back end must be running on :8000
```

With the real Gemini AI each AI step can take up to ~20 s; the tests allow 30 s per step.
