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
