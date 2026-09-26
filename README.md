# Secure SDLC Assessment

A frontend-only web app for running a Secure SDLC controls assessment across
multiple frameworks (OWASP SAMM v2, NIST CSF 2.0, NIST SSDF SP 800-218) on a
single normalized 0–3 maturity scale, with an evidence library to back up
findings and a dashboard/report view for cross-framework reporting.

All assessment data is persisted client-side (localStorage + IndexedDB) behind
a service layer that is designed to be swapped for a real API later without
touching any page. The one deliberate exception is `api/generate-report.ts`,
a small Vercel serverless function that lets Reports draft the executive
summary with a real AI call instead of the offline template (see below) —
it's the only place in this project that holds a secret, and the rest of the
app never depends on it being configured.

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
- No chart library for on-screen charts — custom SVG components (see
  `src/components/MaturityBarChart.tsx`); `pptxgenjs` generates the
  PowerPoint export client-side (see below)

## Pages

- **Home** (`/`) — a clean hero (title, one summary paragraph, two CTAs,
  an animated Deloitte-palette background, and three interactive framework
  badges) plus a "Where would you like to start?" grid of four clickable
  step cards. Below that: **Engagement details** (review level,
  application/organization type, compliance requirements, all autosaved)
  and **Scope description** (free text, optional PDF/Word/PowerPoint
  upload, copy to clipboard, and "Suggest" to open the review-and-finalize
  controls dialog). Review level, type, and compliance requirements feed
  the control suggester alongside the free-text description.
- **Assessment Workspace** (`/assessment`) — tabs across SAMM, NIST CSF,
  NIST SSDF, and a 4th **Custom** framework built from combined or
  hand-written controls (see Architecture below). An accordion tree of
  in-scope functions → controls on the left (collapsed by default, status
  icon and a "Suggested" chip per row); a detail panel on the right with
  the control's description/guidance, the question to ask the client and a
  sample strong answer, a status/rating selector, an observations textarea,
  and evidence linking with a per-link section/page reference. An
  "Auto-suggest" assistant drafts a rating and observations from whatever
  evidence is linked (and redrafts automatically the moment new evidence
  is linked), always reviewable and editable, never applied silently over
  a rating already confirmed by hand; "Auto-suggest all" runs it across an
  entire framework.
- **Evidence Library** (`/evidence`) — three titled sections
  (Documentation upload, Meeting notes upload, Additional notes upload),
  each with its own Add button opening straight to that upload type. Every
  item shows a stable `REF-###` reference number, its kind, date, size,
  and tags; a preview dialog and delete are available from any card.
- **Reports** (`/reports`) — a cross-framework engagement report
  (executive summary, maturity vs. a reviewer-entered peer benchmark, key
  gaps, a Now/Next/Later roadmap, and per-framework detailed
  observations), exportable as a clipboard text document, a browser
  print/PDF, or a real `.pptx` generated client-side with a slide
  checklist — plus the original tabbed per-framework maturity chart and
  gap table underneath.

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

### Assistant auto-suggest (`src/utils/autoAssess.ts`)

`autoAssessControl(control, linkedEvidence)` is a pure, offline heuristic
(no backend, no AI call) that drafts a rating and notes for one control
from whatever evidence is currently linked to it: no evidence gives a
draft rating of 0 with notes prompting the reviewer to request
documentation or schedule an interview; evidence with no keyword overlap
against the control's name/description/question gives a 1; one matching
item or one matched keyword gives a 2; broader evidence and keyword
overlap gives a 3. The result is never applied silently: the Assessment
Workspace's "Auto-suggest" button (per control) and "Auto-suggest all"
button (per framework, skipping any control a reviewer has already rated
by hand) call it, mark the observation `autoSuggested: true`, and show a
"Suggested, needs review" chip in the control list and detail panel.
Changing the rating or notes yourself clears that flag, so a "Suggested"
badge always means "not yet reviewed by a person," never "final."

### Engagement report and export (`src/utils/report.ts`, `src/pages/ReportsPage.tsx`)

Reports now leads with a cross-framework "engagement report" (computed
once across every in-scope framework, independent of which framework tab
is selected), before the existing per-framework maturity chart and gap
table:

- **Executive summary**: a templated paragraph (`buildExecutiveSummary`)
  stating coverage, percent rated, average maturity, and the worst gap;
  an optional free-text box lets the reviewer add their own framing
  sentence (audience, purpose), inserted into the paragraph rather than
  replacing it.
- **Maturity score vs. peer benchmark**: your average per framework next
  to a benchmark value the reviewer types in themselves. The app has no
  real peer dataset, so it never fabricates one; the caption says so
  explicitly, and an unset benchmark reads "Not set" rather than a
  invented number.
- **Key gaps**: `aggregateTopGaps` merges each framework's `topGaps` into
  one worst-first list.
- **Key recommendations and roadmap**: `buildRoadmap` buckets those gaps
  into "Now," "Next," and "Later" by current rating.
- **Detailed observations**: a collapsed-by-default accordion per
  framework listing every in-scope control with its question, notes, and
  linked evidence titles, regardless of whether it's been rated yet.

**Export**: "Copy report as text" (`buildReportText`) assembles every
section above, for every in-scope framework, into one plain-text document
on the clipboard, portable to email, Word, or Slack. "Print / save as PDF"
calls `window.print()`; a `.no-print` class (`src/index.css`, applied to
the nav bar in `Layout.tsx` and to the story box, peer inputs, and tabs in
`ReportsPage.tsx`) hides everything that isn't part of the report itself
in the printed output.

