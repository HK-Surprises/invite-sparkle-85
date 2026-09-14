# INVITEHUB — NEW TEMPLATE DEVELOPMENT GUIDE

This manual describes the **actual** InviteHub template system. Everything here
reflects the code in this repository. A designer/AI can build a completely new
invitation design using only this document.

---

## 1. Architecture in one line

```
Core platform (auth, customers, guests, tokens, access, sharing, analytics, DB)
        │  resolves + personalizes invitation data
        ▼
Template component  ──►  Rendered invitation
```

**Core platform** owns: authentication, customer accounts and limits, admin,
categories, template access, invitation/guest records, token generation,
expiry/status validation, sharing, analytics, routing, security.

**Template presentation layer** owns: layout, typography, colour, decoration,
animation, transitions, interactive visual sections.

A template is a **pure React component**. It must NOT contain: database queries
or mutations, Supabase imports, auth or permission checks, token generation,
guest/invitation creation, sharing logic, analytics calls, expiry validation, or
routing decisions. If you think you need one of those, the design is wrong.

---

## 2. The contract

File: `src/templates/contract.ts` — the only stable API between core and templates.

```ts
export interface InvitationTemplateProps {
  title: string;                 // invitation title, e.g. "Rahul & Priya Wedding"
  data: InvitationData;          // customer-entered content (all fields optional)
  guestName: string;             // personalized guest, always present
  peopleCount?: number | undefined; // people this guest invitation covers
}

export type InvitationTemplateComponent = ComponentType<InvitationTemplateProps>;
```

These four props are **everything** a template receives, on every surface
(gallery card, preview dialog, guest preview, public `/i/:token`).

> `TemplateRenderProps` in `src/types/index.ts` is the older name for the same
> shape and is kept for backwards compatibility. New templates import
> `InvitationTemplateProps` from `@/templates/contract`.

---

## 3. Available invitation data

`InvitationData` (`src/types/index.ts`). **Every field is optional** — a template
must render sensibly when any of them is missing. Values are always `string`.

| Field | Type | Req. | Purpose | Example |
|---|---|---|---|---|
| `title` (prop, not in data) | `string` | required | Invitation title | `"Rahul & Priya Wedding"` |
| `guestName` (prop) | `string` | required | Personalized guest name | `"Amit Shah"` |
| `peopleCount` (prop) | `number?` | optional | Guests covered by this link | `4` |
| `groomName` | `string?` | optional | Groom / first person | `"Rahul"` |
| `brideName` | `string?` | optional | Bride / second person | `"Priya"` |
| `primaryName` | `string?` | optional | Single celebrant (birthday, housewarming, katha) | `"Aarav"` |
| `milestone` | `string?` | optional | Age / anniversary number | `"5"` |
| `eventDate` | `string?` | optional | Main event date, ISO `yyyy-MM-dd` | `"2026-12-20"` |
| `eventTime` | `string?` | optional | Main event time, free text | `"7:30 PM"` |
| `venueName` | `string?` | optional | Venue name | `"The Grand Palace"` |
| `venueAddress` | `string?` | optional | Street/area | `"SG Highway"` |
| `city` | `string?` | optional | City | `"Ahmedabad"` |
| `venueMapUrl` | `string?` | optional | Google Maps link; kit falls back to a search URL | `"https://maps.app.goo.gl/..."` |
| `hostNote` | `string?` | optional | Hosting families / closing note | `"Shah & Mehta families"` |
| `message` | `string?` | optional | Personalized message to guests | `"Your presence would..."` |
| `events` | `string?` | optional | Multi-event list, one per line: `Name \| Date \| Time \| Venue` | `"Mehndi \| 18 Dec 2026 \| 4:00 PM \| Palace Lawns"` |
| `story` | `string?` | optional | Couple / celebration story | `"Two families, one beginning…"` |
| `galleryUrls` | `string?` | optional | Image URLs, one per line (https only, max 6 used by the kit) | `"https://…/1.jpg"` |
| `blessing` | `string?` | optional | Closing blessing line | `"Blessings from both families"` |

`InvitationData` has an index signature (`[key: string]: string \| undefined`),
so a template may read a custom key — but the customer form only collects the
fields above, so never depend on anything else.

**Countdown data**: there is no stored countdown field. Derive it from
`eventDate` (+`eventTime`) with `useCountdown` / `<Countdown />` from the kit.

**NOT CURRENTLY SUPPORTED** (do not fake these; ask before adding product scope):
guest group name inside the template (stored on the guest, not passed to the
template), invitation description separate from `title`, per-event descriptions,
dedicated hero/background/decorative image fields (only `galleryUrls`), audio or
video fields, RSVP data, multi-language content.

---

## 4. Guest personalization contract

