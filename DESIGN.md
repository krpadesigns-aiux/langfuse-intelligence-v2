# Trace Intel — Design System

AI observability dashboard. Surfaces failed LLM trace evaluations, root causes, and suggested remediations. Designed for AI investigators reviewing pipeline failures in real time.

**Stack:** Next.js 15 App Router · Tailwind CSS 4 · shadcn/ui · Inter font  
**Target viewport:** 1440px desktop primary, fully responsive down to 375px mobile  
**Theme:** Light only (dark mode CSS variables defined but not activated)

---

## 1. Brand

| Token | Value |
|-------|-------|
| Product name | Trace Intel |
| Tagline | Making AI behavior readable |
| Logo mark | `TI` in `text-white text-xs font-bold` on `bg-blue-600 size-8 rounded-lg` |
| Primary action color | `#2563eb` (blue-600) |

---

## 2. Color Tokens

All semantic colors are defined in `src/lib/tokens.ts`. Use Tailwind classes for components; use hex values only for canvas/charts/inline styles.

### Severity (riskTokens)

| Level | Border class | Background class | Text class | Border hex | Background hex | Text hex |
|-------|-------------|-----------------|-----------|-----------|---------------|---------|
| `critical` | `border-red-300` | `bg-red-100` | `text-red-700` | `#e2483d` | `#fef2f2` | `#dc2626` |
| `high` | `border-orange-300` | `bg-orange-100` | `text-orange-700` | `#f97316` | `#fff7ed` | `#ea580c` |
| `medium` | `border-amber-300` | `bg-amber-100` | `text-amber-700` | `#f59e0b` | `#fffbeb` | `#d97706` |
| `low` | `border-gray-300` | `bg-gray-100` | `text-gray-600` | `#d1d5db` | `#f9fafb` | `#6b7280` |

### Confidence (confidenceTokens)

| Level | Text class | Background class | Label |
|-------|-----------|-----------------|-------|
| `high` | `text-green-600` | `bg-green-50` | High Confidence |
| `medium` | `text-amber-600` | `bg-amber-50` | Medium Confidence |
| `low` | `text-orange-600` | `bg-orange-50` | Low Confidence |

### Timeline step status

| Status | Dot color | Label color |
|--------|-----------|------------|
| `ok` | `bg-green-500` | `text-green-600` |
| `warning` | `bg-amber-400` | `text-amber-600` |
| `failed` | `bg-red-500` | `text-red-600` |

### Surface colors (from globals.css CSS variables)

| Role | Value |
|------|-------|
| Background (page) | `#ffffff` (oklch 1 0 0) |
| Card / panel | `#ffffff` |
| Muted / secondary surface | `#f8fafc` (gray-50 / oklch 0.97) |
| Border | `#e5e7eb` (oklch 0.922) |
| Muted text | `#71717a` (oklch 0.556) |
| Base radius | `0.625rem` (10px) |

---

## 3. Typography

Font family: **Inter** (variable font, loaded via `next/font`). Applied globally on `<html>`.

| Role | Class | Size | Weight | Notes |
|------|-------|------|--------|-------|
| Page title (trace name) | `text-xl font-bold text-gray-900` | 20px | 700 | In unified header |
| Section heading | `text-[11px] font-bold uppercase tracking-[0.08em] text-gray-400` | 11px | 700 | "TRACE TIMELINE", "SUGGESTED ACTIONS" |
| Sidebar stat | `text-[2.5rem] font-bold` | 40px | 700 | Failure count |
| Sidebar stat label | `text-base font-normal` | 16px | 400 | "failures today" |
| Sidebar trace name | `text-xs font-semibold text-gray-900` | 12px | 600 | Truncated |
| Sidebar failure type | `text-[11px] text-gray-700` | 11px | 400 | Truncated |
| Sidebar timestamp | `text-[11px] text-gray-400` | 11px | 400 | Relative: "2h ago" |
| Sidebar stat sub | `text-xs text-gray-500` | 12px | 400 | "3 critical · avg 45% ↓" |
| Body text | `text-sm text-gray-700` | 14px | 400 | Evidence items, action buttons |
| Card description | `text-sm leading-5 text-gray-500` | 14px | 400 | Root cause description |
| Badge / label | `text-[9px] font-bold uppercase` | 9px | 700 | Severity chip on sidebar row |
| Step status label | `text-[11px] font-semibold uppercase tracking-wide` | 11px | 600 | OK / WARNING / FAILED |
| Latency | `text-xs text-gray-400` | 12px | 400 | "234ms" |
| Confidence badge | `font-semibold` (value) + `font-normal opacity-80` (label) | 12px | 600/400 | via shadcn Badge ghost variant |
| Breadcrumb | `text-xs text-gray-400` | 12px | 400 | "Traces › trace-id" |
| Chat input placeholder | `text-sm placeholder:text-gray-400` | 14px | 400 | |
| Toast | `text-sm font-medium text-white` | 14px | 500 | Feedback confirmation |

