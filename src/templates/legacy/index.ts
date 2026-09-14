/**
 * Legacy designs from the first InviteHub release.
 *
 * They are kept so older invitations keep rendering and so the matching
 * (deactivated) database rows still preview in admin. Do not use them as a
 * reference for new work — follow `docs/TEMPLATE_GUIDE.md` instead.
 */
import { defineTemplate, type TemplateDefinition } from "../contract";
import {
  birthdayTemplateSample,
  engagementTemplateSample,
  housewarmingTemplateSample,
  religiousTemplateSample,
  weddingTemplateSample,
} from "../samples";
import { WeddingTraditional01 } from "./WeddingTraditional01";
import { WeddingModern02 } from "./WeddingModern02";
import { WeddingElegant03 } from "./WeddingElegant03";
import { WeddingMinimal04 } from "./WeddingMinimal04";
import { EngagementElegant01 } from "./EngagementElegant01";
import { BirthdayCelebration01 } from "./BirthdayCelebration01";
import { HousewarmingNewHome01 } from "./HousewarmingNewHome01";
import { ReligiousCelebration01 } from "./ReligiousCelebration01";

const accent = "linear-gradient(135deg, oklch(0.86 0.03 300), oklch(0.62 0.1 300))";

export const legacyTemplates: TemplateDefinition[] = [
  defineTemplate({ id: "wedding_traditional_01", name: "Traditional Wedding", category: "Wedding", description: "Classic bordered card with floral corners.", accent, component: WeddingTraditional01, active: false, sample: weddingTemplateSample }),
  defineTemplate({ id: "wedding_modern_02", name: "Modern Wedding", category: "Wedding", description: "Clean modern layout with a raised detail sheet.", accent, component: WeddingModern02, active: false, sample: weddingTemplateSample }),
  defineTemplate({ id: "wedding_elegant_03", name: "Elegant Wedding", category: "Wedding", description: "Soft florals with an elegant serif display.", accent, component: WeddingElegant03, active: false, sample: weddingTemplateSample }),
  defineTemplate({ id: "wedding_minimal_04", name: "Minimal Wedding", category: "Wedding", description: "Minimal typographic invitation.", accent, component: WeddingMinimal04, active: false, sample: weddingTemplateSample }),
  defineTemplate({ id: "engagement_elegant_01", name: "Elegant Engagement", category: "Engagement", description: "Ring motif with a delicate blush palette.", accent, component: EngagementElegant01, active: false, sample: engagementTemplateSample }),
  defineTemplate({ id: "birthday_celebration_01", name: "Birthday Celebration", category: "Birthday", description: "Playful confetti birthday card.", accent, component: BirthdayCelebration01, active: false, sample: birthdayTemplateSample }),
  defineTemplate({ id: "housewarming_new_home_01", name: "New Home", category: "Housewarming", description: "Griha Pravesh card with a home motif.", accent, component: HousewarmingNewHome01, active: false, sample: housewarmingTemplateSample }),
  defineTemplate({ id: "religious_celebration_01", name: "Religious Celebration", category: "Religious", description: "Double-bordered devotional card.", accent, component: ReligiousCelebration01, active: false, sample: religiousTemplateSample }),
];
