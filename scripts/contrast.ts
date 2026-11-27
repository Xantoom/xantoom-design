// `xantoom-design contrast <file.css> [--theme <app>] [--prefix <name>]`: checks an app's themes against WCAG 2.2 AA.
//
// Every block whose selector names a theme (`[data-theme="id"]`) is one theme, on top of the `:root` block. Colours
// are read by role whatever the app calls its properties (`--vx-ink` or `--x-fg` is the text colour), then resolved:
// `var()` within the file or to the design system's tokens (`--theme` adds an app theme's), `light-dark()` by the
// block's `color-scheme`, hex, rgb() and oklch(). Text pairs need 4.5:1, interface colours 3:1. Exits 1 on a failure.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { contrast, declaration, flatten, type Color } from './tokens.ts';

/** A role, and the names apps give it (after their prefix). */
const ROLES = {
	bg: ['bg', 'canvas'],
	surface: ['surface'],
	raised: ['raised'],
	fg: ['fg', 'ink'],
	muted: ['fg-muted', 'muted'],
	accent: ['accent'],
	onAccent: ['on-fill', 'on-accent'],
	danger: ['danger'],
	warning: ['warning'],
	success: ['success'],
	info: ['info'],
} as const;
type Role = keyof typeof ROLES;

const GROUNDS: readonly Role[] = ['bg', 'surface', 'raised'];
const PAIRS: readonly (readonly [Role, Role, number])[] = [
	...(['fg', 'muted'] as const).flatMap((fg) => GROUNDS.map((bg) => [fg, bg, 4.5] as const)),
	['onAccent', 'accent', 4.5],
	...(['accent', 'danger', 'warning', 'success', 'info', 'muted'] as const).flatMap((fg) =>
		GROUNDS.map((bg) => [fg, bg, 3] as const),
	),
];

export interface Result {
	readonly theme: string;
	readonly fg: string;
	readonly bg: string;
	readonly ratio: number;
	readonly min: number;
	readonly ok: boolean;
}

type Declarations = Map<string, string>;

/** Splits on commas outside parentheses. */
function args(inner: string): string[] {
	const out: string[] = [];
	let depth = 0;
	let start = 0;
	for (let i = 0; i < inner.length; i++) {
		const c = inner[i];
		if (c === '(') depth++;
		else if (c === ')') depth--;
		else if (c === ',' && depth === 0) {
			out.push(inner.slice(start, i).trim());
			start = i + 1;
		}
	}
	out.push(inner.slice(start).trim());
	return out;
}

/** The design system's colour tokens (and an app theme's), as `--x-name` → `light-dark(…)` or a hex. */
function designTokens(theme?: string): Declarations {
	const root = join(import.meta.dir, '..', 'tokens');
	const files = [join(root, 'xantoom.tokens.json'), ...(theme ? [join(root, 'themes', `${theme}.tokens.json`)] : [])];
	const map: Declarations = new Map();
	for (const file of files)
		for (const token of flatten(JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>))
			if (token.type === 'color') {
				const [name, value] = declaration(token).slice(0, -1).split(/:\s(.+)/);
				if (name && value) map.set(name, value);
			}
	return map;
}

/** sRGB colour from hex, rgb() or oklch(); undefined for anything else (color-mix(), keywords…). */
function parse(value: string): Color | undefined {
	const hex = /^#([0-9a-f]{3,8})$/i.exec(value)?.[1];
	if (hex) {
		const full = hex.length <= 4 ? [...hex].map((c) => c + c).join('') : hex;
		const channel = (i: number): number => Number.parseInt(full.slice(i, i + 2), 16) / 255;
		return { colorSpace: 'srgb', components: [channel(0), channel(2), channel(4)] };
	}
	const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(value);
	if (rgb) return { colorSpace: 'srgb', components: [Number(rgb[1]) / 255, Number(rgb[2]) / 255, Number(rgb[3]) / 255] };
	const oklch = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/i.exec(value);
	if (oklch) {
		const l = Number(oklch[1]) / (oklch[2] ? 100 : 1);
		const [c, h] = [Number(oklch[3]), (Number(oklch[4]) * Math.PI) / 180];
		const [a, b] = [c * Math.cos(h), c * Math.sin(h)];
		const lc = (l + 0.396_337_777_4 * a + 0.215_803_757_3 * b) ** 3;
		const mc = (l - 0.105_561_345_8 * a - 0.063_854_172_8 * b) ** 3;
		const sc = (l - 0.089_484_177_5 * a - 1.291_485_548 * b) ** 3;
		const linear = [
			4.076_741_662_1 * lc - 3.307_711_591_3 * mc + 0.230_969_929_2 * sc,
			-1.268_438_004_6 * lc + 2.609_757_401_1 * mc - 0.341_319_396_5 * sc,
			-0.004_196_086_3 * lc - 0.703_418_614_7 * mc + 1.707_614_701 * sc,
		];
		const gamma = (v: number): number => {
			const x = Math.min(1, Math.max(0, v));
			return x <= 0.003_130_8 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
		};
		return { colorSpace: 'srgb', components: linear.map(gamma) as [number, number, number] };
	}
	return undefined;
}

