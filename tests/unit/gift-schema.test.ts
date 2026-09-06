import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createGiftSchema, giftDataBaseSchema, parseGiftData } from "@/lib/gift/schema";
import { parseRichText, richTextLength } from "@/lib/gift/rich-text";

const minimal = { templateSlug: "the-letter", recipientName: "Ana", senderName: "Marco" };

describe("gift schema", () => {
  it("fills defaults for a minimal gift", () => {
    const parsed = giftDataBaseSchema.parse(minimal);
    expect(parsed.version).toBe(1);
    expect(parsed.locale).toBe("en");
    expect(parsed.messageStyle).toBe("typewriter");
    expect(parsed.photos).toEqual([]);
    expect(parsed.watermark).toBe(true);
    expect(parsed.accentColor).toMatch(/^#/);
  });

  it("rejects more than 20 photos and bad colours", () => {
    const photo = { id: "x", url: "/x.webp", width: 10, height: 10 };
    expect(giftDataBaseSchema.safeParse({ ...minimal, photos: Array(21).fill(photo) }).success).toBe(false);
    expect(giftDataBaseSchema.safeParse({ ...minimal, accentColor: "red" }).success).toBe(false);
  });

  it("validates template fields through createGiftSchema", () => {
    const fields = z.object({ mood: z.enum(["a", "b"]).default("a") });
    const schema = createGiftSchema(fields);
    expect(schema.parse({ ...minimal, fields: {} }).fields.mood).toBe("a");
    expect(schema.safeParse({ ...minimal, fields: { mood: "zzz" } }).success).toBe(false);
    expect(parseGiftData(fields, { nope: true })).toBeNull();
  });

  it("requires countdown targets to be absolute instants", () => {
    const ok = giftDataBaseSchema.safeParse({ ...minimal, countdown: { targetAt: "2027-01-01T00:00:00+01:00", timezone: "Europe/Madrid" } });
    const bad = giftDataBaseSchema.safeParse({ ...minimal, countdown: { targetAt: "2027-01-01", timezone: "Europe/Madrid" } });
    expect(ok.success).toBe(true);
    expect(bad.success).toBe(false);
  });
});

describe("rich text", () => {
  it("parses bold, italic, line breaks and paragraphs", () => {
    const blocks = parseRichText("Hi **you**.\nSecond line\n\n*Always*, me");
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toEqual([
      { text: "Hi " },
      { text: "you", bold: true },
      { text: "." },
      { text: "", br: true },
      { text: "Second line" },
    ]);
    expect(blocks[1][0]).toEqual({ text: "Always", italic: true });
    expect(richTextLength(blocks)).toBe("Hi you.".length + 1 + "Second line".length + "Always, me".length);
  });

  it("never emits HTML", () => {
    const blocks = parseRichText("<script>alert(1)</script>");
    expect(blocks[0][0].text).toBe("<script>alert(1)</script>");
  });
});
