# Project: Garden Calendar Generator (ICS Export Tool)

> **Handoff doc for Claude Code.** Copy this whole file into your repo as `PROJECT_PLAN.md`,
> then start Claude Code and say: *"Read PROJECT_PLAN.md and implement it, starting with Phase 1."*

---

## 1. Goal

A **self-contained, static web app** (deployable to GitHub Pages, no build step) that lets a
user pick plants and care activities, then **download a `.ics` calendar file** importable into
Google Calendar, Apple Calendar, Outlook, etc.

Each activity becomes an **all-day event** spanning from the **earliest sensible date** to the
**latest optimal date** for that activity (e.g. "Prune Japanese Zelkova" = all-day event
spanning the whole safe pruning window).

---

## 2. Confirmed Decisions (do not re-litigate these)

| # | Decision |
|---|----------|
| 1 | **MVP scope**, but architected for easy extension. Plant/activity data lives in a **separate data file** so contributors never touch app logic. |
| 2 | **Categories**: `bonsai`, `vegetables-herbs`, `general` (hedge trimming, sowing, lawn, etc.). MVP may ship a thinner `general` set; structure must allow adding more later. |
| 3 | **Activities are category-scoped.** Each category defines its own activity types. UI presents activities as **checkboxes**. |
| 4 | **USDA hardiness zone dropdown** shifts activity dates via a per-zone seasonal offset. User can **also manually edit start/end dates** of any event before export. |
| 5 | **Feature-rich UI** (not the minimal version): filtering, live event preview, per-event date editing, select-all/none. |
| 6 | **Aesthetic**: *retro seed catalog* — vintage botanical print, aged-paper background, letterpress/woodtype display type, engraving-style ornaments, muted period palette (faded greens, terracotta, sepia, cream). |
| 7 | Output format: **ICS only** (RFC 5545). All-day events. |

### Open caveat to handle in code (not a blocker)
USDA zones describe *winter cold hardiness*, not frost/season timing, and are US-centric — the
end user is in Norway. So: implement the zone selector as a **generic "season offset"** that USDA
zones map onto (e.g. zone 6b = baseline, 0 days; each colder zone = later spring / earlier
autumn). Include an explicit **"Custom / manual offset (days)"** option so non-US users aren't
locked out. Document the approximation in the UI with a short tooltip.

---

## 3. Tech Constraints

- **No build step.** Plain HTML + CSS + JS. Must run when served as static files.
- **GitHub Pages compatible.** Served over HTTP, so `fetch()` of same-origin files is fine.
- **No external runtime dependencies / no CDN calls** — fully offline-capable once loaded.
  (Self-hosted fonts or a tasteful system-font stack only.)
- **Modern browsers**: Chrome, Firefox, Safari, Edge — desktop + mobile.
- **No backend, no API keys, no localStorage requirement** for MVP (localStorage may be added
  later for saving selections — keep state isolated so this is a small change).

---

## 4. Architecture & File Layout

```
/garden-calendar
├── index.html          # markup + app shell
├── css/
│   └── style.css       # retro seed-catalog styling
├── js/
│   ├── app.js          # UI wiring, state, render
│   └── ics.js          # ICS generation (RFC 5545), pure functions
├── data/
│   ├── activities.js   # activity-type definitions per category
│   └── plants.js       # plant database (the file contributors edit)
├── assets/             # fonts, ornaments/textures if used
├── PROJECT_PLAN.md     # this file
└── README.md
```

**Why separate `data/*.js` instead of JSON:** loading via `<script src>` assigns a global, so
the app also works when opened directly via `file://` (a plain `fetch()` of JSON would fail
there). Contributors extend the catalog by editing **only** `data/plants.js` / `activities.js`.

---

## 5. Data Schemas

Keep data declarative and validated at load time (log a clear console error on malformed entries).

