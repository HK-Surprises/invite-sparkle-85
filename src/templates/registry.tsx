import type { InvitationData, InvitationTemplateComponent, TemplateDefinition, TemplateSample } from "./contract";
import { legacyTemplates } from "./legacy";
import royalPrestige from "./royal-prestige/template";
import roseGoldBlush from "./rose-gold-blush/template";
import emeraldRoyale from "./emerald-royale/template";
import exampleBasic from "./example-basic/template";
import { weddingTemplateSample } from "./samples";

/**
 * CENTRAL TEMPLATE REGISTRY
 * =========================
 * Adding a template = create `src/templates/<slug>/` (component + template.ts),
 * add ONE import + ONE entry below, and insert one `templates` database row
 * whose `component_key` equals the definition `id`. Nothing else in the
 * invitation engine, guest system, sharing, preview or routing changes.
 *
 * Full instructions: docs/TEMPLATE_GUIDE.md
 */
const definitions: TemplateDefinition[] = [
  royalPrestige,
  roseGoldBlush,
  emeraldRoyale,
  // Developer reference template (never listed — visibility: "internal").
  exampleBasic,
  // Designs from the first release, kept so older invitations keep rendering.
  ...legacyTemplates,
];

export type { TemplateDefinition, TemplateSample };
/** @deprecated Use `TemplateDefinition` from `@/templates/contract`. */
export type TemplateRegistryEntry = TemplateDefinition;

/** Every registered template, including internal and legacy ones. */
export const allTemplates: TemplateDefinition[] = definitions;

/** Templates that may appear in gallery/admin listings. */
export const templateRegistry: TemplateDefinition[] = definitions.filter(
  (t) => (t.visibility ?? "gallery") === "gallery",
);

const byId = new Map(definitions.map((t) => [t.id, t]));

export function getTemplateEntry(key: string): TemplateDefinition | undefined {
  return byId.get(key);
}

export function getTemplateComponent(key: string): InvitationTemplateComponent {
  return byId.get(key)?.component ?? royalPrestige.component;
}

/** Sample data used for gallery/preview surfaces when no invitation exists yet. */
export function sampleDataFor(componentKey: string): { title: string; data: InvitationData } {
  return getTemplateEntry(componentKey)?.sample ?? weddingTemplateSample;
}