* The same template renders once per guest; only `guestName` (and
  `peopleCount`) differ. The public page resolves this server-side from the
  guest token (`resolve_invitation`), so the template does nothing.
* A template **must never** hard-code a guest name, customer name, event
  details, or an invitation URL. Static decorative wording is fine.
* Always render `guestName` visibly — that personalization is the product.
* Use `guestGreetingLine(guestName, peopleCount)` from the kit for the
  "Amit Shah & family (4 guests)" style line, or write your own.

---

## 5. Folder structure

```
src/templates/
  contract.ts            # the template contract (do not edit)
  registry.tsx           # central registry (add one entry per template)
  samples.ts             # shared sample content for previews
  shared.tsx             # layout/typography primitives
  premium/kit.tsx        # cinematic helpers
  kit/index.ts           # public re-export of both (import from here)
  example-basic/         # ← reference implementation, copy this
    index.tsx
    template.ts
  royal-prestige/
  rose-gold-blush/
  emerald-royale/
  legacy/                # first-release designs, kept for old invitations
src/assets/templates/<slug>/   # template-specific images (create as needed)
```

Each template folder contains:

* `index.tsx` — the component (split into more local files if you like)
* `template.ts` — the `TemplateDefinition` (default export)
* optional: local helper/animation components, local assets

---

## 6. Registering a template

1. Create `src/templates/<your-slug>/index.tsx` exporting the component.
2. Create `src/templates/<your-slug>/template.ts`:

```ts
import { defineTemplate } from "../contract";
import { weddingTemplateSample } from "../samples";
import { YourTemplate } from "./index";

export default defineTemplate({
  id: "your_template_01",       // MUST equal templates.component_key in the DB
  name: "Your Template",
  category: "Wedding",          // reference only; admin assigns the real category
  description: "One line shown on gallery cards.",
  accent: "linear-gradient(135deg, oklch(0.3 0.08 25), oklch(0.85 0.12 85))",
  component: YourTemplate,
  active: true,
  sample: weddingTemplateSample, // or a custom TemplateSample
});
```

3. Add one import + one array entry in `src/templates/registry.tsx`.
4. Ask an admin to insert one `templates` row where `component_key` equals your
   `id`, with the desired `name`, `description`, `category_id` and `is_active`.

`TemplateDefinition` fields: `id`, `name`, `category`, `description`, `accent`,
`component`, `active`, `visibility` (`"gallery"` default | `"internal"`),
`sample`.

---

## 7. Categories

Categories live in the database (`categories`) and are attached to the
**database template row**, not the component. The customer gallery groups
category cards and filters by `templates.categories.slug`.

Templates must never branch on category. The `category` string in the
definition is documentation for admins/designers only. A "Birthday Fun"
template is simply a template whose DB row points at the Birthday category.

---

## 8. Active / inactive / access

| Control | Where | Effect |
|---|---|---|
| `definition.active` | registry | Registry-level availability flag |
| `templates.is_active` | database | Authoritative: inactive templates disappear from the customer gallery; admin sees them under the Inactive tab |
| `customer_template_access` | database | Which templates a specific customer may select |
| `visibility: "internal"` | registry | Renders if referenced, never listed anywhere |

**Rule preserved:** being previewable in public/admin does **not** mean a
customer can use a template. Admins grant per-customer access. A template
implements none of this — it only renders.

---

## 9. Assets

* Template-specific images/illustrations: `src/assets/templates/<slug>/…`,
  imported as ES modules (`import arch from "@/assets/templates/<slug>/arch.png"`).
* Large binaries may instead be uploaded as Lovable assets and referenced by a
  `.asset.json` pointer URL.
* Customer photos come from `data.galleryUrls` (external https URLs) — always
  handle zero images.
* Icons: `lucide-react`, or inline SVG for decorative ornaments (preferred for
  ornamental Indian motifs — it scales and themes with the palette).
* Fonts: use the existing `font-display` / `font-sans` families. New webfonts
  require a `<link>` in `src/routes/__root.tsx` (core file) — avoid unless
  essential.
* Audio and video are **not supported** by the invitation engine today.
* Naming: lower-kebab-case files, scoped to the template folder.

---

## 10. Colour & theming

Templates use a scoped palette. Add a class in `src/styles.css` (this is the one
core file a template may touch, adding its own block only):

```css
.tpl-yourslug {
  --tpl-bg: …; --tpl-surface: …; --tpl-fg: …;
  --tpl-muted: …; --tpl-accent: …; --tpl-accent-soft: …;
}
```

Then use `bg-tpl-bg`, `text-tpl-fg`, `text-tpl-muted`, `bg-tpl-surface`,
`text-tpl-accent`, `bg-tpl-accent-soft`. Never hard-code `text-white`,
`bg-black` or hex utilities.

