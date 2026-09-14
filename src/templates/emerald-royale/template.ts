import { defineTemplate } from "../contract";
import { weddingTemplateSample } from "../samples";
import { EmeraldRoyale } from "./index";

export default defineTemplate({
  id: "emerald_royale_03",
  name: "Emerald Royale",
  category: "Wedding",
  description: "Deep emerald and gold with Mughal-inspired arches and a dramatic curtain opening.",
  accent: "linear-gradient(135deg, oklch(0.24 0.07 165), oklch(0.84 0.12 90))",
  component: EmeraldRoyale,
  active: true,
  sample: weddingTemplateSample,
});
