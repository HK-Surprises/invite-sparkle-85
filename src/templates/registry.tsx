import type { ComponentType } from "react";
import type { InvitationData, TemplateRenderProps } from "@/types";
import { RoyalPrestige } from "./royal-prestige";
import { RoseGoldBlush } from "./rose-gold-blush";
import { EmeraldRoyale } from "./emerald-royale";
import { WeddingTraditional01 } from "./WeddingTraditional01";
import { WeddingModern02 } from "./WeddingModern02";
import { WeddingElegant03 } from "./WeddingElegant03";
import { WeddingMinimal04 } from "./WeddingMinimal04";
import { EngagementElegant01 } from "./EngagementElegant01";
import { BirthdayCelebration01 } from "./BirthdayCelebration01";
import { HousewarmingNewHome01 } from "./HousewarmingNewHome01";
import { ReligiousCelebration01 } from "./ReligiousCelebration01";

/**
 * Central template registry.
 *
 * Adding a template = add its folder/component and one entry here (plus one
 * database row with the same `id` as `component_key`). Nothing in the
 * invitation engine, guest system, sharing or routing needs to change.
 */
export interface TemplateRegistryEntry {
  /** Matches `templates.component_key` in the database. */
  id: string;
  name: string;
  category: string;
  description: string;
  /** Palette used for the gallery preview chrome. */
  accent: string;
  component: ComponentType<TemplateRenderProps>;
  /** Registry-level availability; the database `is_active` flag still wins. */
  active: boolean;
  sample: { title: string; data: InvitationData };
}

const weddingSample: InvitationData = {
  groomName: "Rahul",
  brideName: "Priya",
  eventDate: "2026-12-20",
  eventTime: "7:30 PM",
  venueName: "The Grand Palace",
  venueAddress: "SG Highway",
  city: "Ahmedabad",
  hostNote: "Shah & Mehta families",
  events:
    "Mehndi | 18 Dec 2026 | 4:00 PM | Palace Lawns\nSangeet | 19 Dec 2026 | 7:00 PM | Crystal Hall\nWedding | 20 Dec 2026 | 7:30 PM | The Grand Palace",
  story: "Two families, one beautiful beginning — and a celebration we'd love to share with you.",
  message: "Your presence would make our special day even more meaningful.",
};

export const templateRegistry: TemplateRegistryEntry[] = [
  {
    id: "royal_prestige_01",
    name: "Royal Prestige",
    category: "Wedding",
    description: "Gold, ivory and deep maroon with ornamental doors that open into the invitation.",
    accent: "linear-gradient(135deg, oklch(0.24 0.08 25), oklch(0.82 0.13 85))",
    component: RoyalPrestige,
    active: true,
    sample: { title: "Rahul & Priya Wedding", data: weddingSample },
  },
  {
    id: "rose_gold_blush_02",
    name: "Rose Gold Blush",
    category: "Wedding",
    description: "Romantic rose gold, blush and cream with floating florals and soft reveals.",
    accent: "linear-gradient(135deg, oklch(0.93 0.05 30), oklch(0.68 0.1 30))",
    component: RoseGoldBlush,
    active: true,
    sample: { title: "Rahul & Priya Wedding", data: weddingSample },
  },
  {
    id: "emerald_royale_03",
    name: "Emerald Royale",
    category: "Wedding",
    description: "Deep emerald and gold with Mughal-inspired arches and a dramatic curtain opening.",
    accent: "linear-gradient(135deg, oklch(0.24 0.07 165), oklch(0.84 0.12 90))",
    component: EmeraldRoyale,
    active: true,
    sample: { title: "Rahul & Priya Wedding", data: weddingSample },
  },
];

/** Legacy designs kept so older invitations keep rendering. */
const legacyComponents: Record<string, ComponentType<TemplateRenderProps>> = {
  wedding_traditional_01: WeddingTraditional01,
  wedding_modern_02: WeddingModern02,
  wedding_elegant_03: WeddingElegant03,
  wedding_minimal_04: WeddingMinimal04,
  engagement_elegant_01: EngagementElegant01,
  birthday_celebration_01: BirthdayCelebration01,
  housewarming_new_home_01: HousewarmingNewHome01,
  religious_celebration_01: ReligiousCelebration01,
};

export function getTemplateEntry(key: string): TemplateRegistryEntry | undefined {
  return templateRegistry.find((t) => t.id === key);
}

export function getTemplateComponent(key: string): ComponentType<TemplateRenderProps> {
  return getTemplateEntry(key)?.component ?? legacyComponents[key] ?? RoyalPrestige;
}

/** Sample data used for gallery previews when no invitation exists yet. */
export function sampleDataFor(componentKey: string): { title: string; data: InvitationData } {
  const entry = getTemplateEntry(componentKey);
  if (entry) return entry.sample;
  if (componentKey.startsWith("birthday"))
    return {
      title: "Aarav's 5th Birthday",
      data: { primaryName: "Aarav", milestone: "5", eventDate: "2026-11-14", eventTime: "5:00 PM", venueName: "Sunshine Garden", city: "Surat", hostNote: "Mehta family" },
    };
  if (componentKey.startsWith("housewarming"))
    return {
      title: "Griha Pravesh",
      data: { primaryName: "The Patel Family", eventDate: "2026-10-18", eventTime: "9:00 AM", venueName: "Shanti Villa", venueAddress: "Prahlad Nagar", city: "Ahmedabad" },
    };
  if (componentKey.startsWith("religious"))
    return {
      title: "Satyanarayan Katha",
      data: { primaryName: "Satyanarayan Katha", hostNote: "Joshi family", eventDate: "2026-10-25", eventTime: "4:30 PM", venueName: "Joshi Residence", city: "Vadodara" },
    };
  if (componentKey.startsWith("engagement"))
    return {
      title: "Dev & Anjali Engagement",
      data: { groomName: "Dev", brideName: "Anjali", eventDate: "2026-11-02", eventTime: "6:30 PM", venueName: "Riverside Lawns", city: "Rajkot", hostNote: "Trivedi & Bhatt families" },
    };
  return { title: "Rahul & Priya Wedding", data: weddingSample };
}
