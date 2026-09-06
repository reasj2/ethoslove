/**
 * Renders a short ambient pad as a WAV so the demo gifts have music without shipping
 * licensed tracks. Replace with the real royalty-free library in Phase 3.
 *   node scripts/gen-demo-audio.mjs
 */
import { writeFileSync } from "node:fs";

const SR = 22050;
const SECONDS = 48;
const N = SR * SECONDS;
const out = new Float32Array(N);

// A slow I–vi–IV–V progression in D major, each chord 6s, looped, with soft attack/release.
const chords = [
  [146.83, 220.0, 293.66, 369.99], // D  (D A D F#)
  [123.47, 185.0, 246.94, 293.66], // Bm (B F# B D)
  [98.0, 146.83, 196.0, 246.94],   // G  (G D G B)
  [110.0, 164.81, 220.0, 277.18],  // A  (A E A C#)
];
const CHORD_S = 6;

function env(t, len) {
  const a = Math.min(1, t / 1.6);
  const r = Math.min(1, (len - t) / 2.2);
  return Math.max(0, Math.min(a, r));
}

for (let i = 0; i < N; i++) {
  const t = i / SR;
  const ci = Math.floor(t / CHORD_S) % chords.length;
  const ct = t % CHORD_S;
  const chord = chords[ci];
  let s = 0;
  for (let k = 0; k < chord.length; k++) {
    const f = chord[k];
    const vib = 1 + 0.0025 * Math.sin(2 * Math.PI * 0.18 * t + k);
    // soft, slightly detuned pair per voice for width
    s += Math.sin(2 * Math.PI * f * vib * t) * 0.5;
    s += Math.sin(2 * Math.PI * f * 1.003 * t + 0.7) * 0.35;
    s += Math.sin(2 * Math.PI * f * 2 * t) * 0.08; // gentle octave shimmer
  }
  const shimmer = 0.6 + 0.4 * Math.sin(2 * Math.PI * 0.07 * t);
  out[i] = s * env(ct, CHORD_S) * 0.055 * shimmer;
}

// simple feedback delay for space
const delay = Math.floor(SR * 0.42);
for (let i = delay; i < N; i++) out[i] += out[i - delay] * 0.32;

// fade whole track in/out
for (let i = 0; i < SR * 2; i++) out[i] *= i / (SR * 2);
for (let i = 0; i < SR * 3; i++) out[N - 1 - i] *= i / (SR * 3);

const pcm = new Int16Array(N);
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(out[i]));
for (let i = 0; i < N; i++) pcm[i] = Math.max(-32768, Math.min(32767, Math.round((out[i] / peak) * 0.8 * 32767)));

const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + pcm.length * 2, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(1, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 2, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(pcm.length * 2, 40);
writeFileSync("public/audio/library/still-light.wav", Buffer.concat([header, Buffer.from(pcm.buffer)]));
console.log("wrote public/audio/library/still-light.wav", ((44 + pcm.length * 2) / 1024).toFixed(0), "KB");
