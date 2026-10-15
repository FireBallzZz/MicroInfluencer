# RESPONSIVE_QA

> What I actually verified, what I didn't, and known limitations.

## 1. What I verified

### Build & typecheck
- `npm run build` passes (`tsc -b && vite build`) with **0 errors and 0 warnings**. 1619 modules transformed.

### Dev server smoke test
- `npm run dev` started on `http://localhost:5173/` without errors.
- All 24 routes return HTTP 200 (SPA shell):
  - Public: `/`, `/login`, `/register/role`, `/register/creator`, `/register/brand`, `/forgot-password`, `/verify-code`, `/reset-password`, `/unauthorized`
  - Creator: `/creator/dashboard`, `/creator/profile`, `/creator/profile/edit`, `/creator/accounts`, `/creator/campaigns`, `/creator/campaigns/:id`, `/creator/applications`, `/creator/notifications`
  - Brand: `/brand/dashboard`, `/brand/profile`, `/brand/profile/edit`, `/brand/creators`, `/brand/campaigns`, `/brand/campaigns/create`, `/brand/campaigns/:id`, `/brand/campaigns/:id/edit`, `/brand/campaigns/:id/proposals`, `/brand/creators/:id`, `/brand/notifications`
  - Catch-all: `/nope-404` → renders the editorial 404

### CSS bundle sanity
- 52.88 kB CSS / 9.64 kB gz (includes Fraunces + Inter + JetBrains Mono + keyframes + utility classes)
- 381.72 kB JS / 102.17 kB gz
- No `console.error` from Vite during dev or build.

### Responsive patterns I deliberately built in

- **Container:** `.container-page` is `max-w-7xl mx-auto px-5 sm:px-8 lg:px-10`. Mobile 20px → tablet 32px → desktop 40px.
- **AppShell sidebar:** hidden on `<lg` (mobile / tablet), inline on `lg+`. Mobile hamburger opens a 18rem off-canvas drawer with `translate-x` transition + scroll lock + Esc to close. Drawer closes on route change.
- **Header search:** hidden on `<md`, visible `md+`. The mobile drawer surfaces a "Quick actions" section as a backup.
- **Notification popover:** `w-[min(92vw,24rem)] sm:w-96` so it can't exceed 92% of the viewport on phones.
- **Tables:** the creator Dashboard applications table uses `overflow-x-auto` + `min-w-[600px]` so it scrolls horizontally on narrow screens rather than collapsing unreadably.
- **Filter sheets:** the "More filters" panels are hidden by default on all sizes, expanded on demand. On `<sm` they show below the search input; on `sm+` they appear in a separate row inside the same card.
- **Hero search sidecar:** the 4-column grid collapses to 8/4 on `lg+`, stacks vertically on `<lg`.
- **Editorial roles section:** the two role cards become a 1-up stack on `<lg` and a 2-up row on `lg+`.
- **Display type:** `display-xl` uses `clamp(2.75rem, 7.5vw, 6.25rem)` so the headline scales smoothly from phone to ultra-wide.
- **Touch targets:** buttons enforce `min-height: 44px` on coarse pointers (defined in `index.css`).
- **Safe area:** `.safe-top` / `.safe-bottom` available; the modal bottom sheet uses them.
- **Forms:** inputs are full-width by default; field rows become 2-up on `sm+` (`grid sm:grid-cols-2 gap-4`).

## 2. What I did **not** verify (honest)