### 5.1 `data/activities.js`
```js
// window.GARDEN_ACTIVITIES — activity types available per category.
window.GARDEN_ACTIVITIES = {
  bonsai: [
    { id: "prune",      label: "Structural pruning", color: "#6b7f4e" },
    { id: "pinch",      label: "Pinching / trimming", color: "#8a9a5b" },
    { id: "wire",       label: "Wiring",              color: "#9c6b3c" },
    { id: "repot",      label: "Repotting",           color: "#a8543e" },
    { id: "fertilize",  label: "Fertilizing",         color: "#c89b3c" },
    { id: "propagate",  label: "Propagation",         color: "#5b7a6a" }
  ],
  "vegetables-herbs": [
    { id: "sow-indoor", label: "Sow indoors",         color: "#8a9a5b" },
    { id: "sow-direct", label: "Direct sow",          color: "#6b7f4e" },
    { id: "transplant", label: "Transplant out",      color: "#5b7a6a" },
    { id: "harvest",    label: "Harvest",             color: "#c89b3c" }
  ],
  general: [
    { id: "hedge-trim", label: "Hedge trimming",      color: "#6b7f4e" },
    { id: "sow-lawn",   label: "Lawn sowing",         color: "#8a9a5b" },
    { id: "prune-shrub",label: "Shrub pruning",       color: "#9c6b3c" }
  ]
};
```

### 5.2 `data/plants.js`
```js
// window.GARDEN_PLANTS — the catalog. earliest/latest are the activity window.
// Dates stored as {month:1-12, day:1-31}. Windows MAY wrap the year boundary
// (e.g. earliest Dec → latest Feb) — generator must handle wrap-around.
window.GARDEN_PLANTS = [
  {
    id: "zelkova-serrata",
    name: "Japanese Zelkova",
    scientificName: "Zelkova serrata",
    category: "bonsai",
    activities: [
      {
        type: "prune",
        earliest: { month: 2, day: 15 },
        latest:   { month: 3, day: 31 },
        notes: "Structural pruning in late dormancy, before bud break."
      },
      {
        type: "repot",
        earliest: { month: 3, day: 1 },
        latest:   { month: 4, day: 15 },
        notes: "Repot as buds swell. Free-draining mix."
      }
      // ...more activities
    ]
  }
  // ...more plants
];
```

### 5.3 Zone offset model — `js/app.js`
```js
// Maps USDA zone -> seasonal offset in days applied to spring-side activities
// (positive = later) and mirrored on autumn-side activities. Baseline zone 6b = 0.
// Approximate; user can override with a manual offset.
const ZONE_OFFSETS = {
  "3": +28, "4": +21, "5": +10, "6": 0, "7": -10, "8": -21, "9": -28, "10": -35
};
```
- Activity definitions carry an optional `season: "spring" | "autumn" | "fixed"` so the offset
  is applied with the correct sign (or not at all for `fixed`, e.g. mid-winter dormancy tasks).
  Default `season` to `spring` if omitted.

---

## 6. ICS Generation Rules (`js/ics.js`)

- Output a single `VCALENDAR` with `VERSION:2.0` and a `PRODID`.
- One `VEVENT` per selected (plant × activity).
- **All-day events**: `DTSTART;VALUE=DATE:YYYYMMDD` and `DTEND;VALUE=DATE:YYYYMMDD`, where
  `DTEND` is **latest date + 1 day** (ICS all-day end is exclusive).
- `DTSTART`/`DTEND` derived from: base window → apply zone offset → apply any manual user edit.
- Each event needs a stable, unique `UID` (e.g. `${plantId}-${activityType}-${year}@garden-cal`).
- `SUMMARY` = `"<Activity label>: <Plant name>"`.
- `DESCRIPTION` = plant notes + window rationale + a line noting the applied zone/offset.
- `CATEGORIES` = the plant category; map activity color to `COLOR` where supported.
- Default to events for the **next occurrence** (current year, or next year if window passed).
  Optionally support an "repeat yearly" toggle via `RRULE:FREQ=YEARLY`.
