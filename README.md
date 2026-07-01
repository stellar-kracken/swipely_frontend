# Swipely — Frontend

The web dashboard for **Swipely**, a monitoring platform for cross-chain asset

bridges and DEX liquidity on the Stellar network. The app surfaces real-time
bridge health, liquidity, reconciliation, and incident data consumed from the
Swipely backend API, and gives operators the tooling to investigate and act on
it (alert routing, playbooks, exports, access audits, and more).

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [Project structure](#project-structure)
- [Testing](#testing)
- [Docker](#docker)
- [Further documentation](#further-documentation)
- [Contributing](#contributing)
- [Related repositories](#related-repositories)
- [License](#license)

## Features

- **Bridge & asset monitoring** — health scores, timelines, topology
  exploration, and per-asset comparisons across bridges.
- **Liquidity analytics** — DEX liquidity dashboards and fragmentation views.
- **Incidents & alerts** — incident timelines with replay, alert routing
  administration, playbooks, and a simulation sandbox for testing rules.
- **Data integrity tooling** — reconciliation runs, cross-chain state
  verification, data provenance graphs, and schema drift / freshness
  monitoring.
- **Operator utilities** — watchlists, saved reports, scheduled exports, a
  command palette (`Cmd+K` / `Ctrl+K`, see [`COMMAND_PALETTE.md`](./COMMAND_PALETTE.md)),
  API key management, and an operational access audit log.
- **Internationalization** — UI strings are translated into English, Spanish,
  French, German, Japanese, Korean, Chinese, and Arabic (`src/i18n/locales`).

## Tech stack

- **React 18** + **TypeScript** + **Vite**
- **React Router** for client-side routing
- **TanStack Query / Table / Virtual** for data fetching and large tables
- **Zustand** for client state
- **Recharts** for charts and visualizations
- **dnd-kit** for drag-and-drop interactions
- **react-i18next** for internationalization
- **Tailwind CSS** for styling
- **Storybook** for component development
- **Vitest** + **React Testing Library** + **MSW** for unit/integration tests
- **Playwright** for visual regression testing
- **ESLint** (`@typescript-eslint`) for linting

## Prerequisites

- Node.js 20+ and npm
- A running instance of the [Swipely backend](https://github.com/stellar-kracken/swipely_backend)
  (the dev server proxies API and WebSocket traffic to it)
- Docker (optional — only needed for container-based workflows)

## Getting started

```bash
git clone https://github.com/stellar-kracken/swipely_frontend.git
cd swipely_frontend
npm install
npm run dev          # start the Vite dev server on http://localhost:5173
```

By default, the dev server proxies `/api` and `/health` requests to
`http://localhost:3001` (see `vite.config.ts`). To point the built app at a
different backend, set `VITE_API_BASE_URL` in a local `.env` file.

## Environment variables

See [`.env.example`](./.env.example).

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Absolute origin of the backend API (REST + WebSocket) | Unset — REST/WS calls use same-origin relative paths, proxied by Vite in dev and by Nginx in the Docker production image |

Set `VITE_API_BASE_URL` when the static build is served without a same-origin
proxy in front of it (e.g. a Vercel deployment) — it's used for both REST
requests and the WebSocket connection. Vite only exposes variables prefixed
with `VITE_` to client code. Create a `.env.local` (already git-ignored) for
machine-specific overrides rather than editing checked-in config.

## Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint the source with ESLint |
| `npm run type-check` | Run TypeScript in `--noEmit` mode |
| `npm run test` | Run unit/integration tests once (Vitest) |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:coverage` | Run tests with a coverage report |
| `npm run test:ui` | Open the Vitest UI |
| `npm run test:visual` | Run Playwright visual regression tests |
| `npm run test:visual:update` | Update Playwright visual snapshots |
| `npm run storybook` | Launch Storybook on port 6006 |
| `npm run build-storybook` | Build a static Storybook site |

## Project structure

```
src/
├── components/   # Reusable UI components, organized by domain
│                 # (alerts, analytics, liquidity, risk, settings, ...)
├── pages/        # Route-level views, one per top-level page
├── services/     # API client and WebSocket client
├── stores/       # Zustand state stores
├── hooks/        # Shared React hooks
├── context/      # React context providers (notifications, shortcuts, ...)
├── contexts/     # Additional context providers
├── i18n/         # i18next setup and locale files
├── theme/        # Design tokens / theming
├── types/        # Shared TypeScript types
├── utils/        # Utility functions
└── test/         # Test setup, MSW mocks, and shared test utilities
```

Routing is defined in `src/App.tsx`, where every page is lazy-loaded and
rendered inside a shared `Layout`.

## Testing

Unit and integration tests use Vitest, React Testing Library, and MSW for API
mocking; see [`docs/TESTING.md`](./docs/TESTING.md) for conventions (custom
`render`, handler overrides, etc.). Visual regression tests use Playwright and
live in `tests/visual/`; see [`docs/visual-regression.md`](./docs/visual-regression.md).

```bash
npm run test            # unit tests
npm run test:coverage   # unit tests with coverage
npm run test:visual     # Playwright visual regression
```

Coverage thresholds are enforced in `vite.config.ts` (60% lines, 55%
functions, 30% branches, 55% statements) — `npm run test:coverage` fails the
build if a change drops coverage below these floors.

## Docker

A multi-stage `Dockerfile` supports both development and production:

```bash
# Development image with HMR (source mounted as a volume)
docker build --target dev -t swipely-frontend:dev .
docker run -p 5173:5173 -v "$(pwd)":/app swipely-frontend:dev

# Production image (Nginx serving the static build, with API/WS proxying)
docker build --target production -t swipely-frontend:prod .
docker run -p 80:80 swipely-frontend:prod
```

`nginx.conf` handles SPA routing, gzip compression, long-lived caching for
hashed static assets, and proxies `/api` and `/api/v1/ws` to a `backend`
service.

## Further documentation

The [`docs/`](./docs) directory has deeper notes on specific features and
subsystems, including dashboard customization, operator controls, the help
system, filter presets, live update pills, the recent activity timeline, and
the service health pulse widget. Keyboard shortcuts are documented in
[`context/`](./context) and [`COMMAND_PALETTE.md`](./COMMAND_PALETTE.md).

## Contributing

Contributions are welcome. This repository doesn't run CI yet, so please
verify changes locally before opening a pull request.

### Workflow

1. **Fork and branch.** Branch off `main` using a `<type>/<short-description>`
   name that matches the type of change, e.g. `feat/liquidity-heatmap`,
   `fix/reconciliation-filter-bug`, `test/watchlist-store`, or
   `docs/update-readme`.
2. **Make focused changes.** Keep pull requests scoped to a single feature,
   fix, or refactor — smaller PRs are easier to review and land faster.
3. **Add or update tests.** New components, hooks, stores, and pages should
   ship with Vitest coverage (see [Testing](#testing) and
   [`docs/TESTING.md`](./docs/TESTING.md)). If you touch a visually
   significant component, run `npm run test:visual` and update snapshots
   deliberately with `npm run test:visual:update` (review the diffs before
   committing them).
4. **Document new components in Storybook** when they're reusable UI building
   blocks (`npm run storybook`), and update the relevant file under
   [`docs/`](./docs) if you change user-facing behavior.
5. **Run the full local check suite** before pushing:
   ```bash
   npm run lint
   npm run type-check
   npm run test
   npm run build
   ```
6. **Commit with a clear message.** This repo loosely follows
   [Conventional Commits](https://www.conventionalcommits.org/):
   `feat: add liquidity fragmentation heatmap`,
   `fix: correct reconciliation range off-by-one`,
   `test: cover websocket store reconnect logic`,
   `docs: expand README contributing section`,
   `chore: bump vite dependency`. Keep the subject line under ~72 characters
   and use the body to explain *why*, not just *what*.
7. **Open a pull request against `main`.** Describe the change, link any
   related issues, note any manual testing performed, and call out UI changes
   with before/after screenshots where relevant.
8. **Respond to review feedback** and keep the branch up to date with `main`
   (prefer rebasing or merging `main` in, whichever this repo's maintainers
   currently favor) until it's approved and merged.

### Code style

- TypeScript everywhere in `src/`; avoid `any` where a real type is available.
- Follow the existing ESLint configuration (`.eslintrc.json`) — run
  `npm run lint` and fix warnings before submitting.
- Prefer colocating a component's tests, stories, and styles next to the
  component itself, following the existing folder-per-component pattern under
  `src/components/`.
- Use the path alias `@/` (configured in `vite.config.ts` and
  `tsconfig.json`) instead of long relative import chains where it improves
  readability.
- Keep translations in sync: if you add or change user-facing strings, update
  `src/i18n/locales/en.json` at minimum, and flag other locales as needing
  translation.

### Reporting issues

If you find a bug or want to propose a feature, open an issue describing the
problem, the expected behavior, and steps to reproduce (for bugs) or the use
case (for features).

## Related repositories

- [`swipely_backend`](https://github.com/stellar-kracken/swipely_backend) — API and monitoring services
- [`swipely_contract`](https://github.com/stellar-kracken/swipely_contract) — Soroban smart contracts

## License

MIT — see [`LICENSE`](./LICENSE).
