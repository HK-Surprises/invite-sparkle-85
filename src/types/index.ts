import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];

export type Profile = Tables["profiles"]["Row"];
export type Customer = Tables["customers"]["Row"];
export type Category = Tables["categories"]["Row"];
export type Template = Tables["templates"]["Row"];
export type Invitation = Tables["invitations"]["Row"];
export type Guest = Tables["guests"]["Row"];
export type CustomerUsage = Database["public"]["Views"]["customer_usage"]["Row"];
export type AppRole = Database["public"]["Enums"]["app_role"];

export interface TemplateField {
  key: string;
  label: string;
  required?: boolean;
  type?: "text" | "date" | "textarea";
}

/** Data a template receives. Never hard-code names inside templates. */
export interface InvitationData {
  groomName?: string;
  brideName?: string;
  primaryName?: string;
  milestone?: string;
  eventDate?: string;
  eventTime?: string;
  venueName?: string;
  venueAddress?: string;
  city?: string;
  hostNote?: string;
  message?: string;
  /** Google Maps link for the venue. */
  venueMapUrl?: string;
  /** One event per line: "Name | Date | Time | Venue". */
  events?: string;
  /** Short couple / celebration story. */
  story?: string;
  /** Image links, one per line. */
  galleryUrls?: string;
  /** Closing blessing line. */
  blessing?: string;
  [key: string]: string | undefined;

}

export interface TemplateRenderProps {
  title: string;
  data: InvitationData;
  guestName: string;
  peopleCount?: number | undefined;
}

export type ResolvedInvitation =
  | { state: "not_found" | "inactive" | "not_started" | "expired" }
  | {
      state: "ok";
      guest: { name: string; group_name: string | null; people_count: number };
      invitation: { title: string; data: InvitationData };
      template: { component_key: string; name: string };
    };
