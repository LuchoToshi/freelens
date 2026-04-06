<!-- GSD:project-start source:PROJECT.md -->
## Project

**Freelens**

A web calculator for creative freelancers with irregular income. Takes three inputs — current balance, tax rate, runway target — and returns one number: what's safe to spend right now. Shows the math transparently so freelancers trust the output and act on it.

**Core Value:** A freelancer with money in their account should be able to know exactly what they can spend without fear — not guess, not worry, know.

### Constraints

- **Scope**: No accounts, no persistence, no integrations — validate core value with zero backend first
- **Output**: One number only in v1 — resist the pull to add more outputs before the primary one is trusted
- **Stack**: TBD — web, simple, fast to ship; no premature infrastructure
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Framework: React + Vite (not Next.js)
### Styling: Tailwind CSS v4
### State: None
### Router: None
### Deployment: Vercel
## What NOT to Use (and why)
| What | Why Not |
|------|---------|
| **Next.js** | SSR framework. No server needs here. Adds framework weight for zero benefit. |
| **Create React App** | Deprecated. React's own docs recommend against it. Webpack-based, slower everything. |
| **Svelte / Vue** | Valid technically, but React maximizes available help, examples, and patterns during a fast validation build. |
| **shadcn / MUI / Chakra** | Three number inputs do not need a component library. Write them in Tailwind directly. |
| **Zustand / Jotai** | State is three numbers. Local `useState` is the correct answer. |
| **Jest / Vitest** | Don't set up a test suite for a validation prototype. Add when the formula grows complex enough to warrant it. |
## Confidence Notes
| Claim | Confidence | Source |
|-------|------------|--------|
| Vite 6 recommended for non-framework React SPAs | HIGH | Official React docs |
| Tailwind v4 uses Vite plugin, no config file required | HIGH | Official Tailwind docs |
| Vercel SPA rewrite config needed for deep links | HIGH | Official Vercel docs |
| React 19, TypeScript 5 are current stable | HIGH | Consistent across sources |
| CRA is deprecated | HIGH | React docs confirm it |
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
