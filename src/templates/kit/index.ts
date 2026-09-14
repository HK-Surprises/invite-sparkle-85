/**
 * INVITEHUB TEMPLATE KIT
 * ======================
 * Optional, reusable building blocks for template authors. Everything here is
 * presentation-only and data-driven — nothing touches the core platform.
 *
 * Use as much or as little as you like: a template may ignore the kit entirely
 * and render its own markup, as long as it honours the contract in
 * `src/templates/contract.ts`.
 */

/** Layout/typography primitives: TemplateFrame, Ornament, Greeting, Names, Details, Message, HostNote. */
export * from "../shared";

/**
 * Premium/cinematic helpers: Reveal, CoverGate, Countdown, EventsList, Gallery,
 * VenueBlock, DateLine, Floaters, ScrollCue, parseEvents, parseGallery,
 * useCountdown, guestGreetingLine.
 */
export * from "../premium/kit";
