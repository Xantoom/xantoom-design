// `xantoom-design migrate <dir> --map old=new,… [--radius old=new,…] [--dry-run]`: renames an app's Tailwind colour and
// radius classes (and their CSS variables) when it moves to the design system's Tailwind bridge. Each name is
// replaced once, whole: `ink=fg,ink-2=fg-muted` never turns `ink-2` into `fg-2`.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { cwd } from 'node:process';

const EXTENSIONS = 'ts,tsx,js,jsx,mjs,astro,html,vue,svelte,css,mdx';
/** Utilities that take a colour. */
const COLOUR = 'bg|text|border(?:-[xyseblrt])?|ring|ring-offset|outline|fill|stroke|from|via|to|divide|placeholder|decoration|accent|caret|shadow|inset-shadow|inset-ring';
/** What may end a class name: a quote, a space, an opacity or a variant/arbitrary bracket. */
const END = String.raw`(?=$|[\s"'\`/)\]}:;,!])`;

const pairs = (value: string | undefined): Map<string, string> =>
	new Map(
		(value ?? '')
			.split(',')
			.filter(Boolean)
			.map((pair) => {
				const [from, to] = pair.split('=');
				if (!from || !to) throw new Error(`migrate: "${pair}" is not old=new`);
				return [from.trim(), to.trim()];
			}),
	);

/** One alternation, longest names first, so `ink-2` wins over `ink`. */
const alternation = (map: Map<string, string>): string =>
	[...map.keys()]
		.sort((a, b) => b.length - a.length)
		.map((key) => key.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&'))
		.join('|');

export function rename(text: string, colours: Map<string, string>, radii: Map<string, string>): { text: string; count: number } {
	let count = 0;
	let out = text;
	if (colours.size > 0) {
		const names = alternation(colours);
		const classes = new RegExp(String.raw`(?<=^|[\s"'\`:!(\[{])(${COLOUR})-(${names})${END}`, 'gm');
		out = out.replace(classes, (_, utility: string, name: string) => {
			count++;
			return `${utility}-${colours.get(name)}`;
		});
		const variables = new RegExp(String.raw`--color-(${names})(?![\w-])`, 'g');
		out = out.replace(variables, (_, name: string) => {
			count++;
			return `--color-${colours.get(name)}`;
		});
	}
	if (radii.size > 0) {
		const names = alternation(radii);
		const classes = new RegExp(String.raw`(?<=^|[\s"'\`:!(\[{])(rounded(?:-(?:[setblr]|ss|se|es|ee|tl|tr|bl|br))?)-(${names})${END}`, 'gm');
		out = out.replace(classes, (_, utility: string, name: string) => {
			count++;
			return `${utility}-${radii.get(name)}`;
		});
		const variables = new RegExp(String.raw`--radius-(${names})(?![\w-])`, 'g');
		out = out.replace(variables, (_, name: string) => {
			count++;
			return `--radius-${radii.get(name)}`;
		});
	}
	return { text: out, count };
}

const option = (args: string[], name: string): string | undefined => {
	const at = args.indexOf(name);
	return at >= 0 ? args[at + 1] : undefined;
};

export async function main(args: string[]): Promise<number> {
	const dir = args.find((arg, i) => !arg.startsWith('--') && !args[i - 1]?.startsWith('--map') && !args[i - 1]?.startsWith('--radius'));
	const colours = pairs(option(args, '--map'));
	const radii = pairs(option(args, '--radius'));
	const dry = args.includes('--dry-run');
	if (!dir || (colours.size === 0 && radii.size === 0)) {
		console.error('Usage: xantoom-design migrate <dir> --map old=new,… [--radius old=new,…] [--dry-run]');
		return 2;
	}
	const root = join(cwd(), dir);
	let files = 0;
	let total = 0;
	for (const file of new Bun.Glob(`**/*.{${EXTENSIONS}}`).scanSync({ cwd: root, onlyFiles: true })) {
		if (file.includes('node_modules/')) continue;
		const path = join(root, file);
		const before = readFileSync(path, 'utf8');
		const { text, count } = rename(before, colours, radii);
		if (count === 0) continue;
		files++;
		total += count;
		console.log(`${relative(cwd(), path)}  ${count}`);
		if (!dry) writeFileSync(path, text);
	}
	console.log(`${files} files, ${total} replacements${dry ? ' (dry run: nothing written)' : ''}`);
	return 0;
}