function resolve(value: string, own: Declarations, ds: Declarations, dark: boolean, depth = 0): string {
	const v = value.trim();
	if (depth > 20) return v;
	const call = /^([a-z-]+)\((.*)\)$/is.exec(v);
	if (call?.[1] === 'light-dark') {
		const [light = '', darkValue = ''] = args(call[2] ?? '');
		return resolve(dark ? darkValue : light, own, ds, dark, depth + 1);
	}
	if (call?.[1] === 'var') {
		const [name = '', fallback] = args(call[2] ?? '');
		const found = own.get(name) ?? ds.get(name) ?? fallback;
		return found === undefined ? v : resolve(found, own, ds, dark, depth + 1);
	}
	return v;
}

/** Checks every theme of a stylesheet. */
export function checkContrast(css: string, { theme, prefix }: { theme?: string; prefix?: string } = {}): Result[] {
	const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
	const blocks = [...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector = '', body = '']) => ({
		selector: selector.trim(),
		declarations: [...body.matchAll(/(--[\w-]+|color-scheme)\s*:\s*([^;]+);?/g)].map(([, k = '', v = '']) => [k, v.trim()] as const),
	}));
	const idsOf = (selector: string): string[] =>
		selector
			.split(',')
			.map((s) => /^\s*\[data-theme=["']?([\w-]+)["']?\]\s*$/.exec(s)?.[1])
			.filter((id): id is string => id !== undefined);
	const isRoot = (selector: string): boolean => selector.split(',').some((s) => s.trim() === ':root');

	const names = blocks.flatMap((b) => b.declarations.map(([k]) => k)).filter((k) => k.startsWith('--'));
	const counts = new Map<string, number>();
	for (const n of names) {
		const p = /^--([a-z]+)-/.exec(n)?.[1];
		if (p) counts.set(p, (counts.get(p) ?? 0) + 1);
	}
	const own = prefix ?? [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'x';
	const ds = designTokens(theme);
	const themes = [...new Set(blocks.flatMap((b) => idsOf(b.selector)))];

	return themes.flatMap((id) => {
		const decls: Declarations = new Map();
		for (const block of blocks)
			if (isRoot(block.selector) || idsOf(block.selector).includes(id))
				for (const [k, v] of block.declarations) decls.set(k, v);
		const dark = /\bdark\b/.test(decls.get('color-scheme') ?? '') && !/\blight\b/.test(decls.get('color-scheme') ?? '');
		const colour = (role: Role): { name: string; color: Color } | undefined => {
			// The app's own names first, then design-system names it sets, then the design system's values.
			const candidates = [
				...ROLES[role].map((alias) => [`--${own}-${alias}`, decls] as const),
				...ROLES[role].map((alias) => [`--x-${alias}`, decls] as const),
				...ROLES[role].map((alias) => [`--x-${alias}`, ds] as const),
			];
			for (const [name, from] of candidates) {
				const raw = from.get(name);
				const color = raw === undefined ? undefined : parse(resolve(raw, decls, ds, dark));
				if (color) return { name, color };
			}
			return undefined;
		};
		return PAIRS.flatMap(([fgRole, bgRole, min]) => {
			const [fg, bg] = [colour(fgRole), colour(bgRole)];
			if (!fg || !bg) return [];
			const ratio = contrast(fg.color, bg.color);
			return [{ theme: id, fg: fg.name, bg: bg.name, ratio, min, ok: ratio >= min }];
		});
	});
}

export async function main(argv: readonly string[]): Promise<number> {
	const file = argv.find((a, i) => !a.startsWith('--') && !['--theme', '--prefix'].includes(argv[i - 1] ?? ''));
	if (!file) {
		console.error('usage: xantoom-design contrast <file.css> [--theme <app>] [--prefix <name>]');
		return 2;
	}
	const option = (name: string): string | undefined => {
		const i = argv.indexOf(name);
		return i < 0 ? undefined : argv[i + 1];
	};
	const results = checkContrast(await Bun.file(file).text(), { theme: option('--theme'), prefix: option('--prefix') });
	const failures = results.filter((r) => !r.ok);
	for (const r of failures)
		console.log(`✗ ${r.theme}: ${r.fg} on ${r.bg} is ${r.ratio.toFixed(2)}:1, needs ${r.min}:1`);
	const themes = new Set(results.map((r) => r.theme)).size;
	console.log(`${results.length - failures.length}/${results.length} pairs pass across ${themes} themes.`);
	return failures.length > 0 || results.length === 0 ? 1 : 0;
}