---

## 11. Animation & interaction

No animation library is installed and none should be added. Available today:

* CSS utilities in `src/styles.css`: `inv-reveal` / `inv-reveal-in`
  (scroll reveal), `inv-float`, `inv-bob`, `inv-enter`, `inv-gold-text`.
  All are disabled under `prefers-reduced-motion`.
* Kit components (`src/templates/kit`):
  * `<Reveal delay>` — IntersectionObserver scroll-triggered entrance
  * `<CoverGate cover={(opening, open) => …}>` — cinematic opening gate
    (doors, curtains, envelope…)
  * `<Countdown />` / `useCountdown(date, time)`
  * `<Floaters items={["✦","❋"]} />` — drifting decorative glyphs
  * `<ScrollCue />`, `<EventsList />`, `<Gallery />`, `<VenueBlock />`,
    `<DateLine />`, `parseEvents`, `parseGallery`
* Tailwind transitions/transforms for parallax, 3D (`perspective`, `rotateY`),
  shimmer and staged entrances — see `royal-prestige/index.tsx`.

Keep animation GPU-friendly (transform/opacity) and always usable if it never
runs.

---

## 12. Responsive contract

The public invitation is **mobile-first**. Minimum requirements:

* Root element: `flex min-h-full w-full flex-1 flex-col` — the container sets
  the height; never use `h-screen` or fixed pixel widths.
* Design for a 360–430 px wide viewport first; scale up with `sm:` / `md:`.
* The public page renders inside a `max-w-md` column; previews render a 390×760
  frame scaled by `InvitationPreview`. Content must not overflow horizontally.
* No horizontal scrolling, no fixed positioning relative to the browser window,
  tap targets ≥ 40 px, text ≥ 12 px.
* Must remain readable on tablet and desktop (the same column, centred).

---

## 13. Preview system

All four surfaces use the same component and the same props — build once, work
everywhere:

| Surface | Where | Data |
|---|---|---|
| Gallery card thumbnail | `TemplateCard` → `InvitationPreview` | `definition.sample` |
| Preview dialog | `templates.$categorySlug.tsx`, admin templates | `definition.sample`, guest "Amit Shah" |
| Guest-specific preview | `GuestPreviewPanel` | real invitation data + real guest |
| Public invitation | `/i/:token` | server-resolved data + guest |

There are no preview **images** — previews are live renders of the component
inside a scaled phone frame (`src/components/shared/InvitationPreview.tsx`).
So your template must look right at 390×760 and must not depend on browser-only
APIs during first paint (SSR renders `/i/:token`; guard `window` usage in
`useEffect`).

---

## 14. Files you may and may not touch

**Create / modify freely**

* `src/templates/<your-slug>/**` (component, helpers, local assets)
* `src/assets/templates/<your-slug>/**`
* `src/templates/registry.tsx` — one import + one array entry
* `src/styles.css` — add your own `.tpl-<slug>` palette block only

**Do NOT modify**

* `src/templates/contract.ts`, `src/templates/shared.tsx`,
  `src/templates/premium/kit.tsx`, `src/templates/kit/index.ts`,
  `src/templates/legacy/**`, other templates' folders
* `src/routes/**`, `src/lib/**`, `src/features/**`, `src/components/**`
* `src/integrations/supabase/**`, `src/types/index.ts`, any database migration

If the kit is missing something generally useful, say so instead of editing core
files yourself.

---

## 15. Complete example

`src/templates/example-basic/` is a working, registered reference template
(`visibility: "internal"`, so it never shows in the gallery). It demonstrates
the props, guest personalization, event list, venue block, scroll reveals, a
scoped palette and mobile-first layout in ~60 lines. Copy the folder, rename the
slug and id, and start designing.

---

## 16. Testing checklist

Before handing over a new template:

- [ ] Renders with the full sample (`sampleDataFor("<id>")`)
- [ ] Renders with **only** `title` + `guestName` (all optional data empty)
- [ ] Guest name is visible and comes from props — no hard-coded names
- [ ] `peopleCount > 1` renders sensibly
- [ ] No horizontal scroll at 360 px, 430 px, 768 px, 1280 px
- [ ] Looks correct in the 390×760 preview frame (gallery card + dialog)
- [ ] Public `/i/:token` renders (SSR-safe: no `window` at module/render time)
- [ ] Animations degrade gracefully with `prefers-reduced-motion`
- [ ] Only `tpl-*` semantic colours used; no hard-coded colour utilities
- [ ] `bunx tsgo --noEmit -p tsconfig.json` passes
- [ ] Only files from section 14's "create/modify" list changed
- [ ] Registry entry added and the matching DB row exists with the same
      `component_key`
