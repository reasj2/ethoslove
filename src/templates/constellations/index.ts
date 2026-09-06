import type { TemplateModule } from "../types";
import { manifest } from "./manifest";
import { fieldsSchema, type ConstellationFields } from "./schema";
import { demoData } from "./demo-data";
import { Template } from "./Template";
import { fieldMeta } from "./field-meta";

export const template: TemplateModule<ConstellationFields> = { manifest, fieldsSchema, demoData, Template, fieldMeta };
