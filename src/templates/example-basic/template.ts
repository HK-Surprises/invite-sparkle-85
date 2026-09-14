import { defineTemplate } from "../contract";
import { weddingTemplateSample } from "../samples";
import { ExampleBasic } from "./index";

/**
 * Registered with `visibility: "internal"` so it renders if referenced but is
 * never listed in the customer gallery or admin template list.
 */
export default defineTemplate({
  id: "example_basic_00",
  name: "Example (developer reference)",
  category: "Wedding",
  description: "Minimal reference implementation of the InviteHub template contract.",
  accent: "linear-gradient(135deg, oklch(0.9 0 0), oklch(0.45 0.1 40))",
  component: ExampleBasic,
  active: false,
  visibility: "internal",
  sample: weddingTemplateSample,
});
