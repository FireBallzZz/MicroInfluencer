# REDESIGN_CHANGELOG

> What changed in v0.2, and why, with the file paths.

## 1. Design tokens

- **`tailwind.config.js`** — replaced the green `brand` palette with `paper` (warm canvas) + `ink` (type) + `ember` (accent); kept `brand-*` as an alias to `ember-*` so existing dashboard pages stay on-brand.
- **`src/index.css`** — rewrote the global stylesheet with editorial primitives: `.display-xl/lg/md/sm`, `.eyebrow`, `.tag-*`, `.btn-*`, `.input*`, `.card`, `.card-hover`, `.reveal`, `.marquee`, `.stagger`, `.anim-*`, `.skeleton`, `.nav-item[-active]`, `.section-rule`, `.marker`, `.no-scrollbar`, `.bg-grid-faint`, plus a global `prefers-reduced-motion` reset.
- **`index.html`** — loaded Fraunces (variable), Inter, JetBrains Mono; set `bg-paper-50 text-ink-700` on `<body>`.
- **No new dependencies** were added.

## 2. New shared UI library

- **`src/components/ui.tsx`** — replaced with a small design system: `Button`, `Label`, `Input`, `Textarea`, `Select`, `FormField`, `EmptyState`, `ErrorState`, `LoadingSpinner`, `Skeleton`, `SkeletonList`, `CampaignStatusBadge`, `ProposalStatusBadge`, `EligibilityChip`, `VerifiedBadge`, `PlatformIcon`, `Avatar`, `ChannelArt`, `KPI`, `SectionHeader`, `PageHeader`, `StatRow`, `ActionListItem`, `IconButton`, `SaveButton`, `AddChip`, `Spark`.
- **`src/components/CampaignCard.tsx`** — restyled: `ChannelArt` thumbnail, brand/niche/platform row, KPI grid (Budget / Creators / Deadline), eligibility + status footer.

## 3. Public surfaces

- **`src/components/PublicLayout.tsx`** — sticky-on-scroll header, mobile hamburger drawer, demo tag, restrained footer.
- **`src/components/AuthShell.tsx`** — editorial sign-in form on the left, role-specific ink panel on the right (desktop only).
- **`src/components/AuthVisual.tsx`** — replaced floating glass + mesh with three role-specific editorial cards + a sample activity feed (auto-rotating) + a 3-up key-value strip.
- **`src/pages/public/Landing.tsx`** — kept the type-led hero; added a **Marketplace section** with real seed creators and real seed campaigns, a "How it works" 3-step grid on `ink-900`, two editorial role cards, and a "Brief anatomy" sample campaign card.
- **`src/pages/auth/Login.tsx`, `RoleSelection.tsx`, `RegisterCreator.tsx`, `RegisterBrand.tsx`, `ForgotPassword.tsx`, `VerifyCode.tsx`, `ResetPassword.tsx`** — restyled to the new system; replaced rounded `brand-*` accents with `ember-*`; tightened form input style.

## 4. App shell

- **`src/components/AppShell.tsx`** — new sidebar (`w-60` with `nav-item[-active]` and ember-500 left bar), sticky header with logo + global search + quick actions + notification bell + user menu, mobile drawer (off-canvas, `translate-x`, scroll lock, Esc to close). Notification popover shows top-8 grouped items; full-page is on `/creator/notifications` and `/brand/notifications`.

## 5. Creator side

| File | What changed |
|---|---|
| `Dashboard.tsx` | Action-first: 2-up status cards (Profile / YouTube), real StatRow from store, "Up next" 3-card grid, latest briefs (with eligibility chip), latest applications table (mobile-scrollable). |
| `Profile.tsx` | Cover with `ChannelArt`, identity + verification + completion tags, Stats row, About / Portfolio / Details / Verification sidebar. |
| `EditProfile.tsx` | Form sections (`Basics` / `Audience` / `Rates` / `Portfolio`) with `AddChip` for portfolio links. |
| `ConnectedAccounts.tsx` | Card with stat row + Refresh / Reconnect / Disconnect; manual-entry panel for non-YouTube platforms. |
| `CampaignDiscovery.tsx` | Filter sheet (keyword + niche + platform + min budget + deadline), eligible-first sort, "Try a search" sidecar on landing. |
| `CampaignDetail.tsx` | Hero with `ChannelArt` cover, StatRow, brief details, eligibility card, "Apply now" CTA. Submit-proposal Modal with validation. |
| `MyApplications.tsx` | Tabbed list (All / Pending / Shortlisted / Accepted / Rejected / Withdrawn) with counts; mobile-friendly row cards. |
| `ApplicationDetail.tsx` | Replaced the `bg-brand-500` step indicator with `bg-ink-900` to match the new system. |

