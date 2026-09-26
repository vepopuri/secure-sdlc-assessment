# Secure SDLC Assessment

A frontend-only web app for running a Secure SDLC controls assessment across
multiple frameworks (OWASP SAMM v2, NIST CSF 2.0, NIST SSDF SP 800-218) on a
single normalized 0–3 maturity scale, with an evidence library to back up
findings and a dashboard/report view for cross-framework reporting.

There is no backend yet. Everything is persisted client-side (localStorage +
IndexedDB) behind a service layer that is designed to be swapped for a real
API later without touching any page.

## Running it

```bash
npm install
npm run dev       # start the dev server (Vite)
npm run build     # typecheck (tsc -b) + production build
npm run lint      # oxlint
npm run preview   # preview the production build
```

Data is stored entirely in the browser (localStorage for metadata, IndexedDB
for evidence file bytes). Clearing site data resets the app.

## Stack

- Vite + React 19 + TypeScript
- MUI v7 (`@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`)
- `react-router-dom` v7
- `oxlint` for linting
- No chart library — charts are custom SVG components (see `src/components/MaturityBarChart.tsx`)

## Pages

- **Dashboard** (`/`) — stat tiles (frameworks, controls assessed, evidence
  items, overall weighted average maturity) plus a score card per framework
  with a maturity-by-function bar chart.
- **Assessment Workspace** (`/assessment`) — tabs across the three
  frameworks. An accordion tree of functions → controls on the left (each row
  shows a status icon); a detail panel on the right with a 0–3 maturity
  rating selector, a notes textarea (autosaves on blur), and an evidence
  linking control.
- **Evidence Library** (`/evidence`) — a grid of evidence cards, an upload
  dialog (file upload or interview note), a preview dialog, and delete.
- **Reports** (`/reports`) — tabbed per-framework maturity-by-function chart
  plus a "top gaps" table (controls unrated or rated ≤ 1, worst first).

## Architecture

### Domain model (`src/types`)

`Framework → FrameworkFunction → Control` mirrors each framework's own
catalog structure faithfully (SAMM's practices/streams, CSF's
functions/categories, SSDF's practice groups/practices), but every control is
rated on the same normalized 0–3 maturity scale (`MaturityRating`) via a
separate `Observation` record (`{ frameworkId, controlId, status, rating,
notes, evidenceIds }`). This is what makes cross-framework dashboards and
reports possible without forcing the frameworks into a shared shape.

### Framework registry (`src/data/frameworks`)

Each framework lives in its own module (`samm.ts`, `nistCsf.ts`, `ssdf.ts`)
exporting a `Framework` object, aggregated by `index.ts`. **To add another
framework:** write a new module exporting a `Framework`, add it to the
`frameworks` array in `index.ts`. No page needs to change — the Dashboard,
Assessment Workspace, and Reports pages all iterate over the registry.

### Storage layer (`src/storage`)

Low-level, storage-specific wrappers with no domain knowledge:

- `idb.ts` — a minimal IndexedDB wrapper (one object store, `evidenceBlobs`,
  keyed by evidence id) for evidence file bytes.
- `localStore.ts` — a minimal localStorage JSON-collection helper for
  metadata (evidence records, observations).

### Service layer (`src/services`) — the only place that persists data

`evidenceService.ts` and `assessmentService.ts` are **the only two modules
that read or write persisted data**. They expose plain async functions
(`list`, `get`, `addFile`, `addNote`, `upsert`, `remove`, `getObjectUrl`, …)
with no React and no UI concerns. This is the seam for a real backend:

**To wire up a real backend later:** reimplement the functions in
`evidenceService.ts` / `assessmentService.ts` to call your API instead of
`storage/idb.ts` / `storage/localStore.ts` (e.g. `list()` becomes a `GET`
request instead of a localStorage read). Because every page consumes these
services only through `AppDataContext` (see below), no page or component
needs to change — only these two files.

### `AppDataContext` (`src/context`)

The single React context every page uses. It wraps the service functions,
holds the in-memory `evidence`/`observations` state, and exposes mutators
(`addEvidenceFile`, `upsertObservation`, …) that call the service and update
state. Pages call `useAppData()` — they never import `services/*` or
`storage/*` directly. (The context object, provider, and hook are split
across `appDataContextDefinition.ts`, `AppDataContext.tsx`, and
`useAppData.ts` respectively, which is a common pattern to keep Fast Refresh
working — each file exports only one kind of thing.)

### Scoring (`src/utils/scoring.ts`)

Pure functions with no I/O: `scoreFunction`, `scoreFramework`,
`overallAverageRating`, and `topGaps`. Both the Dashboard and Reports pages
call these with the frameworks + observations they already have from
`AppDataContext` — the scoring math lives in exactly one place.

### Charts (`src/components/MaturityBarChart.tsx`)

A plain SVG horizontal bar chart: one bar per function/category, length =
average rating / 3, a single consistent series color (position + label
already carry identity — these aren't distinct series), recessive gridlines
at 0/1/2/3, the numeric average at the bar end, and a hover/focus tooltip
showing "X of Y controls rated". No chart library is used.

## Project layout

```
src/
  types/              domain model (Framework, Control, Observation, Evidence, ...)
  data/frameworks/     framework registry (samm.ts, nistCsf.ts, ssdf.ts, index.ts)
  storage/             low-level IndexedDB / localStorage wrappers
  services/            the only modules that read/write persisted data
  context/             AppDataContext — the only way pages touch persisted data
  utils/scoring.ts     pure scoring functions shared by Dashboard + Reports
  components/          shared UI (Layout, MaturityBarChart, evidence dialogs)
  pages/               DashboardPage, AssessmentPage, EvidencePage, ReportsPage
```

## Verification performed

- `npm install && npm run build` — typecheck + production build succeed.
- `npm run lint` — oxlint clean, no warnings.
- Drove the app end-to-end in headless Chromium (Playwright) across all four
  pages: added a file and an interview note to the Evidence Library, rated
  and annotated controls (with linked evidence) in the Assessment Workspace
  across two frameworks, and confirmed the Dashboard and Reports charts
  update live with correct averages and gap listings. No console or page
  errors were observed.
