# Trace Intel

**AI observability interface for investigating failed LLM traces**

Trace Intel is a product prototype for AI investigators reviewing model and pipeline failures. It turns raw evaluation signals into a workflow for understanding **what failed, why it failed, how confident the diagnosis is, and what action to take next**.

This repository is a public implementation and design artifact showing how I approach AI product design as a system: information architecture, failure states, confidence, evidence, remediation, responsive behavior, design tokens, and implementation constraints.

## What this demonstrates

- **AI systems UX** — making model behavior, failures, evidence, and uncertainty legible
- **Observability workflows** — moving from failure detection to investigation and remediation
- **Information architecture** — organizing trace history, timeline, root cause, evidence, and suggested actions
- **Confidence-aware UI** — visually separating severity from diagnostic confidence
- **Design systems** — semantic tokens, reusable patterns, responsive rules, and documented component behavior
- **Design → code** — implemented as a responsive Next.js product rather than a static mockup
- **Agent-ready documentation** — repository guidance for future human or AI contributors

## Product model

```text
Failed trace / evaluation
        ↓
Trace timeline
        ↓
Root-cause hypothesis
        ↓
Evidence + confidence
        ↓
Suggested remediation
        ↓
Investigator action
```

The interface separates **severity** from **confidence**. A critical failure can still have a low-confidence diagnosis, which changes how the investigator should interpret and act on the result.

## Core experience

The desktop experience is organized around four coordinated areas:

1. **Navigation** — product-level navigation
2. **Failure list** — recent failed traces and severity
3. **Investigation workspace** — trace timeline, root cause, and evidence
4. **Suggested actions** — remediation guidance, impact, and contextual questions

The layout adapts down to mobile, where secondary panels become focused overlays rather than shrinking a dense desktop dashboard into an unreadable view.

## Design system

The repository includes a documented design system covering:

- severity tokens: critical / high / medium / low
- confidence states: high / medium / low confidence
- timeline states: OK / warning / failed
- typography hierarchy
- responsive layout behavior
- reusable interaction patterns
- accessibility and implementation guidance

See [`DESIGN.md`](DESIGN.md) for the complete specification.

## Repository map

```text
.
├── DESIGN.md          # Product UI + design-system specification
├── AGENTS.md          # Guidance for AI/human contributors
├── CLAUDE.md          # Project-specific agent instructions
├── src/               # Product implementation
├── public/            # Static assets
├── scripts/           # Supporting scripts
├── package.json       # Runtime + build dependencies
└── README.md          # Project overview
```

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn / Radix UI
- Lucide icons

## Why I built it

AI product teams increasingly need interfaces that explain more than whether a model succeeded or failed. Investigators need enough context to distinguish a bad output from a bad retrieval step, tool failure, latency issue, policy failure, or uncertain diagnosis.

Trace Intel explores how product design can make those operational signals **readable, actionable, and appropriately uncertain** without overwhelming the person investigating the system.

## My role

**Product design · AI systems UX · information architecture · design system · prototyping · front-end implementation**

The project is part of my broader work exploring AI observability, evaluation, agent behavior, and developer-facing AI products.