## 6. Brand side

| File | What changed |
|---|---|
| `Dashboard.tsx` | "Needs review" + "Fill rate" action cards, StatRow, "Active campaigns" roster cards (with accepted / proposals / new), "Latest proposals" inbox. |
| `Profile.tsx` | Hero with `ChannelArt` cover + avatar, StatRow (campaigns / live / drafts / closed), About panel. |
| `EditProfile.tsx` | "Identity" section with company / industry / website / logo / about. |
| `CreatorDiscovery.tsx` | Filter sheet (keyword + niche + platform + location + min/max followers + min engagement + verified-only), sort (relevance / followers / engagement / rate low→high). |
| `CreatorPublicProfile.tsx` | Hero + StatRow + bio + portfolio + rates + verification sidebar. |
| `CampaignList.tsx` | Tabbed list (All / Published / Draft / Closed), inline status actions (Publish / Close / Reopen), review / edit / delete row. |
| `CampaignForm.tsx` | Sectioned form (Basics / Budget & Logistics) with field validation. |
| `CreateCampaign.tsx`, `EditCampaign.tsx` | Wrap the shared form, header aligned with new system. |
| `CampaignDetail.tsx` | Hero + StatRow + roster fill rate + brief details + recent proposals. Publish/Close/Delete confirm dialogs. |
| `ProposalManagement.tsx` | Tabbed proposal list, per-proposal actions (Shortlist / Accept / Reject) gated by status, cover-message blockquote, withdraw reason, "Show withdrawn" toggle. |

## 7. Shared

- **`src/pages/shared/Notifications.tsx`** — grouped by Today / Earlier; per-row icon + unread dot; "Mark all read"; demo helper to push a sample notification.
- **`src/pages/shared/NotFound.tsx`** — editorial 404 with two clear actions.
- **`src/pages/shared/Unauthorized.tsx`** — editorial 403 with "Switch role" + "My dashboard" actions.

## 8. Motion

- **`tailwind.config.js`** — added `fade-up`, `fade-in`, `pop-in`, `pop-out`, `item-in`, `marquee`, `pulse-soft`, `blink`, `shimmer` keyframes + `animation.*` utilities.
- **`src/components/AppShell.tsx`** — `<main key={location.pathname} className="anim-page-in">` triggers a 0.5s `fade-up` on every route change.
- **`src/index.css`** — `.reveal` (uses `IntersectionObserver` via `useReveal`), `.marquee-track`, `.stagger > *`, `.skeleton`, plus the global `prefers-reduced-motion` reset.

## 9. Preserved business logic (no behavior changes)

- `src/state/Store.ts` — unchanged.
- `src/state/AuthContext.tsx` — unchanged.
- `src/state/ToastContext.tsx` — unchanged.
- `src/data/seed.ts` — unchanged.
- `src/types.ts` — unchanged.
- `src/components/Modal.tsx` — unchanged (already had Esc, focus management, scroll lock, mobile bottom-sheet).
- `src/components/CountUp.tsx` — unchanged.
- `src/components/useAnimatedOpen.ts` — unchanged.
- `src/hooks/useReveal.ts` — unchanged.
- `src/pages/creator/ApplicationDetail.tsx` — kept all logic; only swapped one `bg-brand-500` token to `bg-ink-900` for visual consistency.
- All other files: preserved and only restyled.

## 10. Build

- `npm run build` (i.e. `tsc -b && vite build`) passes: 0 errors, 0 warnings, 1619 modules → `index-Cb1NPYt8.css` 52.88 kB (9.64 kB gz) + `index-D6ehSADd.js` 381.72 kB (102.17 kB gz).
- Dev server (`npm run dev`) starts on port 5173 with no errors; all 24 routes return 200.
