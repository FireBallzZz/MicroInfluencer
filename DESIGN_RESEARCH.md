# DESIGN_RESEARCH

> Research notes that informed the Microwork v0.2 redesign.
> Honest about what was observed vs. assumed, with URLs.

## 1. Audit findings (code-first)

The previous design (`v0.1`) inherited the same AI‑default visual recipe:

| Area | Problem | Evidence | Improvement |
|---|---|---|---|
| Brand color | Single Upwork-green palette aliased as `brand-500/600/700` everywhere | `tailwind.config.js` v0.1 `brand: { 500: '#14A800' }` | Editorial duo-tone: warm `paper` + deep `ink` + one warm `ember` accent (terracotta). Old `brand-*` aliased to `ember-*` so dashboards stay on-brand. |
| Typography | Inter only, no display contrast | `index.html` v0.1 | `Fraunces` display + `Inter` body + `JetBrains Mono` for eyebrows / numerals |
| Sidebar nav | `rounded-full` with colored icon chips | `AppShell.tsx:53,83` | Editorial list with an `ink-900` active bar; `nav-item` / `nav-item-active` utilities |
| Creator cards | Same hover-lift pattern in `CampaignCard.tsx` | `card p-5 hover:border-brand-300 hover:shadow-pop` | Procedural `ChannelArt` SVG for each creator, KPI grid for metrics, `.card-hover` for lift |
| Avatars | Initials-only circles | `AppShell.tsx:356` | SVG-based `ChannelArt` (deterministic per seed) + initial `Avatar` for groups |
| Status badges | One hue, generic "verified" | `ui.tsx:144-177` | Square tags (`.tag-ember / .tag-green / .tag-amber / .tag-rose / .tag-sky / .tag-paper`) + one functional accent |
| Empty states | Generic "Inbox" icon | `ui.tsx:79-100` | `EmptyState` with eyebrow + next action + demo honesty note |
| Hero landing | Floating glass cards + mesh blobs | prior `AuthVisual` / `Landing` | Editorial kinetic type-driven hero (Fraunces `clamp()` scale, marker highlight on *micro*, "Try a search" sidecar) |
| Skeleton | `animate-pulse` only | `ui.tsx:136` | `.skeleton` shimmer with `JetBrains Mono`-aligned rhythm |
| Discovery | Plain `card` grid with hover lift | `CreatorDiscovery`, `CampaignDiscovery` | Editorial row cards with KPI grid; advanced filter sheet; sort; "eligible first" ordering |
| Dashboards | Decorative stat cards with no clear next action | both `Dashboard.tsx` | Action-first: "Up next — 3 things to do this week" + recent inbox + roster fill rate |
| Notification dropdown | 3-up dot stack, hard to scan | `AppShell.tsx:443` | Grouped by Today/Earlier, bold icons for unread, full-page page too |
| Modals | OK already (Esc + focus trap + scroll lock) | `Modal.tsx` | No change needed — kept as-is |
| Tables | Hard to read on mobile | `Dashboard.tsx` creator applications | Wrapped in `overflow-x-auto` with `min-w-[600px]` table |
| Mobile drawer | Off-canvas w-72 with rounded-full nav | `AppShell.tsx:175` | Tighter 18rem drawer, focus on primary action, animated `translate-x-0/-full` transition |

The audit is the basis for the implementation; the research is a sanity check on direction.

## 2. Research — observed patterns

> All notes below are from publicly accessible product surfaces observed during the research window. Each pattern is **adapted, not copied**.

### CreatorIQ — <https://www.creatoriq.com/>

Observed:
- Four-quadrant marketing taxonomy: *Discover → Manage → Track → Pay*. Our product is just the first two (find work + apply), so we adopt the **Discover + Manage** structure without faking a Track/Pay product.
- Status language is identical across the industry: shortlist / accept / reject. Adopted unchanged for proposal flow.
- Heavy emphasis on data: many "1,300+ brands", "20M creators" stat blocks. We keep this on landing but **mark demo data as demo**, not as a real user base.

What I did **not** copy:
- Their "Discover / Manage / Measure / Scale" feature wall on the home page. Too feature-roadmap for our product stage.
- The enterprise "Request a demo" CTA. Our demo is the product.

### Modash — <https://modash.io/>

Observed:
- "Influencer marketing platform → Shopify-first" positioning. Clear single primary user, not "everyone".
- Affiliate / Gifting / Paid partnerships triad. Same vocabulary we use (proposals / acceptance / acceptance rate).
- `1,400+ in-house teams` social proof pattern with circular logos. I used a **marquee** instead — same intent, less visual noise.

What I did **not** copy:
- The "everything under one roof" four-up CTA cluster with emojis. We use a single "Get started" + "Log in" in the header.
- The "Modash OÜ" legal entity footer pattern. Trivial and irrelevant to a demo.

### Aspire — <https://www.aspire.io/>

Observed:
- Marketplace framing: "the world's largest marketplace bring creators to you." This validates the *opposite* of how I designed the creator side — our creators **search and apply**, not get invited. I lean into that.
- "AI Creator Discovery" pushed as a faster path to filter-based discovery. We don't have AI; we just make filters fast.
- Strong status flow imagery (shortlist / accept / reject). Already adopted.