---

## 4. Layout

All measurements are exact pixel values from the implemented code.

```
┌──────────────────────────────────────────────────── 1440px ────┐
│  Header                                              h: 52px    │
├────────┬──────────┬──────────────────────┬────────────────────-┤
│ LeftNav│ Sidebar  │  Main panel          │  Right panel        │
│  68px  │  280px   │  flex-1 (grow)       │  300px              │
│        │          │                      │                      │
│        │          │  Trace Timeline      │  Suggested Actions   │
│        │          │  Root Cause Card     │  Why these actions?  │
│        │          │  Evidence Panel      │  Estimated Impact    │
│        │          │                      │  Ask chatbox (pinned)│
└────────┴──────────┴──────────────────────┴──────────────────────┘
```

| Zone | Width | Notes |
|------|-------|-------|
| Header | full width, `h-[52px]` | `border-b bg-white px-4` |
| Left nav | `w-[68px]` | `shrink-0 border-r bg-white px-2 py-2` |
| Sidebar | `w-[280px]` | `shrink-0 border-r bg-white` |
| Main panel | `flex-1` | `overflow-y-auto bg-white px-8 py-6` |
| Right panel | `w-[300px]` | `shrink-0 border-l bg-gray-50 flex-col` |
| Unified content header | full width of content area | `border-b bg-white px-8 py-4` |

**Mobile (< 768px / `md:` breakpoint):**
- Left nav: `hidden md:flex`
- Sidebar: `hidden md:flex` on desktop. On mobile, renders as a `fixed inset-y-0 left-0 z-40 w-[280px] shadow-xl` drawer with `bg-black/50` backdrop
- Right panel: `hidden md:flex`. On mobile, full-screen overlay via `fixed inset-0 z-40` triggered by "Details" floating button
- Header: hamburger `☰` visible (`md:hidden`), user info hidden (`hidden md:flex`)
- "Details" floating button: `fixed bottom-6 right-6 z-20 md:hidden bg-blue-600 rounded-full`

---

## 5. Components

### ConfidenceBadge
`src/components/trace/ConfidenceBadge.tsx`

Inline badge showing confidence percentage and level. Uses shadcn `Badge` with `variant="ghost"`.

```
Props: level: 'high' | 'medium' | 'low', value: number (0–100)
Render: "{value}% {label}"  e.g. "61% Medium Confidence"
Classes: gap-1 px-0 hover:bg-transparent + confidenceTokens[level].text
Value: font-semibold
Label: font-normal opacity-80
```

Appears in: sidebar header row (detail view), unified content header.

---

### RootCauseCard
`src/components/trace/RootCauseCard.tsx`

Card with severity-colored left border (`border-l-2`), alert icon, thumbs feedback, title, and description.

```
Props: severity, title, description, onThumbsUp?, onThumbsDown?
Container: rounded-xl border border-border border-l-2 bg-white shadow-sm
           + riskTokens[severity].border on the left-border
Header row: flex items-center justify-between border-b border-border px-5 py-3
  Left: TriangleAlert icon (text-amber-500 size-3.5) + "ROOT CAUSE DETECTED" label
  Right: 👍 👎 buttons (size-7 rounded-lg hover:bg-gray-100)
Body: flex flex-col gap-1.5 px-5 py-4
  Title: text-sm font-semibold leading-5 text-gray-900
  Description: text-sm leading-5 text-gray-500
```

