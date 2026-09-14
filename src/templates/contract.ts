/**
 * INVITEHUB — TEMPLATE CONTRACT
 * =============================
 *
 * This file is the ONLY stable API between the InviteHub core platform and an
 * invitation template. A template is a pure presentation component: it receives
 * resolved invitation data and renders it. It must never talk to the database,
 * auth, guests, tokens, sharing, analytics or routing.
 *
 *   Invitation data  ->  Template component  ->  Rendered invitation
 *
 * See docs/TEMPLATE_GUIDE.md for the full developer manual.
 */
import type { ComponentType } from "react";
import type { InvitationData } from "@/types";

export type { InvitationData };

/**
 * Props every invitation template receives. Nothing else is passed, and
 * nothing else will be passed in future without a version bump of this file.
 */
export interface InvitationTemplateProps {
  /** Invitation title set by the customer, e.g. "Rahul & Priya Wedding". */
  title: string;
  /** Free-form invitation content entered by the customer. All fields optional. */
  data: InvitationData;
  /** The guest this render is personalized for, e.g. "Amit Shah". Always present. */
  guestName: string;
  /** How many people this guest invitation covers (1 when not specified). */
  peopleCount?: number | undefined;
}

export type InvitationTemplateComponent = ComponentType<InvitationTemplateProps>;

/** Sample content shown in gallery cards and preview dialogs (no real customer data). */
export interface TemplateSample {
  title: string;
  data: InvitationData;
}

/**
 * Metadata the platform needs to discover, preview and render a template.
 * One definition per template folder, exported from `<folder>/template.ts`.
 */
export interface TemplateDefinition {
  /** Stable key. MUST match `templates.component_key` in the database. */
  id: string;
  /** Display name shown in the gallery and admin. */
  name: string;
  /**
   * Category label for the designer's reference (e.g. "Wedding", "Birthday").
   * The authoritative category shown to customers is the one an admin assigns
   * to the matching database row — never branch on category inside a template.
   */
  category: string;
  /** One-line description shown on gallery cards. */
  description: string;
  /** CSS colour/gradient used for chrome and swatches in admin UI. */
  accent: string;
  /** The presentation component. */
  component: InvitationTemplateComponent;
  /**
   * Registry-level availability. The database `is_active` flag and per-customer
   * template access still decide what a customer can actually select.
   */
  active: boolean;
  /**
   * "gallery"  — normal template, listed for admins/customers (default).
   * "internal" — developer/example template: renders if referenced, never listed.
   */
  visibility?: "gallery" | "internal";
  /** Sample content used by every preview surface. */
  sample: TemplateSample;
}

/** Identity helper that gives template authors type-checking + autocomplete. */
export function defineTemplate(definition: TemplateDefinition): TemplateDefinition {
  return definition;
}
