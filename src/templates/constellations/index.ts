import type { TemplateModule } from "../types";
import { manifest } from "./manifest";
import { fieldsSchema, type ConstellationFields } from "./schema";
import { demoData } from "./demo-data";
import { Template } from "./Template";

export const template: TemplateModule<ConstellationFields> = { manifest, fieldsSchema, demoData, Template };