---

### EvidencePanel
`src/components/trace/EvidencePanel.tsx`

Collapsible list of evidence strings. Two states: expanded (gray-50 header, scrollable list) and collapsed (first item + "Show N more" toggle).

```
Props: evidence: string[], expanded: boolean, onToggle: () => void
Container: rounded-xl border border-border bg-card shadow-sm text-sm

Expanded header: h-11 bg-gray-50 border-b border-[#e5eaed] px-5
  Left: "EVIDENCE" (text-xs font-bold tracking-wide text-gray-700)
        + count pill (bg-[#e5eaed] px-1.5 py-0.5 text-[11px] font-bold text-gray-500 rounded-full)
  Right: "▲ Hide" (text-xs text-gray-500)

Item list: ScrollArea max-h-48, ul gap-[5px] px-5 py-3
  Each item: size-[5px] rounded-full bg-gray-700 dot + text-[13px] text-gray-700

Collapsed: px-6 py-6, shows first item + "▼ Show N more" (text-xs text-gray-500)
```

---

### ActionList
`src/components/trace/ActionList.tsx`

Vertical list of action buttons. Each action is a full-width bordered button.

```
Props: actions: { id, label, onClick }[], className?
Container: flex flex-col gap-2
Each button: w-full rounded-md border border-gray-200 bg-white px-4 py-3
             text-left text-sm text-gray-700 shadow-sm hover:bg-gray-50
```

Used in the right panel under "Suggested Actions". Actions are AI-generated by `/api/suggest` (Claude Haiku), cached per trace.

---

### Sidebar Row
`src/components/layout/Sidebar.tsx`

Each trace in the sidebar renders as a 4-row button inside a `<ul>` with `divide-y divide-border`.

```
Active state:  border-l-2 border-blue-500 bg-blue-50 pl-[14px] pr-4
Inactive state: border-l-2 border-transparent pl-[14px] pr-4 hover:bg-gray-50

Row 1: flex justify-between gap-2
  Left:  truncate text-xs font-semibold text-gray-900  (trace name)
  Right: severity badge — rounded border px-1.5 py-px text-[9px] font-bold uppercase
         + riskTokens[severity].{bg, border, text}

Row 2: truncate text-[11px] text-gray-700 mb-1  (failure type)

Row 3: flex justify-between
  Left:  confidenceTokens[level].text + text-[11px] font-medium  (e.g. "61% Medium")
  Right: text-[11px] font-medium uppercase tracking-wide text-gray-400  ("IN REVIEW" or "NEW")

Row 4: text-[11px] text-gray-400 mt-0.5  (relative timestamp e.g. "2d ago")
         Only shown when trace.timestamp is present
```

Severity filter buttons above the list:
```
Container: flex gap-1 px-4 pb-2
Each button: rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide
  Active:   bg-blue-600 text-white
  Inactive: bg-gray-100 text-gray-500 hover:bg-gray-200
Filters: ALL · CRITICAL · HIGH · MEDIUM
```

Stats header above the list:
```
Count: text-[2.5rem] font-bold + " failures today" text-base font-normal
Sub:   text-xs text-gray-500  "{n} critical · avg {n}% ↓"
```

---

### Trace Timeline
`src/app/page.tsx` (inline section)

Ordered list of pipeline steps fetched from real Langfuse observations via `/api/traces/[id]`.

```
Container: rounded-xl border border-border bg-white px-5 py-4
Each step (li): flex items-start gap-3

  Status column (shrink-0 flex-col items-center self-stretch):
    Dot: mt-0.5 size-2.5 rounded-full ring-2 ring-white + STEP_DOT[status]
    Connector line: mt-1 w-px flex-1 bg-gray-200  (hidden on last item)

  Content row: flex flex-1 items-baseline justify-between gap-4
               pb-5 on all except last (pb-0)
    Step name: text-sm leading-tight text-gray-800
    Right side: flex items-center gap-3
      Latency:       text-xs text-gray-400  "{n}ms"
      Status label:  w-14 text-right text-[11px] font-semibold uppercase tracking-wide
                     + STEP_LABEL[status]

Loading state: 4 animate-pulse h-5 rounded bg-gray-100 bars at widths 80%/60%/90%/70%
Empty state:   "No timeline data available" text-sm text-gray-400 centered in px-5 py-8
```

