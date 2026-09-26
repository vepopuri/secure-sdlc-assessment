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

- **Home** (`/`) — the landing page and engagement setup in one place. A
  dark, professional header (no scoring here — that lives on Reports) with
  an **engagement workflow ribbon** — eight stages from Kickoff through
  Review & Finalize, each with its own icon, connected by a progress line.
  A stage lights up done/current/upcoming from real data (has a review
  level been set, has scope been finalized, is there any evidence, etc.) —
  it's a live status readout, not decoration. Below that:
  - **Engagement details** — review level (application-level vs.
    organization-level), type of application or organization, and
    compliance requirements (PCI DSS, HIPAA, SOC 2, …), all autosaved as
    they're set. The type field's label and options switch depending on
    review level — application types (Web Application, API/Microservice,
    …) for an application-level review, organization types (Business Unit,
    Subsidiary, …) for an organization-level one — since the two levels
    aren't describing the same kind of thing.
  - **Scope description** — a free-text engagement scope document you can
    write directly or fill from an **uploaded file** (a plain-text/Markdown
    upload auto-fills the description if it's empty; any file type can be
    attached, downloaded, and removed). Copy it to the clipboard, or run
    "Suggest controls" to open a **review-and-finalize dialog**: a
    keyword-based shortlist of controls the document seems to mention
    (per framework, adjustable via checkbox), plus an "Add other controls"
    picker to browse each framework's full catalog and bring in anything
    the keyword match missed — nothing changes the scope checklist until
    "Finalize scope" is clicked. None of this is required to start
    assessing — it's reference material, not a gate.
  - **Fine-tune specific controls (optional)** — a collapsed, secondary
    per-framework checklist. Every control is in scope by default;
    deselect what doesn't apply and add it back at any time.
- **Assessment Workspace** (`/assessment`) — tabs across the three
  frameworks. An accordion tree of in-scope functions → controls on the left
  (collapsed by default; each row shows a status icon); a detail panel on
  the right with the control's description/guidance, **the question to ask
  the client** and **a sample strong answer** for calibration, a 0–3
  maturity rating selector, a notes textarea (autosaves on blur), and
  evidence linking. Each linked evidence item gets its own row with an
  editable **section/page reference** (e.g., "Section 3.2, p.14") so a
  control can cite exactly where in a document — or across several
  documents — its answer comes from; linking evidence (like rating) bumps
  a not-started control to in-progress automatically.
- **Evidence Library** (`/evidence`) — a grid of evidence cards, an upload
  dialog (multi-file upload, or an interview note), a preview dialog, and
  delete.
- **Reports** (`/reports`) — tabbed per-framework maturity-by-function chart
  plus a "top gaps" table (in-scope controls unrated or rated ≤ 1, worst
  first).

## Architecture

### Domain model (`src/types`)

`Framework → FrameworkFunction → Control` mirrors each framework's own
catalog structure faithfully (SAMM's practices/streams, CSF's
functions/categories, SSDF's practice groups/practices), but every control is
rated on the same normalized 0–3 maturity scale (`MaturityRating`) via a
separate `Observation` record (`{ frameworkId, controlId, status, rating,
notes, evidenceLinks }`). This is what makes cross-framework dashboards and
reports possible without forcing the frameworks into a shared shape. Every
`Control` also carries a `question` (what to ask the client to assess it)
and a `sampleAnswer` (what a strong, well-implemented answer looks like, for
reviewer calibration) — authored faithfully for all 71 controls across the
three frameworks and shown in the Assessment Workspace's detail panel.

`evidenceLinks` is `{ evidenceId, section? }[]` rather than a flat id
list — each link can carry an optional pointer (a page, section, or
timestamp) to where in that evidence the answer actually comes from, and a
control can cite several evidence items at once. `assessmentService.ts`
transparently migrates observations still holding the older flat
`evidenceIds: string[]` shape (from before this existed) into the new form
on read, so nothing already in a browser's localStorage breaks.

### Framework registry (`src/data/frameworks`)

Each framework lives in its own module (`samm.ts`, `nistCsf.ts`, `ssdf.ts`)
exporting a `Framework` object, aggregated by `index.ts`. **To add another
framework:** write a new module exporting a `Framework`, add it to the
`frameworks` array in `index.ts`. No page needs to change — Home, the
Assessment Workspace, and Reports pages all iterate over the registry.

### Storage layer (`src/storage`)

Low-level, storage-specific wrappers with no domain knowledge:

- `idb.ts` — a minimal IndexedDB wrapper (one object store, keyed by any
  string id) for file bytes — evidence uploads and the scope document's
  optional attachment alike.
- `localStore.ts` — a minimal localStorage JSON-collection helper for
  metadata (evidence records, observations, scope selections/document).

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
`overallAverageRating`, and `topGaps`. Reports calls these with the
frameworks + observations it already has from `AppDataContext` — the
scoring math lives in exactly one place. (Home deliberately shows none of
this — it's engagement setup, not a dashboard; Reports is where maturity is
reported.)

### Assessment scope (`src/utils/scope.ts`, `src/utils/suggest.ts`, `scopeService.ts`)

Two independent pieces of scope state, both served by `scopeService.ts`:

- A `ScopeDocument` — the engagement's intake profile (`reviewLevel`,
  `applicationType`, `complianceRequirements`) plus its free-text scope
  description and an optional uploaded attachment (file bytes in IndexedDB;
  filename/mime/size in the record). Edited on Home, autosaved as each
  field changes, and readable (read-only, with a Copy button, plus the
  intake fields as chips) from a collapsed panel on the Assessment
  Workspace so it's on hand during review. None of it affects what's rated
  or counted — it's pure reference material.
