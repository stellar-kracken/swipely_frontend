# Swipely — Frontend

The web dashboard for **Swipely**, a monitoring platform for cross-chain asset
bridges and DEX liquidity on the Stellar network. This app renders real-time
analytics, bridge health, and alert views consumed from the Swipely backend API.

## Tech stack

- **React 18** + **TypeScript** + **Vite**
- **TanStack Query / Table / Virtual** for data fetching and large tables
- **Zustand** for client state
- **Recharts** for charts and visualizations
- **react-i18next** for internationalization
- **Tailwind CSS** for styling
- **Storybook** for component development
- **Vitest** + **Playwright** for unit and visual testing

## Getting started

```bash
npm install
npm run dev          # start the Vite dev server
```

The dashboard expects the Swipely backend API to be reachable. Configure the API
base URL via the environment variables documented in the app config.

## Useful scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:visual` | Run Playwright visual tests |
| `npm run storybook` | Launch Storybook |
| `npm run lint` | Lint the source |

## Related repositories

- [`swipely_backend`](https://github.com/stellar-kracken/swipely_backend) — API and monitoring services
- [`swipely_contract`](https://github.com/stellar-kracken/swipely_contract) — Soroban smart contracts

## License

MIT — see [`LICENSE`](./LICENSE).
