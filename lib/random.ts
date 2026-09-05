/** Simple mulberry32 seeded PRNG for deterministic-ish simulation variance. */
export function createRng(seed: number) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randRange(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

export function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(randRange(rng, min, max + 1));
}

export function pickOne<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Seeded from wall-clock time at module load (not a fixed constant) so a page reload
// doesn't replay the exact same "random" sequence from scratch — e.g. two managers
// hired back-to-back across a refresh would otherwise always get identical rolls.
// Safe against hydration mismatches: every caller invokes this from an event handler
// or a client-only lazy useState initializer, never during render/SSR.
let seedCounter = Date.now() % 4294967296;

/** Monotonic seed source for one-off UI randomness (avoids calling Date.now/Math.random directly in render). */
export function nextSeed(): number {
  seedCounter = (seedCounter * 2654435761 + 1) % 4294967296;
  return seedCounter;
}
