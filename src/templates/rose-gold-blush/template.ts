import { defineTemplate } from "../contract";
import { weddingTemplateSample } from "../samples";
import { RoseGoldBlush } from "./index";

export default defineTemplate({
  id: "rose_gold_blush_02",
  name: "Rose Gold Blush",
  category: "Wedding",
  description: "Romantic rose gold, blush and cream with floating florals and soft reveals.",
  accent: "linear-gradient(135deg, oklch(0.93 0.05 30), oklch(0.68 0.1 30))",
  component: RoseGoldBlush,
  active: true,
  sample: weddingTemplateSample,
});
