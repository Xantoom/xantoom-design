// Xantoom design system: the apps' logos (brand/*.svg) as inline SVG strings, ready for innerHTML, set:html or a
// server template. Each call suffixes the SVG's ids, so two logos on one page never share a gradient.
import { SVGS } from './brand-data.js';

let count = 0;

/** The names of the logos: one per app. */
export const brands = Object.keys(SVGS);

/**
 * A logo as an SVG string. `size` in pixels (default 32). `label` names it (role="img"); without one it is
 * decorative (aria-hidden), for a logo beside the app's name. `id` makes the suffix stable (server rendering).
 */
export function brand(name, { size = 32, label, id } = {}) {
	const source = SVGS[name];
	if (!source) throw new Error(`xantoom: no brand logo "${name}" (${brands.join(', ')})`);
	const suffix = `-${id ?? `x${(count++).toString(36)}`}`;
	const escape = (text) => text.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
	const a11y = label ? `role="img" aria-label="${escape(label)}"` : 'aria-hidden="true"';
	return source
		.replace(/\sid="([^"]+)"/g, (_, ref) => ` id="${ref}${suffix}"`)
		.replace(/url\(#([^)]+)\)/g, (_, ref) => `url(#${ref}${suffix})`)
		.replace(/href="#([^"]+)"/g, (_, ref) => `href="#${ref}${suffix}"`)
		.replace('<svg', `<svg width="${size}" height="${size}" ${a11y} focusable="false"`);
}
