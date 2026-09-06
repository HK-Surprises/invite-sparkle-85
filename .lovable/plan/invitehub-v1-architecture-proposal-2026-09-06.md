# InviteHub V1 — Architecture Proposal

One invitation design, one unique link per guest. Everything below serves that.

## 1. Recommended architecture

A single modular monolith: one web app with three route zones (Admin, Customer, Public invitation), a shared design system, and a service layer that owns all business rules. Data, auth and server logic run on Lovable Cloud (managed Postgres + Auth). No microservices, no queues, no third-party services beyond that.

```text
Browser ──> App (SSR + client)
              ├─ /admin/*    (SUPER_ADMIN only)
              ├─ /app/*      (CUSTOMER only)
              ├─ /i/:token   (public, no login)
              └─ Server functions (business rules, enforced with DB policies)
                     └─ Lovable Cloud: Postgres + Auth
```

## 2. Technology stack

- App: TanStack Start (React 19, SSR), TypeScript, Tailwind v4, shadcn-style components, TanStack Query
- Backend: Lovable Cloud (Postgres, Auth, Row Level Security, server functions)
- Charts: Recharts (admin/customer analytics)
- QR: lightweight client-side QR library
- Hosting: Lovable (free/low-cost tier); no other paid infra

## 3. Database schema

- `profiles` — id (= auth user), full_name, mobile, created_at
- `user_roles` — user_id, role (`super_admin | customer`; enum reserved for `studio`, `event_manager` later). Separate table, never on profiles.
- `customers` — id, user_id, name, email, mobile, type (`individual`, extensible), status (`active|inactive`), invitation_limit, start_date, end_date, notes, created_at
- `categories` — id, name, slug, description, is_active, sort_order
- `templates` — id, category_id, name, slug, component_key, preview_image_url, description, field_schema (json: which fields this template needs), is_active, created_at
- `customer_template_access` — customer_id, template_id, granted_at (unique pair)
- `invitations` — id, customer_id, template_id, title, data (json: names, date, venue, message…), status (`draft|active|inactive`), created_at
- `guests` — id, invitation_id, name, mobile, group_name, token (unique, indexed, 10-char random), status (`not_opened|opened`), last_viewed_at, created_at
- `invitation_views` — id, guest_id, viewed_at (raw log; supports later analytics)
- `platform_settings` — key, value (json) — platform name, support email/phone, timezone, maintenance mode

Counters (used/remaining, opened) are computed from `guests`, not duplicated.

## 4. Entity relationships

```text
auth.users 1─1 profiles        user_roles N─1 auth.users
auth.users 1─1 customers
customers  1─N invitations     invitations N─1 templates N─1 categories
customers  N─N templates  (via customer_template_access)
invitations 1─N guests         guests 1─N invitation_views
```

V2 hooks: `customers.type` + `user_roles.role` allow Studio/Event Manager; a customer can already own many invitations.

## 5. Route structure

- Public: `/` (landing + sign in CTA), `/auth`, `/i/$token`, `/expired` (rendered inline, not a redirect)
- Customer (`/app`): `dashboard`, `templates`, `invitation/new` (details form), `invitation` (My Invitation: guest table + live per-guest preview), `guests`, `links`, `analytics`, `settings`
- Admin (`/admin`): `dashboard`, `customers`, `customers/new`, `customers/$id`, `templates`, `categories`, `invitations`, `analytics`, `settings`

## 6. Authentication & authorization

- Email/password login via Lovable Cloud Auth; single `/auth` page routes users by role after login.
- Roles in `user_roles`, checked with a `has_role()` database function (no client-side role storage).
- Route gates: `/admin/*` and `/app/*` require session; admin layout additionally requires `super_admin`; customers hitting `/admin` are redirected.
- Real enforcement is server-side: RLS policies (customers see only their rows; admins see all) plus server functions for anything with rules:
  - `add_guest` — DB function that counts guests vs `invitation_limit` inside a transaction; rejects when full.
  - `create_invitation` — verifies template is in `customer_template_access` and active.
  - `resolve_invitation(token)` — public server function: validates token, customer status, invitation status, start/end dates; returns only guest name + invitation data + template key; records a view. Guests never receive a direct table read.
- Customers have no write access to `customers`, `customer_template_access`, `templates`, `categories`, `platform_settings`.

## 7. Folder structure

```text
src/
  routes/            admin/, app/, i.$token.tsx, auth.tsx, index.tsx
  components/ui/     Button, Card, Dialog, Table, Badge, Tabs, Skeleton…
  components/shared/ StatsCard, StatusBadge, EmptyState, SearchInput,
                     Sidebar, Topbar, DataTable, CopyButton, ShareButton
  features/
    invitations/     InvitationPreview, GuestTable, AddGuestDialog, forms
    templates/       TemplateCard, TemplateGallery
    customers/       CustomerForm, AccessEditor
  templates/         registry.ts + one component per template (data-driven)
  lib/*.functions.ts server functions (invitation, template, customer services)
  lib/*.server.ts    server-only helpers (token generation, validation)
  integrations/      Cloud client (generated)
  types/             shared types
```

Templates: `registry.ts` maps `component_key` → React component. Adding a template = one component + one DB row. Supports 50+ without structural change.

## 8. V1 development phases

1. Design system + layouts (admin SaaS shell, customer warm shell, public card)
2. Cloud setup: schema, roles, RLS, seed data (categories, 8 templates, demo customer Rahul Shah with invitation + guests)
3. Auth + role routing
4. Admin: customers (list, create, detail with limit/templates/dates)
5. Admin: templates + categories
6. Customer: templates gallery → invitation details form
7. Customer: guests + add-guest flow with limit + token + success card
8. Public `/i/$token` + view recording + expired/inactive page
9. Customer: My Invitation with per-guest live preview, copy/share/QR, Links page
10. Analytics (customer + admin), admin invitations, settings, dashboards
11. End-to-end test of the full chain (admin → customer → guest opens → status flips to Opened)

## 9. Security considerations

- Tokens: 10+ chars from a 58-char alphabet via crypto RNG (~58 bits), unique index, no PII in URLs
- All limits, expiry, template access and status checks enforced in DB functions / server functions; UI checks are cosmetic
- RLS on every table; public page reads through a single validated server function, never a table
- Input validated with Zod on every server function
- Roles in a separate table; admin checks via security-definer function
- Public invitation returns minimal data (no mobile numbers, no customer email)
- View logging is insert-only and rate-tolerant (one status flip, many raw views)

## 10. Estimated complexity per module

| Module | Complexity |
|---|---|
| Design system + 3 layouts | Medium |
| Schema, RLS, seed | Medium |
| Auth + roles | Low–Medium |
| Admin customers (CRUD + access) | Medium |
| Admin templates/categories | Low |
| Customer templates + invitation form | Low–Medium |
| Guests + limit + tokens | Medium (core) |
| Public `/i/$token` + 8 template designs | High (core, mobile-first, most visual effort) |
| Per-guest preview + share/QR | Medium (core) |
| Analytics + dashboards + settings | Low–Medium |

## Design direction (from your brief)

Soft white base, light lavender/blue surfaces, restrained purple primary, peach/pink/green accents; rounded cards, soft shadows, generous spacing, elegant serif display font with a clean sans body. Admin reads as calm professional SaaS; customer area warmer; public invitation is a full-bleed premium mobile card with delicate floral motifs.

## Explicitly out of V1

RSVP, CSV import, WhatsApp API/bulk sending, drag-drop editor, Studio/Event Manager UI, multi-event management, location/device tracking.

On approval I start with phases 1–3 and proceed through the list, pausing only if something needs your decision.