Step data comes from `GET /api/traces/[id]` → Langfuse `observations[]`.  
Observation level mapping: `ERROR` → `failed`, `WARNING` → `warning`, `DEFAULT`/`DEBUG` → `ok`.  
Falls back to static mock steps when real data is unavailable.

---

### Ask Chatbox
`src/app/page.tsx` (right panel, pinned to bottom)

Pinned chat interface for asking questions about the selected trace.

```
Outer: shrink-0 border-t border-border bg-gray-50 pb-3 pt-2
Inner card: mx-3 rounded-lg border border-t-2 border-gray-200 border-t-blue-500 bg-white p-4 shadow-sm

Header: flex items-center justify-between mb-3
  Title:  "Ask about this failure" text-sm font-semibold text-gray-900
  Toggle: ChevronDown icon (rotate-0 expanded / -rotate-90 collapsed), size-6 rounded hover:bg-gray-100

Message bubbles (max-h-48 overflow-y-auto):
  User:      self-end bg-blue-50 text-blue-900 rounded-lg px-3 py-2 text-sm
  Assistant: self-start bg-gray-100 text-gray-700 rounded-lg px-3 py-2 text-sm
  Thinking:  self-start bg-gray-100 text-gray-400  "Thinking…"

Textarea: w-full resize-none rounded-md border border-gray-200 p-3 text-sm
          min-height: 80px
          focus: border-blue-400 ring-1 ring-blue-400

Send button: bg-blue-600 text-white px-4 py-2 rounded-md text-sm
             disabled: opacity-50
             Icon: Send (size-3.5) + "Ask"
```

Submit on Enter (without Shift). Powered by `POST /api/ask` (Claude Haiku).

---

## 6. Badge System

### Severity badge (used in sidebar rows and unified header)

```
Shape:   rounded border px-2 py-0.5 (header) / px-1.5 py-px (sidebar)
Text:    text-[11px] font-bold uppercase (header) / text-[9px] font-bold uppercase (sidebar)
Colors:  from riskTokens[severity].{bg, border, text}
```

| Level | When to use |
|-------|------------|
| `CRITICAL` | Confidence < ~30%, security issues, data loss risk, SLA breach |
| `HIGH` | Confidence 30–54%, significant user impact, repeated failures |
| `MEDIUM` | Confidence 55–79%, intermittent failures, quality degradation |
| `LOW` | Confidence ≥ 80%, warnings only, no active harm |

### Status badge (right of confidence in sidebar)

```
Text: text-[11px] font-medium uppercase tracking-wide text-gray-400
IN REVIEW — trace has a non-zero confidence score
NEW       — confidence score is 0 or not yet computed
```

### Confidence badge (ConfidenceBadge component)

Inline, no background. Color only via `confidenceTokens[level].text`. Shows `"{value}% {label}"`.

---

## 7. Spacing

| Token | Value | Used for |
|-------|-------|---------|
| `px-8 py-6` | 32px / 24px | Main panel content padding |
| `px-8 py-4` | 32px / 16px | Unified header padding |
| `px-5 py-4` | 20px / 16px | Timeline card, evidence item list |
| `px-5 py-3` | 20px / 12px | Root cause card header |
| `px-5 py-4` | 20px / 16px | Root cause card body |
| `px-4 py-3` | 16px / 12px | Action buttons, sidebar padding |
| `p-5` | 20px | Right panel content area |
| `p-4` | 16px | Ask chatbox card |
| `gap-6` | 24px | Content area top-level sections (`space-y-6`) |
| `gap-5` | 20px | Right panel sections |
| `gap-3` | 12px | Timeline step horizontal gap |
| `gap-2` | 8px | Action list vertical gap, header items |
| `gap-1` | 4px | Filter buttons, breadcrumb chevron |
| `pb-5` | 20px | Between timeline steps |
| `mb-2.5` | 10px | Section label bottom margin |
| `mt-0.5` | 2px | Sidebar timestamp top margin |

---

## 8. States