### AI-generated executive summary (`api/generate-report.ts`)

"Generate with AI" (next to the executive summary on Reports) calls a small
Vercel serverless function that sends a compact, pre-aggregated snapshot of
real scoring data (frameworks assessed, total/rated control counts, average
maturity, the top gaps, and whatever the reviewer typed into "Add your own
context") to Claude (`claude-sonnet-5`) and returns a genuinely AI-drafted
executive summary paragraph, replacing the offline template until reverted.
It never sends raw evidence files, the full observation set, or anything
beyond that snapshot.

This requires an `ANTHROPIC_API_KEY` environment variable set on the Vercel
project (Project Settings → Environment Variables), then a redeploy; without
it, the endpoint responds with a clear, non-crashing error and the page falls
back to the template summary, so the rest of the app works identically either
way. The key lives only in `api/generate-report.ts`'s server-side environment
and is never exposed to the browser. Because the endpoint is otherwise
unauthenticated, anyone who can reach the deployed URL can trigger a
(rate/cost-bounded, `max_tokens: 700`) call on that key; add your own auth in
front of it (e.g. Vercel deployment protection) if that's a concern for your
deployment.

### PowerPoint export (`src/utils/pptxExport.ts`, `src/utils/reportSections.ts`)

"Export as PowerPoint" opens a checklist of five sections (matching a
standard consulting SSDLC assessment report's table of contents) and
generates a real `.pptx` entirely client-side with `pptxgenjs` (no
backend, no template file, no client names/logos/photography — every
slide is generic and built only from this engagement's own data or data
a reviewer explicitly typed in):

- **Executive summary** — scope and objectives, an assessment framework
  grid per in-scope framework (function → its controls), the executive
  summary paragraph, a strengths/opportunities takeaway slide, a radar
  chart of average maturity by function per framework (`buildRadarData`,
  skipped for a framework with fewer than 3 functions), and maturity vs. a
  reviewer-entered industry benchmark (a real bar chart once a benchmark
  is set, else a table).
- **Assessment overview** — one slide per function per framework
  (`buildFunctionObservations`), splitting its controls into Strengths
  (rating ≥ 2) and Opportunity Areas (unrated or ≤ 1), each with its
  observation text.
- **Roadmap and initiatives** — a swimlane slide per framework (function
  lanes × Now/Next/Later columns, colored bars per gap control, capped
  per cell with "+N more"), plus initiative card slides grouped by phase.
- **Program domains detailed assessment report** — one slide per control
  that has a rating, observations, or linked evidence: a compact 4-level
  maturity scale strip (this app's own 0 to 3 labels, current level
  highlighted, in the spirit of a maturity ladder legend) next to the
  question asked, observations, evidence, a rating-colored maturity badge
  (amber/gold for 0 to 1, blue for 2, green for 3), and a recommendation
  line when the control is an open gap (reusing the same recommendation
  text as the roadmap, never a separate invented one). Grouped behind a
  divider slide per framework, so an unstarted assessment doesn't produce
  dozens of blank slides.
- **Appendix** — the maturity rating scale (color-coded to match the
  badges above, with this app's own honest definition of each level, not
  a borrowed external scale), a Documentation Reviewed register, and an
  Interviews Conducted register, both built from the
  Evidence Library (`buildDocumentationReviewed`/`buildInterviewsReviewed`)
  using the same `REF-###` numbers shown there (`utils/evidenceSerial.ts`).

Every slide type was verified by generating a real deck against live
assessment data and parsing it back with `python-pptx` (a strict,
independent OOXML parser, separate from pptxgenjs itself) to confirm
every shape, table, and embedded chart is well-formed.

### Custom framework (`src/utils/customFramework.ts`, `customFrameworkService.ts`, `CustomFrameworkDialog.tsx`)

A 4th "Custom" tab on Assessment and Reports, backed by a plain
`Control[]` persisted in localStorage. `buildCustomFramework` wraps that
list in the same `Framework` shape every built-in catalog uses, so a
custom control rates, links evidence, and reports exactly like a
SAMM/CSF/SSDF one, with no special-casing anywhere except where the
framework list itself is assembled (`[...frameworks, buildCustomFramework(customControls)]`
in `AssessmentPage.tsx` and `ReportsPage.tsx`). `CustomFrameworkDialog`
adds to it two ways: describe the domains or controls you want covered
and it matches offline (the same keyword heuristic as the scope
suggester) across all three built-in catalogs for one-click copying, or
write a control by hand (code, name, description, question, sample
answer).

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
typography. Colors and typography live in `src/theme.ts` (MUI theme) and
`src/components/Layout.tsx` (header), plus `index.html` (font loading) and
`src/index.css` (page background).

### Home hero and step cards (`src/pages/HomePage.tsx`)

The hero stays deliberately simple — title, one summary paragraph, and the
two primary CTAs — so the page reads as clean rather than crowded. Right
below it, "Where would you like to start?" introduces four `StepCard`
tiles ("Scope & plan", "Collect evidence", "Assess & score", "Report &
present") that mirror the engagement phases as clickable, hover-elevating
cards: each lifts, gains an accent border, and reveals a sliding arrow on
hover, then routes to the relevant page (or scrolls to the scope section
on the same page) on click. It's the page's main interactive, inviting
surface — a modular card grid restyled in the app's own Deloitte palette
rather than a decorative illustration or a metrics readout.


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
  components/          shared UI (Layout, MaturityBarChart, evidence/scope dialogs)
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
