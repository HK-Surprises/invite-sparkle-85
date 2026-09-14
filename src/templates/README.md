# InviteHub templates

A template is a pure presentation component: it receives
`InvitationTemplateProps` (`contract.ts`) and renders the invitation. No
database, auth, guest, token, sharing, analytics or routing logic belongs here.

- Contract: `contract.ts`
- Reusable blocks: `kit/` (re-exports `shared.tsx` + `premium/kit.tsx`)
- Reference implementation: `example-basic/`
- Registration: `registry.tsx` (one import + one entry per template)

Full manual: [`docs/TEMPLATE_GUIDE.md`](../../docs/TEMPLATE_GUIDE.md)
