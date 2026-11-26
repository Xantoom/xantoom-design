// WCAG 2.2 AA contrast for the signature and every theme, in both modes.
import { describe, expect, test } from 'bun:test';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { type Color, contrast, flatten, type Token } from '../scripts/tokens.ts';

const ROOT = join(import.meta.dir, '..');
const load = async (file: string): Promise<Map<string, Token>> =>
	new Map(flatten(await Bun.file(join(ROOT, file)).json()).map((t) => [t.name, t]));

const base = await load('tokens/xantoom.tokens.json');
const MODES = ['light', 'dark'] as const;
type Mode = (typeof MODES)[number];

const color = (tokens: Map<string, Token>, name: string, mode: Mode): Color => {
	const token = tokens.get(name);
	if (token === undefined) throw new Error(`missing ${name}`);
	return (mode === 'dark' && token.dark !== undefined ? token.dark : token.value) as Color;
};

const SURFACES = ['--x-bg', '--x-surface', '--x-raised'];
const TEXT = 4.5;
const NON_TEXT = 3;

describe('signature', () => {
	for (const mode of MODES) {
		for (const name of ['--x-fg', '--x-fg-muted', '--x-fg-faint', '--x-success', '--x-warning', '--x-danger', '--x-info'])
			test(`${name} is text-legible on every surface (${mode})`, () => {
				for (const surface of SURFACES)
					expect(contrast(color(base, name, mode), color(base, surface, mode))).toBeGreaterThanOrEqual(TEXT);
			});
		test(`control borders reach 3:1 on every surface (${mode})`, () => {
			for (const surface of SURFACES)
				expect(contrast(color(base, '--x-control-border', mode), color(base, surface, mode))).toBeGreaterThanOrEqual(NON_TEXT);
		});
		test(`text on a danger fill is legible (${mode})`, () => {
			expect(contrast(color(base, '--x-on-danger', mode), color(base, '--x-danger', mode))).toBeGreaterThanOrEqual(TEXT);
		});
	}
});

const themes = readdirSync(join(ROOT, 'tokens/themes')).filter((f) => f.endsWith('.tokens.json'));

for (const file of themes) {
	const theme = await load(`tokens/themes/${file}`);
	describe(file, () => {
		for (const mode of MODES) {
			test(`on-fill reads on every fill stop (${mode})`, () => {
				for (const stop of ['--x-fill-1', '--x-fill-2', '--x-fill-3'])
					expect(contrast(color(theme, '--x-on-fill', mode), color(theme, stop, mode))).toBeGreaterThanOrEqual(TEXT);
			});
			test(`the accent is text-legible on every surface (${mode})`, () => {
				for (const surface of SURFACES)
					expect(contrast(color(theme, '--x-accent', mode), color(base, surface, mode))).toBeGreaterThanOrEqual(TEXT);
			});
		}
		test('sets every theme token', () => {
			for (const name of ['--x-brand-1', '--x-brand-2', '--x-brand-3', '--x-on-fill', '--x-accent', '--x-shape-radius', '--x-shape-density'])
				expect(theme.has(name)).toBe(true);
		});
	});
}
