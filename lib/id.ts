let counter = 0;

/** Generates a stable, collision-safe unique id for game entities. */
export function generateId(prefix: string): string {
  counter += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${rand}`;
}
