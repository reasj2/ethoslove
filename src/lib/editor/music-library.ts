export type TrackMood = "warm" | "dreamy" | "calm" | "hopeful" | "cinematic";

export type LibraryTrack = {
  id: string;
  title: string;
  mood: TrackMood;
  url: string;
  /** Seconds. */
  duration: number;
  /** Displayed under the title, e.g. "Piano · slow" */
  note: string;
};

/**
 * Bundled royalty-free library. The current files are placeholder ambient pads rendered
 * by scripts/gen-demo-audio.mjs — swap in licensed tracks before launch (same shape).
 */
export const LIBRARY_TRACKS: LibraryTrack[] = [
  { id: "still-light", title: "Still Light", mood: "warm", url: "/audio/library/still-light.wav", duration: 48, note: "Soft pad · slow" },
  { id: "paper-boats", title: "Paper Boats", mood: "dreamy", url: "/audio/library/paper-boats.wav", duration: 48, note: "Floating · gentle" },
  { id: "golden-hour", title: "Golden Hour", mood: "hopeful", url: "/audio/library/golden-hour.wav", duration: 48, note: "Bright · unhurried" },
  { id: "night-train", title: "Night Train", mood: "cinematic", url: "/audio/library/night-train.wav", duration: 48, note: "Low · widescreen" },
  { id: "first-snow", title: "First Snow", mood: "calm", url: "/audio/library/first-snow.wav", duration: 48, note: "Sparse · still" },
];

export const TRACK_MOODS: TrackMood[] = ["warm", "dreamy", "calm", "hopeful", "cinematic"];

export function findTrack(id: string | undefined): LibraryTrack | undefined {
  return LIBRARY_TRACKS.find((t) => t.id === id);
}
