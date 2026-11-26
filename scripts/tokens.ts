// Reads DTCG 2025.10 token files and turns them into CSS custom properties. Shared by the build and the tests.

/** The extension holding a colour's (or shadow's) dark-mode value. */
export const DARK = 'app.xantoom.dark';
/** The extension marking a group whose dimensions are multiplied by a theme knob (`density`, `radius`). */
export const SCALE = 'app.xantoom.scale';

export interface Color {
	readonly colorSpace: 'srgb';
	readonly components: readonly [number, number, number];
	readonly alpha?: number;
	readonly hex?: string;
}
interface Dimension {
	readonly value: number;
	readonly unit: string;
}
interface ShadowLayer {
	readonly color: Color;
	readonly offsetX: Dimension;
	readonly offsetY: Dimension;
	readonly blur: Dimension;
	readonly spread: Dimension;
}

export interface Token {
	/** The CSS custom property, e.g. `--x-fg-muted`. */
	readonly name: string;
	readonly path: readonly string[];
	readonly type: string;
	readonly value: unknown;
	readonly dark?: unknown;
	readonly scale?: string;
}

type Group = { readonly [key: string]: unknown };

const isObject = (value: unknown): value is Group => typeof value === 'object' && value !== null && !Array.isArray(value);

/** The `color` group is the default namespace: `color.fg` is `--x-fg`, `space.4` is `--x-space-4`. */
const nameOf = (path: readonly string[]): string => `--x-${(path[0] === 'color' ? path.slice(1) : path).join('-')}`;

/** Every token of a DTCG document, with inherited `$type` and scale. */
export function flatten(doc: Group): Token[] {
	const out: Token[] = [];
	const walk = (node: Group, path: string[], type?: string, scale?: string): void => {
		const ext = isObject(node['$extensions']) ? node['$extensions'] : {};
		const ownType = typeof node['$type'] === 'string' ? node['$type'] : type;
		const ownScale = typeof ext[SCALE] === 'string' ? ext[SCALE] : scale;
		if ('$value' in node) {
			if (ownType === undefined) throw new Error(`${path.join('.')}: no $type`);
			out.push({
				name: nameOf(path),
				path,
				type: ownType,
				value: node['$value'],
				...(DARK in ext ? { dark: ext[DARK] } : {}),
				...(ownScale === undefined ? {} : { scale: ownScale }),
			});
			return;
		}
		for (const [key, child] of Object.entries(node))
			if (!key.startsWith('$') && isObject(child)) walk(child, [...path, key], ownType, ownScale);
	};
	walk(doc, []);
	return out;
}

const round = (n: number): number => Math.round(n * 1000) / 1000;

export function hexOf(color: Color): string {
	const [r, g, b] = color.components.map((c) =>
		Math.round(c * 255)
			.toString(16)
			.padStart(2, '0'),
	);
	const a = color.alpha === undefined || color.alpha >= 1 ? '' : Math.round(color.alpha * 255).toString(16).padStart(2, '0');
	return `#${r}${g}${b}${a}`;
}

const dimension = (d: Dimension): string => (d.value === 0 ? '0' : `${round(d.value)}${d.unit}`);

const shadow = (layers: readonly ShadowLayer[]): string =>
	layers
		.map((l) => [l.offsetX, l.offsetY, l.blur, l.spread].map(dimension).join(' ') + ` ${hexOf(l.color)}`)
		.join(', ');

/** A token's value as CSS (one mode). */
export function css(type: string, value: unknown): string {
	switch (type) {
		case 'color':
			return hexOf(value as Color);
		case 'dimension':
		case 'duration':
			return dimension(value as Dimension);
		case 'number':
		case 'fontWeight':
			return String(value);
		case 'cubicBezier':
			return `cubic-bezier(${(value as number[]).join(', ')})`;
		case 'fontFamily':
			return (value as string[])
				.map((f) => (/^[a-z-]+$/.test(f) && !f.includes(' ') ? f : `"${f}"`))
				.join(', ');
		case 'shadow':
			return shadow(value as ShadowLayer[]);
		default:
			throw new Error(`unsupported $type ${type}`);
	}
}

/**
 * A shadow with a dark value: light-dark() takes colours only (a whole shadow in it is invalid, and the property
 * falls back to none), so both modes share one geometry and each layer switches its colour.
 */
function themedShadow(name: string, light: readonly ShadowLayer[], dark: readonly ShadowLayer[]): string {
	const geometry = (l: ShadowLayer): string => [l.offsetX, l.offsetY, l.blur, l.spread].map(dimension).join(' ');
	if (light.length !== dark.length || light.some((l, i) => geometry(l) !== geometry(dark[i] as ShadowLayer)))
		throw new Error(`${name}: the light and dark shadows must have the same layers and geometry`);
	return light
		.map((l, i) => `${geometry(l)} light-dark(${hexOf(l.color)}, ${hexOf((dark[i] as ShadowLayer).color)})`)
		.join(', ');
}

/** The declaration of a token: light-dark() when it has a dark value, times its knob when it scales. */
export function declaration(token: Token): string {
	let value = css(token.type, token.value);
	if (token.dark !== undefined)
		value =
			token.type === 'shadow'
				? themedShadow(token.name, token.value as ShadowLayer[], token.dark as ShadowLayer[])
				: `light-dark(${value}, ${css(token.type, token.dark)})`;
	if (token.scale !== undefined) value = `calc(${value} * var(--x-${token.scale}))`;
	return `${token.name}: ${value};`;
}

/** Shape knobs are named by their key alone: `shape.radius` is `--x-radius`, the multiplier of the radii. */
export const knob = (token: Token): Token =>
	token.path[0] === 'shape' ? { ...token, name: `--x-${token.path.slice(1).join('-')}` } : token;

// WCAG 2 relative luminance and contrast.
const channel = (c: number): number => (c <= 0.040_45 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = (color: Color): number => {
	const [r, g, b] = color.components.map(channel) as [number, number, number];
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export function contrast(a: Color, b: Color): number {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
	return (hi + 0.05) / (lo + 0.05);
}
