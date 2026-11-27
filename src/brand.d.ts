export type BrandName = 'vexode' | 'vixeeny' | 'vixely' | 'vixion';
/** The names of the logos: one per app. */
export const brands: readonly BrandName[];
/**
 * A logo as an SVG string with unique ids. `size` in pixels (default 32). `label` names it; without one it is
 * decorative. `id` makes the id suffix stable (server rendering).
 */
export function brand(name: BrandName, options?: { size?: number; label?: string; id?: string }): string;
