# Stack Research

**Project:** Freelens — Safe to Spend Calculator
**Confidence:** HIGH on all primary recommendations

## Recommended Stack

**React 19 + Vite 6 + TypeScript 5 + Tailwind CSS v4, deployed to Vercel.**

Bootstrap in one command:
```bash
npm create vite@latest freelens -- --template react-ts
```

### Core Framework: React + Vite (not Next.js)

React docs recommend Vite for projects that don't need a full-stack framework. This product has no server, no API routes, no auth — Next.js is the wrong tool. Vite gives a working dev server and production build in under 60 seconds with zero framework overhead.

TypeScript is worth adding. The formula has three inputs and derived outputs. Types prevent the silent bug where `taxRate` is 25 when you expected 0.25.

### Styling: Tailwind CSS v4

v4 ships as a Vite plugin. No `tailwind.config.js`. No PostCSS. One install, one line in `vite.config.ts`, one `@import` in CSS.

```bash
npm install tailwindcss @tailwindcss/vite
```

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({ plugins: [tailwindcss()] })
```

### State: None

Three `useState` calls and a pure function. Any state library here is over-engineering.

### Router: None

One page, no routes. URL-encoded inputs for shareability (`?balance=8000&tax=25&runway=3`) is 10 lines of `URLSearchParams` — not a reason to add React Router.

### Deployment: Vercel

Zero-config for Vite SPAs. Free tier. Preview URLs per branch — useful for sending interview subjects a link to a specific prototype state. One `vercel.json` needed for SPA routing:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Cloudflare Pages is a valid alternative; Vercel edges it for prototype sharing with non-technical users.

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
