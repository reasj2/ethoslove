import "server-only";

import { env, isConfigured } from "@/lib/env";

type Options = { limit: number; windowSeconds: number };

const memory = new Map<string, { count: number; resetAt: number }>();

/**
 * Sliding-window-ish rate limiter. Uses Upstash Redis (INCR + EXPIRE) when configured,
 * otherwise a per-process map — good enough for dev and single-instance deploys.
 * Returns true when the request is allowed.
 */
export async function rateLimit(key: string, { limit, windowSeconds }: Options): Promise<boolean> {
  if (isConfigured.upstash) {
    try {
      const res = await fetch(`${env.upstashRedisUrl}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${env.upstashRedisToken}`, "content-type": "application/json" },
        body: JSON.stringify([
          ["INCR", `rl:${key}`],
          ["EXPIRE", `rl:${key}`, windowSeconds, "NX"],
        ]),
        cache: "no-store",
      });
      const json = (await res.json()) as { result: number }[];
      return (json[0]?.result ?? 0) <= limit;
    } catch {
      return true; // never lock users out because the limiter is down
    }
  }
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.resetAt < now) {
    memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}
