// `xantoom-design contrast`: reads an app's themes by role, resolves var() and light-dark(), and flags weak pairs.
import { describe, expect, test } from 'bun:test';
import { checkContrast } from '../scripts/contrast.ts';

const css = `
:root, [data-theme="day"], [data-theme="night"] {
	color-scheme: light;
	--app-canvas: light-dark(#ffffff, #111111);
	--app-ink: light-dark(#111111, #f0f0f0);
	--app-muted: var(--x-fg-muted);
	--app-accent: oklch(0.5 0.2 30);
}
[data-theme="night"] { color-scheme: dark; --app-accent: #ff8a5c; }
[data-theme="faint"] { --app-canvas: #ffffff; --app-ink: #bbbbbb; }
`;

describe('contrast', () => {
	const results = checkContrast(css);
	const failing = (theme: string): string[] => results.filter((r) => r.theme === theme && !r.ok).map((r) => `${r.fg} on ${r.bg}`);

	test('finds every theme named in a selector', () => {
		expect([...new Set(results.map((r) => r.theme))].sort()).toEqual(['day', 'faint', 'night']);
	});

	test('passes legible themes, light and dark (light-dark() follows color-scheme)', () => {
		expect(failing('day')).toEqual([]);
		expect(failing('night')).toEqual([]);
	});

	test('flags a weak text colour', () => {
		expect(failing('faint')).toContain('--app-ink on --app-canvas');
	});

	test('reads oklch() and the design system tokens behind var()', () => {
		const accent = results.find((r) => r.theme === 'day' && r.fg === '--app-accent' && r.bg === '--app-canvas');
		expect(accent?.ratio).toBeGreaterThan(3);
		expect(results.some((r) => r.theme === 'day' && r.fg === '--app-muted')).toBe(true);
	});
});

describe('contrast, generic blocks and app grounds', () => {
	const css = `
:root, [data-theme="a"], [data-theme="b"] { color-scheme: light; --app-inset: #f0f0f0; }
[data-theme]:not([data-theme^="a"]) { --x-bg: #111111; --x-fg: #eeeeee; color-scheme: dark; }
[data-theme="c"] { --x-bg: #ffffff; --x-fg: #111111; --app-inset: #222222; }
`;
	const results = checkContrast(css, { prefix: 'app', grounds: ['inset'] });
	const pair = (theme: string, fg: string, bg: string) => results.find((r) => r.theme === theme && r.fg === fg && r.bg === bg);

	test('a [data-theme]:not() block applies to every theme it does not exclude', () => {
		expect(pair('b', '--x-fg', '--x-bg')?.ratio).toBeGreaterThan(15);
		expect(pair('a', '--x-fg', '--x-bg')).toBeDefined();
		expect(pair('a', '--x-fg', '--x-bg')?.ratio).not.toBe(pair('b', '--x-fg', '--x-bg')?.ratio);
	});

	test('an app ground is checked like the design system ones', () => {
		expect(pair('c', '--x-fg', '--app-inset')?.ok).toBe(false);
		expect(pair('a', '--x-fg', '--app-inset')?.ok).toBe(true);
	});
});

describe('contrast, accent zones', () => {
	const css = `
[data-x-accent="video"] { --x-scope: light-dark(#2f5bff, #5c86ff); --x-scope-ink: light-dark(#ffffff, #0a0d16); --x-scope-text: light-dark(#2448e6, #8eabff); }
[data-x-accent="gif"] { --x-scope: #2dcb85; --x-scope-ink: #ffffff; }
`;
	const results = checkContrast(css);
	const zone = (name: string): typeof results => results.filter((r) => r.theme.endsWith(`zone ${name}`));

	test('checks each zone in light and dark when the file has no theme', () => {
		expect([...new Set(zone('video').map((r) => r.theme))].sort()).toEqual(['dark, zone video', 'light, zone video']);
	});

	test('passes a legible zone', () => {
		expect(zone('video').filter((r) => !r.ok)).toEqual([]);
	});

	test('flags white ink on a light fill, and a fill too light to colour text', () => {
		const failing = zone('gif').filter((r) => !r.ok).map((r) => `${r.fg} on ${r.bg}`);
		expect(failing).toContain('--x-scope-ink on --x-scope');
		expect(failing.some((f) => f.startsWith('--x-scope on'))).toBe(true);
	});

	test('checks zones inside each theme of an app', () => {
		const app = checkContrast(`:root, [data-theme="day"] { color-scheme: light; --app-ink: #111111; } [data-x-accent="gif"] { --x-scope: #2dcb85; --x-scope-ink: #ffffff; }`);
		expect(app.some((r) => r.theme === 'day, zone gif')).toBe(true);
		expect(app.some((r) => r.theme === 'day' && r.fg === '--app-ink')).toBe(true);
	});
});