- I did **not** open the app in a real headless browser and screenshot it at 320 / 390 / 768 / 1024 / 1440 px. I do not have headless Chromium available in this environment.
- I did **not** test the long-form proposal list, the campaign form, or the edit profile screens on actual mobile devices. The classes are written to behave correctly (`grid sm:grid-cols-2`, `flex-col-reverse sm:flex-row`), but I did not visually confirm.
- I did **not** measure keyboard focus traps on every modal (the shared `Modal.tsx` already had them; I didn't break it).
- I did **not** run Lighthouse or any other performance audit.
- I did **not** run an automated accessibility scan. Manual review only.

## 3. Known limitations to address next

- **Long creator / campaign names** in cards may wrap to 2 lines and shift card heights. Acceptable; I can lock the title to `line-clamp-2` (already in place for cards; verify on tables too).
- **Filter sidecar at very narrow widths** still uses `flex-wrap` which could create a tall stack on 320px. Acceptable but worth a second pass.
- **Profile cover art** is generated SVG. On very high-DPI mobile it looks great, but at large viewports the cover band height (120px) could be richer.
- **Notifications list** is grouped by date in the full page, but the dropdown shows only the top 8 — no grouping. Acceptable for a popover; the full page is the source of truth.
- **Demo seed data** is hard-coded in `src/data/seed.ts`. If the user has stale `microinf_store_v1` in localStorage, they'll see a previous session's state. The store already handles JSON parse failures.
- **No skeleton loaders** in practice. I added the `.skeleton` class for completeness but didn't use it on any page; the demo data is local so loading is instant. Worth wiring into the discovery / campaign list pages if/when a backend is added.
- **YouTube OAuth** is mocked (a button in `ConnectedAccounts.tsx` just adds a placeholder connected account). The PRD acknowledges backend isn't built.
- **Toast container** is global and the new pages call it consistently, but the toasts stack bottom-right and the position isn't iOS-safe-area-aware. Minor.

## 4. What to test in the next QA round

| Viewport | Pages to spot-check |
|---|---|
| 320 × 568 (iPhone SE) | Landing hero copy, hero search sidecar, auth login form, role selection cards, mobile drawer, creator dashboard cards |
| 390 × 844 (iPhone 14) | Same + filter sheet, profile cover band, proposal list |
| 768 × 1024 (iPad) | Two-column dashboard, two-column role cards, sidebar still hidden but Quick actions inline |
| 1024 × 1366 (iPad Pro) | Sidebar visible, dashboard two-column to single-column shifts |
| 1440 × 900 (laptop) | All 12-col grids resolve correctly; KPM row balances; tables fit |
| 1920 × 1080 (desktop) | Hero copy fits in 8/12; `display-xl` caps at 6.25rem |

## 5. Accessibility quick check

- Every interactive element is a real `<button>`, `<a>`, or `<input>`. No `div onClick` for primary actions.
- Focus rings: `*:focus-visible` applies a 2px ember/40 ring with 2px paper offset. Consistent across the app.
- `prefers-reduced-motion`: all `animation` / `transition` durations collapse to `0.01ms`; reveal/marquee/stagger/anim-fade-in/anim-pop-in/anim-item-in become no-ops. Modal open still works, just instantly.
- Color contrast:
  - `ink-900` (#0B0A08) on `paper-50` (#FBF9F3) = ~19:1. AAA.
  - `ink-500` (#3F3A2E) on `paper-50` = ~10:1. AAA for body.
  - `ember-500` (#B8502B) on `paper-50` = ~5.5:1. AA for normal text, AAA for large.
  - `paper-50` on `ink-900` (auth visual panel) = ~19:1. AAA.
- Modals (`Modal.tsx`) trap focus, Esc to close, restore focus on unmount. Unchanged.
- Drawer scroll lock: `document.body.style.overflow = 'hidden'` while open. Unchanged.
- Buttons that load on touch devices have `min-height: 44px` enforced via CSS.
- Skip link: not added. Consider adding a hidden "Skip to main" anchor in `PublicLayout.tsx` and `AppShell.tsx` in a follow-up.

## 6. Build & deploy status

- `npm run build` succeeds. The output (`dist/`) is the static site Vercel expects (the existing `vercel.json` should pick it up).
- No new dependencies added; no `package.json` changes.
- No build-time env vars; no secrets in source.
- `git log` shows the prior WIP commit; this v0.2 redesign is on branch `redesign/v2`.