### Selected sidebar row
```css
border-l-2 border-blue-500 bg-blue-50 pl-[14px] pr-4
```
Active trace highlighted with blue left border and light blue background.

### Hover (sidebar row)
```css
hover:bg-gray-50 transition-colors
```

### Loading — trace list
```
<div className="text-sm text-gray-400">Loading traces…</div>
centered in full viewport flex
```

### Loading — timeline steps
```
4 skeleton bars: h-5 animate-pulse rounded bg-gray-100
widths: 80%, 60%, 90%, 70%
```

### Loading — suggested actions
```
3 skeleton bars: h-[46px] animate-pulse rounded-md border border-gray-200 bg-gray-100
```

### Loading — "Why these actions?"
```
3 skeleton lines: h-3 animate-pulse rounded bg-amber-100
widths: 100%, 83%, 67%
```

### Empty — timeline
```
rounded-xl border border-border bg-white px-5 py-8
text-sm text-gray-400  "No timeline data available"
```

### Empty — severity filter
```
px-4 py-6 text-center text-xs text-gray-400
"No {severity} severity traces"
```

### Error banner (API unavailable)
```
shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700
"Could not load live data ({error}) — showing sample traces."
```

### Toast (feedback confirmation)
```
fixed bottom-6 right-6 z-50
rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg
Auto-dismisses after 2 seconds
```

### Mobile drawer (sidebar)
```
Backdrop: fixed inset-0 z-30 bg-black/50
Drawer:   fixed inset-y-0 left-0 z-40 w-[280px] bg-white shadow-xl
Close button inside drawer header: size-7 rounded-md text-gray-400 hover:bg-gray-100
Closes on backdrop click or trace selection
```

### Mobile details panel
```
Trigger: fixed bottom-6 right-6 z-20 rounded-full bg-blue-600 px-5 py-2.5
         text-sm font-semibold text-white shadow-lg md:hidden
Open:    fixed inset-0 z-40 flex w-full flex-col bg-gray-50
         with a close bar: flex items-center justify-between border-b px-4 py-3
```

---

## 9. Evaluation Indicators

### Confidence score display pattern
Confidence is a 0–100 integer derived from Langfuse scores or trace metadata (`confidenceScore` key).

```
≥ 70  → level: "high"   → text-green-600  "High Confidence"
40–69 → level: "medium" → text-amber-600  "Medium Confidence"
< 40  → level: "low"    → text-orange-600 "Low Confidence"
```

Shown in two places:
1. **Sidebar row** (Row 3 left): `"{value}% {Level}"` in confidence color
2. **Header** (ConfidenceBadge): `"{value}% {Level} Confidence"` inline ghost badge

### Correctness / pipeline step status
Steps come from Langfuse `observations[]`. Each observation's `level` maps to a visual status:

```
ERROR   → failed  → red dot (bg-red-500)   + "FAILED"  (text-red-600)
WARNING → warning → amber dot (bg-amber-400) + "WARNING" (text-amber-600)
DEFAULT → ok      → green dot (bg-green-500) + "OK"      (text-green-600)
DEBUG   → ok      → (same as DEFAULT)
```

Steps are ordered as returned by Langfuse (chronological by `startTime`). Latency is `endTime - startTime` in ms; `0ms` when `endTime` is null (step did not complete).

### Calibration display (sidebar stats header)
```
"{count} failures today"   — total deduplicated traces shown
"{n} critical"             — count where severity === "critical"
"avg {n}% ↓"               — mean confidenceValue across all displayed traces
```

The `↓` arrow indicates the average confidence is below healthy threshold (no threshold line shown; visual indicator only).

---

## API Surface

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/traces` | GET | Fetch all traces from Langfuse (limit 50) |
| `/api/traces/[id]` | GET | Fetch per-trace observations → timeline steps |
| `/api/feedback` | POST | Submit thumbs up/down score to Langfuse via `createScore()` |
| `/api/suggest` | POST | Generate AI action suggestions (Claude Haiku) |
| `/api/ask` | POST | Answer free-form questions about a trace (Claude Haiku) |

Langfuse credentials: `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_BASE_URL` (defaults to `https://cloud.langfuse.com`). All server-side only.