- A `ScopeSelection` (`{ frameworkId, includedControlIds }`) per framework,
  which does drive what's rated and counted; **no record for a framework
  means "everything is in scope"** (the default), so the app works
  unchanged until someone edits the checklist. `applyScope(framework,
  includedControlIds)` in `utils/scope.ts` returns a copy of a `Framework`
  containing only in-scope controls (and only the functions that still have
  at least one); Home, Assessment, and Reports all call it before scoring
  or rendering, so narrowing this checklist is the one lever that changes
  what's shown and counted everywhere.

`utils/suggest.ts` bridges the two: `suggestControls(scopeText, frameworks)`
is a pure, offline keyword match (no backend, no AI call) between the scope
document's text and each control's name/description/guidance, requiring at
least two distinct keyword matches to filter out coincidental single-word
hits. `SuggestControlsDialog` (`src/components/scope/`) turns that into a
review-and-finalize step, not an automatic decision: suggestions are
adjustable checkboxes (grouped per framework, with tabs to move between
them), an "Add other controls" autocomplete lets the reviewer browse each
framework's full catalog for anything the keywords missed, and only
clicking "Finalize scope" merges the reviewed set into that framework's
`ScopeSelection`.

### Engagement workflow (`src/components/EngagementWorkflow.tsx`)

Renders the eight-stage ribbon on Home (Kickoff → Scope Finalization →
Document Collection & Meeting Scheduling → Documentation Review →
Interviews → Process Data & Validate → Prepare Report → Review & Finalize).
Each stage's done/current/upcoming state is a boolean derived from data
already in `AppDataContext` (e.g., "Interviews" is done once any evidence
has `kind: 'interview-note'`; "Process Data & Validate" is done once any
observation has a rating) — never fabricated progress. The first not-done
stage in order is "current" and gets the glow; nothing before it is ever
un-done once its underlying data exists, since these are one-way signals
(you can't accidentally "undo" having entered a review level). The three
people-facing stages (Kickoff, Document Collection & Meeting Scheduling,
Interviews) render a small illustrated figure with a task-specific prop
(a handshake, a calendar, a speech bubble) instead of a plain icon, and a
faint scattering of dashed-flowchart shapes runs behind the whole row —
both purely decorative, styled after a workflow-diagram illustration
reference, using only the app's existing brand palette.

### Charts (`src/components/MaturityBarChart.tsx`)

A plain SVG horizontal bar chart: one bar per function/category, length =
average rating / 3, a single consistent series color (position + label
already carry identity — these aren't distinct series), recessive gridlines
at 0/1/2/3, the numeric average at the bar end, and a hover/focus tooltip
showing "X of Y controls rated". No chart library is used.

### Visual design

The UI follows Deloitte's digital brand guidance: a dark gray (`#282728`)
nav header with white text and a neon-green (`#86EB22`) active state — the
brand's own dark-theme pairing, chosen for a more professional, console-like
feel — under a 4px green gradient signature bar, echoed by a matching dark
hero band at the top of Home; Deloitte Green (`#86BC25`) as the primary
accent everywhere else (buttons, chart bars, card accents); Open Sans
typography; and a subtle circular motif on the Home hero, kept low-opacity
so it never competes with the content. Colors and typography live in
`src/theme.ts` (MUI theme) and `src/components/Layout.tsx` (header), plus
`index.html` (font loading) and `src/index.css` (page background).

## Project layout

```
src/
  types/              domain model (Framework, Control, Observation, Evidence, ScopeSelection, ScopeDocument, ...)
  data/frameworks/     framework registry (samm.ts, nistCsf.ts, ssdf.ts, index.ts)
  storage/             low-level IndexedDB / localStorage wrappers
  services/            the only modules that read/write persisted data
  context/             AppDataContext — the only way pages touch persisted data
  utils/scoring.ts     pure scoring functions used by Reports
  utils/scope.ts       pure scope-filtering functions shared by Home/Assessment/Reports
  utils/suggest.ts     pure keyword control-suggestion function used on Home
  components/          shared UI (Layout, MaturityBarChart, EngagementWorkflow, evidence/scope dialogs)
  pages/               HomePage, AssessmentPage, EvidencePage, ReportsPage
```

## Verification performed

- `npm install && npm run build` — typecheck + production build succeed.
- `npm run lint` — oxlint clean, no warnings.
- Drove the app end-to-end in headless Chromium (Playwright) across all four
  pages: watched the Home page's workflow ribbon advance live as review
  level was set and scope/evidence/ratings were added, confirmed the
  application-type/organization-type field swaps correctly with review
  level, wrote a scope document, ran "Suggest controls" and confirmed the
  per-framework tabs, adjustable suggestion checkboxes, and "Add other
  controls" autocomplete all update the live selection count before
  finalizing, narrowed the fine-tune control checklist and confirmed the
  change flowed through to Assessment/Reports, linked two evidence items to
  a control with distinct section references and confirmed both the values
  and the automatic not-started → in-progress status bump survive a page
  reload, removed one link and confirmed only it disappeared, and
  rated/annotated controls with evidence across frameworks. Confirmed the
  Reports charts update live with correct averages and gap listings. No
  console or page errors were observed.
