# Microwork — Micro-Influencers' Platform (Frontend Demo)

A polished, fully interactive frontend for the internship PRD: a two-sided marketplace connecting micro-influencers with small-to-medium brands.

This is a **demo** — no real backend. State persists in `localStorage`. The design closely follows Upwork's marketplace feel (clean white surfaces, a confident green primary, generous spacing, real statuses).

## Run it

```bash
cd microinf-platform
npm install
npm run dev
```

Open http://localhost:5173 and use the role picker on `/login` to switch between Creator and Brand dashboards. All data is reset to seed values via the in-app buttons.

## What's inside

- **Public**: Landing, Role selection, Creator/Brand registration, Login, Forgot/Verify/Reset password.
- **Creator**: Dashboard, Profile (view + edit), Connected Accounts (YouTube OAuth flow + manual entry for other platforms with Unverified badges), Campaign discovery, Campaign detail with eligibility + Apply modal, My proposals + Application detail with withdraw + Accepted-withdrawal reason, Notifications.
- **Brand**: Dashboard, Company profile, Creator discovery, Creator public profile, Campaign list (tabs by status), Create / Edit campaign (validation, Save Draft / Publish), Campaign detail with Publish/Close/Delete actions, Proposal management (status filters, withdrawn-hidden default, transition controls, confirmation dialogs), Notifications.

All UI states follow the PRD: loading, empty, error, success, validation, unauthorized.

## Project structure

```
src/
  components/      Reusable UI (AppShell, Modal, ConfirmDialog, ui kit, CampaignCard)
  data/seed.ts     Mock data (creators, campaigns, proposals, notifications)
  pages/
    auth/          Auth flow pages
    brand/         Brand-side screens
    creator/       Creator-side screens
    public/        Landing
    shared/        404, unauthorized, notifications
  state/           Auth + Toast context, in-memory store w/ localStorage
  types.ts         Shared TypeScript types
```

## Resetting the demo

Use the **Switch demo role** item in the avatar menu to log out, or clear `localStorage` in DevTools to reset everything.