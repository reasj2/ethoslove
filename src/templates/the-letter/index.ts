import type { TemplateModule } from "../types";
import { manifest } from "./manifest";
import { fieldsSchema, type LetterFields } from "./schema";
import { demoData } from "./demo-data";
import { Template } from "./Template";

export const template: TemplateModule<LetterFields> = { manifest, fieldsSchema, demoData, Template };
