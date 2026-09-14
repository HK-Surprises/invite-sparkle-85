# InviteHub V1 Roadmap

- [x] 1. Design system + layouts (admin, customer, public)
- [x] 2. Cloud: schema, roles, RLS, seed data
- [x] 3. Auth + role routing
- [x] 4. Admin customers (list/new/detail)
- [x] 5. Admin templates + categories
- [x] 6. Customer templates → invitation form
- [x] 7. Customer guests + add guest (limit, token, success card)
- [x] 8. Public /i/$token + view recording + expired page
- [x] 9. My Invitation per-guest preview, copy/share/QR, Links page
- [x] 10. Analytics, admin invitations, settings, dashboards
- [x] 11. End-to-end test

## Premium template upgrade (Sep 2026)
- [x] Royal Prestige, Rose Gold Blush, Emerald Royale interactive templates
- [x] Metadata-driven template registry (add folder + one entry)
- [x] Older basic designs deactivated; existing invitations migrated
- [x] Customer gallery with live preview

## Customer category browsing (Sep 2026)
- [x] Replace flat customer template gallery with database-driven category cards
- [x] Add category-specific template galleries with preview and selection
- [x] Verify desktop/mobile flow and existing invitation creation

## Past customers & dashboard totals (Sep 2026)
- [x] Archive customers into a Past Customers view (history kept, restore supported)
- [x] Archived customers become read-only (no new guests/invitations)
- [x] Admin templates split into Active / Inactive tabs
- [x] Customer dashboard totals across all invitations with per-invitation breakdown

## Template engine & developer contract (Sep 2026)
- [x] Stable contract in `src/templates/contract.ts` (`InvitationTemplateProps`, `TemplateDefinition`, `defineTemplate`)
- [x] Per-template folders with their own `template.ts` definition; legacy designs isolated in `legacy/`
- [x] Registry rebuilt around definitions (gallery vs internal visibility, single sample source)
- [x] Shared building blocks re-exported from `src/templates/kit`
- [x] Developer reference template `example-basic/` (internal visibility)
- [x] `docs/TEMPLATE_GUIDE.md` — new template development manual
