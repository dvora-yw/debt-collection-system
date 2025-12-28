# Copilot / Agent Instructions — debt-collection-client

Short, focused instructions to help an AI coding agent be productive with this repo.

## Quick summary
- React app bootstrapped with Create React App (CRA). UI uses Tailwind CSS and small component primitives under `src/components`. Backend API is proxied via `src/services/api.js` with baseURL `http://localhost:8081/api`.
- Main pages are wired in `src/App.jsx` using `react-router-dom` (routes: `/`, `/admin-dashboard`, `/admin-add-client`, `/client-dashboard`, `/payment-screen`, etc.). Auth state is handled with `AuthContext` (localStorage-backed).

## Key commands (developer workflows)
- Start dev server: `npm start` (CRA) — use this first after code changes.
- Build for production: `npm run build`.
- Run tests: `npm test`.
- If you see build-time CSS errors, stop dev server and re-run after fixes (`Ctrl+C`, `npm start`).

## Big-picture architecture & important files
- `src/components` — UI primitives and pages (e.g., `AdminDashboard.jsx`, `AdminAddClient.jsx`, `Card.jsx`, `Button.jsx`, `Badge.jsx`). Prefer editing primitives when adjusting visual style.
- `src/services/api.js` — axios instance, single source of truth for backend baseURL.
- `src/services/clientService.js` — example of service wrapper (`getClients`). Add small service modules for other domain entities for consistency.
- `src/components/AuthContext.jsx` — login/logout, localStorage persistence; use `useAuth()` to access `user`, `login`, `logout`.
- `src/index.css` and `src/styles/theme.css` — global CSS variables and Tailwind layers. Use CSS variables for theme colors and radius.
- `src/components/ErrorBoundary.jsx` — global render fallback used by `App`.

## API endpoints and patterns (what exists in this project)
- API base: `http://localhost:8081/api` (from `src/services/api.js`).
- Endpoints used by the UI (existing in the backend for this project):
  - `/payments` — list payments used for "תשלומים אחרונים".
  - `/messages` — list messages for notifications.
  - `/clients` — list clients used to compute client-related KPIs.
- Note: do not assume endpoints such as `/auth/me` or `/admin/dashboard/kpis` always exist; check backend if an endpoint is missing.

Example: fetch payments in a component:
```js
import api from '../services/api';
const payments = (await api.get('/payments')).data;
```

## Conventions & patterns to follow
- UI primitives: prefer small, composable components (`Card`, `Button`, `Badge`) — update these for site-wide style changes instead of styling every usage.
- RTL: the app uses `dir="rtl"` in major pages (Admin dashboard). Keep icon placement and ml/mr spacing consistent for RTL flows.
- Data-safety: code often needs optional chaining (e.g., `user?.email`) because `logout()` clears user and components may render while `user` is null.
- Amount parsing: payments may return numeric or string amounts — use helpers `parseAmount()` and `formatCurrency()` when summing/formatting.
- Navigation: use `useNavigate()` from `react-router-dom` to move between pages (example `navigate('/admin-add-client')`).

## Styling / Tailwind specifics & gotchas
- Tailwind is configured in `tailwind.config.js`. Add colors or radius tokens there for consistent use.
- Global CSS variables live in `src/index.css` and `src/styles/theme.css` (colors, radii, text sizes). Prefer variables over hardcoded hexes.
- WARNING (common cause of dev-time failures): do NOT import the Tailwind JS module from CSS. Bad example that will break builds:
```css
/* BAD — imports JS into CSS and causes `Unknown word "use strict"` */
@import 'tailwindcss';
```
- Another common error when copying from Figma: invalid at-rules (`@source`, `@custom-variant`, `@theme inline`) or invalid `@apply` utilities (e.g., `outline-ring/50`). If you see CSS processing errors, search for these and remove/replace them.

## Visual / Figma work guidance
- When implementing Figma visuals, update the base components first (`Card`, `Badge`, `Button`) and `tailwind.config.js` tokens — that ensures consistent look and fewer changes across pages.
- Avoid copying raw CSS from Figma tool outputs; sanitize the CSS and move variables into `:root` or the theme file.

## Error handling & debugging tips
- Typical debug cycle: make change → `npm start` → check browser console and terminal compile messages. If the dev server crashes, reviews the terminal stack trace first.
- Global errors: `src/index.js` adds global `error` and `unhandledrejection` listeners; `ErrorBoundary` wraps `App` to surface render-time errors gracefully.

## Tests & quality
- No test harness specific to domain logic exists yet. Use unit tests only for non-UI logic (helpers, services) via `npm test` (Jest/CRA default).

## Pull request / commit checklist for agents
- Run `npm start` and confirm no terminal build errors and no redbox in the browser.
- If you edit styles, check both light and dark (`.dark` variables are defined) and mobile breakpoints.
- If adding or calling an API endpoint, confirm the backend exposes it; update `src/services/*` accordingly.
- Add small, focused commits and a brief PR description: what changed, why, and steps to verify.

---

If any section is unclear or missing details you want (e.g., example payloads for `/payments` or a list of UI tokens from Figma), tell me which area to expand and I will iterate.  
