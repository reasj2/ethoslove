"use client";

import { del, get, keys, set } from "idb-keyval";

const PREFIX = "asset:";

export async function putBlob(id: string, blob: Blob): Promise<void> {
  await set(PREFIX + id, blob);
}

export async function getBlob(id: string): Promise<Blob | undefined> {
  try {
    return await get<Blob>(PREFIX + id);
  } catch {
    return undefined;
  }
}

export async function deleteBlob(id: string): Promise<void> {
  try {
    await del(PREFIX + id);
  } catch {
    /* ignore */
  }
}

/** Remove blobs that no draft references anymore (call after loading drafts). */
export async function pruneBlobs(keep: Set<string>): Promise<void> {
  try {
    const all = await keys();
    await Promise.all(
      all
        .filter((k): k is string => typeof k === "string" && k.startsWith(PREFIX) && !keep.has(k.slice(PREFIX.length)))
        .map((k) => del(k)),
    );
  } catch {
    /* ignore */
  }
}
