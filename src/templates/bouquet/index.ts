import type { TemplateModule } from "../types";
import { manifest } from "./manifest";
import { fieldsSchema, type BouquetFields } from "./schema";
import { demoData } from "./demo-data";
import { Template } from "./Template";
import { fieldMeta } from "./field-meta";
import { ShuffleButton, StemPicker } from "./StemPicker";

export const template: TemplateModule<BouquetFields> = {
  manifest,
  fieldsSchema,
  demoData,
  Template,
  fieldMeta,
  fieldEditors: { stems: StemPicker, seed: ShuffleButton },
};
