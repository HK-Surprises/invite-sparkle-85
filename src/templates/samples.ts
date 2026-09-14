import type { InvitationData, TemplateSample } from "./contract";

/**
 * Sample content used by gallery cards and preview dialogs.
 * Never real customer data — templates must render fine without any of it.
 */
export const weddingSample: InvitationData = {
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

export const weddingTemplateSample: TemplateSample = {
  title: "Rahul & Priya Wedding",
  data: weddingSample,
};

export const engagementTemplateSample: TemplateSample = {
  title: "Dev & Anjali Engagement",
  data: {
    groomName: "Dev",
    brideName: "Anjali",
    eventDate: "2026-11-02",
    eventTime: "6:30 PM",
    venueName: "Riverside Lawns",
    city: "Rajkot",
    hostNote: "Trivedi & Bhatt families",
  },
};

export const birthdayTemplateSample: TemplateSample = {
  title: "Aarav's 5th Birthday",
  data: {
    primaryName: "Aarav",
    milestone: "5",
    eventDate: "2026-11-14",
    eventTime: "5:00 PM",
    venueName: "Sunshine Garden",
    city: "Surat",
    hostNote: "Mehta family",
  },
};

export const housewarmingTemplateSample: TemplateSample = {
  title: "Griha Pravesh",
  data: {
    primaryName: "The Patel Family",
    eventDate: "2026-10-18",
    eventTime: "9:00 AM",
    venueName: "Shanti Villa",
    venueAddress: "Prahlad Nagar",
    city: "Ahmedabad",
  },
};

export const religiousTemplateSample: TemplateSample = {
  title: "Satyanarayan Katha",
  data: {
    primaryName: "Satyanarayan Katha",
    hostNote: "Joshi family",
    eventDate: "2026-10-25",
    eventTime: "4:30 PM",
    venueName: "Joshi Residence",
    city: "Vadodara",
  },
};