What I did **not** copy:
- The "Powering commerce through creators" hero with a half-tone stock photo. Our hero is a type-only Fraunces display — no photo.
- Multi-segment "campaign strategy" filter. Our filter set is opinionated and small.

### Editorial / portfolio reference — Are.na — <https://www.are.na/>

Observed:
- "No ads, no personalized recommendations" copy. Confident, anti-growth-hack tone. Adopted in our "Demo only" honesty on the landing footer.
- A custom serif (Areal) used everywhere. Adopted *Fraunces*, also a variable serif, for the same reason — it gives the brand a single voice.
- Long-form text over decorative visuals. Adopted in our landing manifesto, brief anatomy, and how-it-works sections.

What I did **not** copy:
- Are.na's deliberate roughness. We're an interface, not a notebook.

## 3. Reference matrix (compact)

| Product | Pattern observed | Why it works | What we adapted | What we avoided |
|---|---|---|---|---|
| CreatorIQ | 4-quadrant feature taxonomy | Clear mental model for enterprise buyers | Just "Discover + Manage" (matches our scope) | The "Pay / Track" promise we can't keep |
| Modash | Marquee social proof | Quiet, not loud | Same idea, on the landing | Logo wall with hex shapes |
| Aspire | Marketplace + filter discoverability | Creator+brand is a marketplace, not just a tool | Filter-first on both sides | "AI" marketing we don't have |
| Are.na | Custom serif, anti-growth copy | Memorable voice | Fraunces + restrained copy | The "no tracking" pitch (we don't claim it) |

## 4. Design direction

> Codename: **"The Brief"** — a working marketplace built on the discipline of a creative brief, not the gloss of a SaaS pitch deck.

### Why a brief metaphor

- A *brief* is the most concrete artifact in creator–brand work.
- It forces clarity: title, deliverables, deadline, budget, status.
- It rejects the SaaS tendency to add "AI co-pilots", "smart matches", and "inbox-zero" promise cards. We are a market; the data is the product.

### Visual system

- **Type:** Fraunces (variable serif) for display; Inter for body; JetBrains Mono for labels & numerals.
- **Color:** warm paper canvas (`#FBF9F3`–`#D2C8AC`), deep ink (`#1B1814`–`#F4F2EC`), one warm ember accent (`#B8502B`–`#7A311A`). No second hue. Functional colors only for status.
- **Shape:** square corners by default (`rounded-md` / `rounded-sm`); only hero panels use a slightly larger `rounded-[20–28px]`. No fully rounded pills except where status semantics require them.
- **Surface:** every card is paper-tinted, never pure white. Subtle 1px ink-200 borders, very low shadow.
- **Decoration:** none. No glassmorphism, no mesh, no glowing blobs. The only decorative grid is a faint 56px CSS grid with a radial mask on the hero, used for orientation not aesthetics.

### Density

- Tables use uppercase eyebrow labels (`text-[11px] tracking-[0.14em]`), small numerals, and 14–16px row padding.
- Cards pack real data (KPI grid, rates, deadlines) instead of a tagline.
- Stat bars (`StatRow`) use a 2-row dashed grid for at-a-glance comparison.

### Honesty

- Every "demo" element is labeled demo: "Demo data — localStorage" in footer, "Demo only — proposals live in localStorage" in empty states, "Illustrative · not real clients" in the partner marquee.
- The "Live market" feed on landing is clearly labeled "Sample data — auto-rotating".

## 5. Anti-patterns explicitly avoided

| Anti-pattern | Why we avoided |
|---|---|
| Floating glass cards | Replaced with editorial content cards |
| Mesh / blob gradients | Replaced with a faint 56px grid, radial-masked |
| Purple-blue gradient hero | Replaced with paper + ink + one warm accent |
| Rounded-full pills on every element | Replaced with square `.tag` / square icon buttons |
| Stock avatars with initials | Replaced with `ChannelArt` (deterministic SVG) + `Avatar` only for groups |
| Decorative stat cards | Replaced with `StatRow` and `KPI` (only when they have a function) |
| "Loved by 10,000+ brands" copy | Replaced with "Demo brands — illustrative" |
| AI copy ("smart", "powerful", "in seconds") | Replaced with concrete verbs (verify, apply, accept) |
| Decorative "Live" feed with random events | Kept on landing but **labeled as sample data** with deterministic items |
| Multiple accent hues | Single accent (`ember`) + functional colors only |
| Custom motion library | CSS keyframes only (less to ship, more accessible) |

## 6. What we did not research (honest gap)

- I did not test all five viewport sizes in a real headless browser. The build, type-check, and route smoke test all pass, but **I have not visually verified** the page at 320 / 390 / 768 / 1024 / 1440 px on real devices. See `RESPONSIVE_QA.md` for what I did verify and what I could not.
- I did not run automated accessibility tests. I rely on semantic HTML, focus rings, and `prefers-reduced-motion` handling.
- I did not measure real FCP / TTI. The CSS is 9.6 KB gzipped, the JS is 102 KB gzipped, so first-paint should be fast on a 3G device but this is unverified.
- I did not run Lighthouse.

These are honest gaps. They should be filled in the next iteration.
