# Career Ledger MVP

Career Ledger is a React-based frontend MVP for turning small career notes into structured project records and mock AI-generated career writing.

## Core Structure

- `source`: user-entered original project data
- `ai`: mock AI translation result, ready to replace with an OpenAI API response later

```js
{
  id: "project-id",
  createdAt: "ISO timestamp",
  source: {
    dateMode: "year | month | day | period",
    dateValue: "2025.03 - 2025.06",
    projectName: "프로젝트명",
    client: "발주처",
    participationLevel: "리드 | 서브 | 지원",
    note: "사용자 원본 메모",
    participantScale: 12
  },
  ai: {
    recognizedKeywords: [],
    summary: "",
    responsibilities: [],
    skillTags: [],
    portfolioSentence: ""
  }
}
```

## Run Locally

```bash
npm install
npm run dev -- --host 0.0.0.0
```

## Deploy To Vercel

This project is Vercel-ready as a Vite app.

Recommended settings:

- Framework preset: `Vite`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

CLI preview deployment:

```bash
npm install
npm run build
vercel
```

Production deployment:

```bash
vercel --prod
```

The included `vercel.json` pins the build command, output directory, framework, and SPA fallback rewrite.

## Deploy With GitHub Import

1. Create a new GitHub repository, for example `career-ledger`.
2. Push this project folder to the repository.
3. Open Vercel and choose `Add New...` -> `Project`.
4. Select `Import Git Repository`.
5. Pick the GitHub repository.
6. Use these settings:

- Framework preset: `Vite`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

7. Click `Deploy`.

This path does not require Vercel CLI device authentication. Vercel will build from GitHub directly.

## Data Persistence

The MVP stores projects in browser `localStorage` under `career-ledger-projects-v2`.

This means:

- Data persists after refresh on the same browser and same device.
- PC and mobile do not share data with each other.
- First-time visitors start with an empty project list. No shared sample projects are created automatically.
- Incognito/private browsing data may disappear when the session closes.
- Clearing site data or browser storage removes saved projects.
- A future Supabase integration should replace this for account-based cross-device sync.

## Future Integration Points

- Supabase: replace local storage with a project repository layer.
- Google login: add auth state above the app shell.
- OpenAI API: replace `mockTranslate` in `src/main.jsx` with an API call that returns the same `ai` shape.