- **Line folding**: fold lines >75 octets per RFC 5545. Escape `,` `;` `\` and newlines in text.
- Use `\r\n` line endings. Validate output parses in at least 2 calendar apps.

---

## 7. UI / UX Spec

Layout (single page, top-to-bottom on mobile; two-column on wide screens):

1. **Header** — title, one-line description, "retro seed packet" treatment.
2. **Settings bar** — USDA zone dropdown (+ "Custom offset" numeric input); optional
   "Repeat yearly" toggle.
3. **Category tabs/sections** — `Bonsai`, `Vegetables & Herbs`, `General`.
4. **Plant list** (per category) — searchable/filterable. Each plant row expands to show its
   activities as **checkboxes** (only activities valid for that plant/category).
   Select-all / clear-all controls per category.
5. **Live preview pane** — list of every event that will be exported: plant, activity,
   computed start/end dates. Each row has **editable date fields** (manual override) and a
   remove (✕) control. Live event count.
6. **Export button** — generates and downloads `garden-calendar.ics`. Disabled with a helpful
   message when nothing is selected.
7. **Footer** — short "How to import" note linking to Google/Apple/Outlook steps in README.

Behaviour:
- Changing zone/offset recomputes preview dates **except** rows the user manually edited
  (manual edits are sticky; show a small "edited" marker + a reset link).
- Wrap-around windows render correctly in the preview.
- All interactive elements keyboard-accessible; respects `prefers-reduced-motion`.

---

## 8. Aesthetic Direction — Retro Seed Catalog

- **Palette**: aged cream/manila paper, faded sage & olive greens, terracotta/brick red,
  sepia ink, mustard accent. Muted, slightly desaturated — like 1900s print.
- **Type**: a woodtype/slab or vintage display face for headings; a classic serif for body.
  Use self-hosted fonts or a careful serif system stack — no CDN.
- **Texture**: subtle paper grain / aged background; thin double-rule borders; engraving-style
  botanical ornaments or corner flourishes (inline SVG, kept lightweight).
- **Components**: plant entries styled like catalog listings; the export button like an old
  "Order Form" stamp; checkboxes as small ✕/✓ in boxed cells.
- Keep it tasteful and readable — period *flavour*, not a parody. Honour `prefers-reduced-motion`
  and maintain WCAG AA contrast despite the muted palette.

---

## 9. Build Phases (todo)

### Phase 0 — Scaffold
- [ ] Create file/folder layout from §4.
- [ ] `index.html` shell linking css/js/data files in correct order.
- [ ] Stub globals `GARDEN_ACTIVITIES`, `GARDEN_PLANTS`; verify they load.

### Phase 1 — Data layer
- [ ] Implement `data/activities.js` for all three categories (§5.1).
- [ ] Seed `data/plants.js`: **≥6 bonsai**, **≥8 vegetables/herbs**, **≥4 general** entries,
      each with realistic activity windows + notes. Cite/comment data sources inline.
- [ ] Add a small `validatePlants()` that logs clear errors on malformed entries.

### Phase 2 — ICS engine
- [ ] `js/ics.js`: pure functions — `buildEvent()`, `buildCalendar()`, text escaping,
      75-octet line folding, all-day exclusive-end handling, wrap-around windows.
- [ ] Unit-sanity check: log a sample `.ics` string to console; verify by eye against RFC 5545.

### Phase 3 — App logic & state
- [ ] `js/app.js`: load data, build state model (selections, zone, offset, manual edits).
- [ ] Zone-offset computation with `season` sign handling + manual-offset override.
- [ ] Recompute-on-change, with sticky manual date edits.

### Phase 4 — UI
- [ ] Render category sections, searchable plant list, activity checkboxes.
- [ ] Live preview pane with editable dates, remove control, event count.
- [ ] Export button → `Blob` download of `garden-calendar.ics`.
- [ ] Empty-state / error messaging; keyboard accessibility.

### Phase 5 — Styling
- [ ] Implement retro seed-catalog theme per §8 in `css/style.css`.
- [ ] Responsive: single-column mobile, two-column desktop. Print-friendly preview is a bonus.

### Phase 6 — Test & ship
- [ ] Verify generated `.ics` imports cleanly into Google Calendar **and** Apple Calendar
      (Outlook if possible).
- [ ] Edge cases: nothing selected; year-boundary wrap; very long windows; leap day.
- [ ] Cross-browser smoke test (Chrome/Firefox/Safari + one mobile).
- [ ] Write `README.md`: what it is, how to use, per-platform import steps, how to extend
      `data/plants.js`, data-source notes, the USDA-zone approximation caveat.
- [ ] Confirm it works served from a static host (e.g. `python -m http.server`) ahead of
      GitHub Pages deploy.

---

## 10. Acceptance Criteria

- [ ] Picking plants/activities and exporting yields a valid `.ics` that imports into Google
      Calendar and Apple Calendar with correct all-day spans.
- [ ] Changing USDA zone shifts non-edited event dates; manually edited dates stay put.
- [ ] Adding a new plant requires editing **only** `data/plants.js`.
- [ ] App runs as static files with no build step and no network calls after load.
- [ ] UI clearly reads as a retro seed catalog and is usable on mobile.

---

## 11. Explicitly Out of Scope (MVP)

- Accounts, sync, or any backend.
- Live weather / real frost-date APIs.
- localStorage persistence (leave a clean seam to add it later).
- CSV export, multiple separate calendar files (possible Phase 2).
