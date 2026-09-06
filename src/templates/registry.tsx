import type { ComponentType } from "react";
import type { InvitationData, TemplateRenderProps } from "@/types";
import { WeddingTraditional01 } from "./WeddingTraditional01";
import { WeddingModern02 } from "./WeddingModern02";
import { WeddingElegant03 } from "./WeddingElegant03";
import { WeddingMinimal04 } from "./WeddingMinimal04";
import { EngagementElegant01 } from "./EngagementElegant01";
import { BirthdayCelebration01 } from "./BirthdayCelebration01";
import { HousewarmingNewHome01 } from "./HousewarmingNewHome01";
import { ReligiousCelebration01 } from "./ReligiousCelebration01";

/**
 * Maps a template's `component_key` (stored in the database) to its React
 * component. Adding a template = one component + one database row.
 */
export const templateRegistry: Record<string, ComponentType<TemplateRenderProps>> = {
  wedding_traditional_01: WeddingTraditional01,
  wedding_modern_02: WeddingModern02,
  wedding_elegant_03: WeddingElegant03,
  wedding_minimal_04: WeddingMinimal04,
  engagement_elegant_01: EngagementElegant01,
  birthday_celebration_01: BirthdayCelebration01,
  housewarming_new_home_01: HousewarmingNewHome01,
  religious_celebration_01: ReligiousCelebration01,
};

export function getTemplateComponent(key: string) {
  return templateRegistry[key] ?? WeddingMinimal04;
}

/** Sample data used for gallery previews when no invitation exists yet. */
export function sampleDataFor(componentKey: string): { title: string; data: InvitationData } {
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
  return {
    title: "Rahul & Priya Wedding",
    data: { groomName: "Rahul", brideName: "Priya", eventDate: "2026-12-20", eventTime: "7:30 PM onwards", venueName: "The Grand Palace", venueAddress: "SG Highway", city: "Ahmedabad", hostNote: "Shah & Mehta families" },
  };
}
