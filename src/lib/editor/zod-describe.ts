import type { z } from "zod";

export type FieldWidget = "text" | "textarea" | "select" | "boolean" | "number" | "color" | "list";

export type FieldDescriptor = {
  key: string;
  widget: FieldWidget;
  optional: boolean;
  defaultValue?: unknown;
  options?: string[];
  maxLength?: number;
  min?: number;
  max?: number;
  /** Arrays only: per-item character limit and item count bounds. */
  itemMaxLength?: number;
  minItems?: number;
  maxItems?: number;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyDef = { type?: string; innerType?: any; defaultValue?: unknown; entries?: Record<string, string>; checks?: any[]; element?: any };

function defOf(t: any): AnyDef {
  return (t?.def ?? t?._def ?? {}) as AnyDef;
}

function unwrap(t: any): { inner: any; optional: boolean; defaultValue?: unknown } {
  let cur = t;
  let optional = false;
  let defaultValue: unknown;
  for (let i = 0; i < 8; i++) {
    const def = defOf(cur);
    if (def.type === "optional" || def.type === "nullable") {
      optional = true;
      cur = def.innerType;
      continue;
    }
    if (def.type === "default") {
      const dv = def.defaultValue;
      defaultValue = typeof dv === "function" ? dv() : dv;
      cur = def.innerType;
      continue;
    }
    break;
  }
  return { inner: cur, optional, defaultValue };
}

function readChecks(inner: any): { maxLength?: number; min?: number; max?: number; isColor?: boolean } {
  const out: { maxLength?: number; min?: number; max?: number; isColor?: boolean } = {};
  const checks: any[] = defOf(inner).checks ?? [];
  for (const c of checks) {
    const d = c?._zod?.def ?? c?.def ?? c ?? {};
    if (d.check === "max_length" && typeof d.maximum === "number") out.maxLength = d.maximum;
    if (d.check === "less_than" && typeof d.value === "number") out.max = d.value;
    if (d.check === "greater_than" && typeof d.value === "number") out.min = d.value;
    if (d.check === "string_format" && d.format === "regex" && String(d.pattern).includes("[0-9a-fA-F]")) out.isColor = true;
    if (d.format === "regex" && String(d.pattern).includes("[0-9a-fA-F]")) out.isColor = true;
  }
  return out;
}

function readArray(inner: any): { minItems?: number; maxItems?: number; itemMaxLength?: number } {
  const def = defOf(inner);
  const out: { minItems?: number; maxItems?: number; itemMaxLength?: number } = {};
  for (const c of def.checks ?? []) {
    const d = c?._zod?.def ?? c?.def ?? c ?? {};
    if (d.check === "min_length" && typeof d.minimum === "number") out.minItems = d.minimum;
    if (d.check === "max_length" && typeof d.maximum === "number") out.maxItems = d.maximum;
  }
  if (def.element) out.itemMaxLength = readChecks(unwrap(def.element).inner).maxLength;
  return out;
}

/** Turns a template's Zod `fields` object into widget descriptors for the dynamic form. */
export function describeObjectSchema(schema: z.ZodObject<any>): FieldDescriptor[] {
  const shape: Record<string, any> = (schema as any).shape ?? {};
  return Object.entries(shape).map(([key, raw]) => {
    const { inner, optional, defaultValue } = unwrap(raw);
    const def = defOf(inner);
    const checks = readChecks(inner);
    let widget: FieldWidget = "text";
    let options: string[] | undefined;
    if (def.type === "enum") {
      widget = "select";
      options = Object.values(def.entries ?? inner.options ?? {}) as string[];
    } else if (def.type === "boolean") widget = "boolean";
    else if (def.type === "number") widget = "number";
    else if (def.type === "array") widget = "list";
    else if (def.type === "string") {
      if (checks.isColor || /colou?r$/i.test(key)) widget = "color";
      else if ((checks.maxLength ?? 0) > 120) widget = "textarea";
    }
    const array = widget === "list" ? readArray(inner) : {};
    return { key, widget, optional, defaultValue, options, maxLength: checks.maxLength, min: checks.min, max: checks.max, ...array };
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */
