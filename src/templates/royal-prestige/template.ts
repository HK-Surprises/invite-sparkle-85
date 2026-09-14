import { defineTemplate } from "../contract";
import { weddingTemplateSample } from "../samples";
import { RoyalPrestige } from "./index";

export default defineTemplate({
  id: "royal_prestige_01",
  name: "Royal Prestige",
  category: "Wedding",
  description: "Gold, ivory and deep maroon with ornamental doors that open into the invitation.",
  accent: "linear-gradient(135deg, oklch(0.24 0.08 25), oklch(0.82 0.13 85))",
  component: RoyalPrestige,
  active: true,
  sample: weddingTemplateSample,
});
