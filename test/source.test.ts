// Rules the sources must keep (cheap guards for whoever edits them next), and the size budgets.
import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { brotliCompressSync } from 'node:zlib';
import { THEMES } from '../scripts/build.ts';

const ROOT = join(import.meta.dir, '..');
const SRC = join(ROOT, 'src');
const sources = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
	.filter((f) => f.endsWith('.css') && f !== 'tokens.css')
	.map((f) => ({ file: f, lines: readFileSync(join(SRC, f), 'utf8').split('\n') }));

/** Lines matching `pattern`, as `file:line`, skipping comments. */
const offenders = (pattern: RegExp, allow: (line: string) => boolean = () => false): string[] =>
	sources.flatMap(({ file, lines }) =>
		lines
			.map((line, i) => ({ line, at: `${file}:${i + 1}` }))
			.filter(({ line }) => !/^\s*(\/\*|\*)/.test(line) && pattern.test(line) && !allow(line))
			.map(({ at }) => at),
	);

describe('sources', () => {
	test('use logical properties (physical ones only where they must not flip)', () => {
		const physical = /^\s*(margin|padding|border)-(left|right|top|bottom)\b|^\s*(left|right|top|bottom):|text-align:\s*(left|right)/;
		// Safe-area insets are physical: the notch does not move in right-to-left.
		expect(offenders(physical, (line) => line.includes('safe-area-inset-left') || line.includes('safe-area-inset-right'))).toEqual([]);
	});

	test('never transition `all`', () => {
		expect(offenders(/transition(-property)?:\s*all\b/)).toEqual([]);
	});

	test('hold no raw colour outside the tokens (keywords and data-URI icons aside)', () => {
		expect(offenders(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i, (line) => line.includes('data:image'))).toEqual([]);
	});

	test('give light-dark() colours only (anything else is invalid: a shadow in it renders none)', () => {
		const tokens = readFileSync(join(SRC, 'tokens.css'), 'utf8');
		expect(tokens.match(/light-dark\(\s*[^#\s][^,]*,/g) ?? []).toEqual([]);
		expect(offenders(/light-dark\(\s*\d/)).toEqual([]);
	});

	test('keep !important for `hidden` alone', () => {
		expect(offenders(/!important/, (line) => line.includes('display: none !important'))).toEqual([]);
	});
});

const brotli = (file: string): number => brotliCompressSync(readFileSync(join(ROOT, file))).length;

describe('budgets (brotli)', () => {
	test('the stylesheet stays under 12 KB', () => expect(brotli('dist/xantoom.css')).toBeLessThan(12 * 1024));
	test('the foundation stays under 4 KB', () => expect(brotli('dist/foundation.css')).toBeLessThan(4 * 1024));
	test('the script stays under 4 KB', () => expect(brotli('dist/xantoom.js')).toBeLessThan(4 * 1024));
	// Apps bundle only the components they import (one ES module, tree-shaken): this is the cost of all of them, so it
	// grows with the catalogue (9 KB since 0.6 added Select, Combobox, ColorField, Settings and DurationField).
	test('the React components stay under 9 KB', () => expect(brotli('dist/react.js')).toBeLessThan(9 * 1024));
	test('the extras stay under 2 KB, script and stylesheet', () => {
		expect(brotli('dist/extras.js')).toBeLessThan(2 * 1024);
		expect(brotli('dist/components/extras.css')).toBeLessThan(2 * 1024);
	});
	test('the theme head script stays under 0.5 KB', () => expect(brotli('dist/theme-head.js')).toBeLessThan(512));
	test('a theme stays under 0.5 KB', () => {
		for (const name of THEMES) expect(brotli(`dist/themes/${name}.css`)).toBeLessThan(512);
	});
});

describe('tailwind bridge', () => {
	test('points only at variables the design system defines', () => {
		const defined = new Set(
			sources
				.flatMap(({ lines }) => lines)
				.concat(readFileSync(join(SRC, 'tokens.css'), 'utf8').split('\n'))
				.flatMap((line) => [...line.matchAll(/(--x-[\w-]+)\s*:/g)].map((m) => m[1])),
		);
		const used = [...readFileSync(join(SRC, 'tailwind.css'), 'utf8').matchAll(/var\((--x-[\w-]+)\)/g)].map((m) => m[1]);
		expect(used.filter((name) => !defined.has(name))).toEqual([]);
	});
});
