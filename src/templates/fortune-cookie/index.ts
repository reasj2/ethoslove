import type { TemplateModule } from "../types";
import { manifest } from "./manifest";
import { fieldsSchema, type FortuneFields } from "./schema";
import { demoData } from "./demo-data";
import { Template } from "./Template";
import { fieldMeta } from "./field-meta";

export const template: TemplateModule<FortuneFields> = { manifest, fieldsSchema, demoData, Template, fieldMeta };
