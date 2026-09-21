/**
 * Generates a unique ID with the given prefix, combining timestamp and random suffix
 * to prevent collisions under rapid/concurrent operations.
 */
export function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
