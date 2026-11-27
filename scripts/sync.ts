#!/usr/bin/env bun
// `xantoom-design sync [--check]` (and `xantoom-design contrast` and `migrate`, see scripts/contrast.ts and migrate.ts), run from a project root (or its postinstall): makes every coding agent aware of
// the design system. It copies the skill to .agents/skills/xantoom-design/ (the cross-agent location), links it from
// .claude/skills/ (Claude Code), and adds a pointer to AGENTS.md and, when it exists, CLAUDE.md. With --check, it
// changes nothing and exits 1 if anything is out of date (for CI).
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readlinkSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { argv, cwd, exit } from 'node:process';

// `xantoom-design contrast …`: the theme contrast check (scripts/contrast.ts).
if (argv[2] === 'contrast') {
	const { main } = await import('./contrast.ts');
	exit(await main(argv.slice(3)));
}

// `xantoom-design migrate …`: renames an app's colour and radius classes (scripts/migrate.ts).
if (argv[2] === 'migrate') {
	const { main } = await import('./migrate.ts');
	exit(await main(argv.slice(3)));
}

const NAME = 'xantoom-design';
const SOURCE = join(import.meta.dir, '..', 'skills', NAME);
const project = cwd();
const check = argv.includes('--check');

const START = `<!-- ${NAME}:start -->`;
const END = `<!-- ${NAME}:end -->`;
// The blank line after START matches what Markdown formatters (oxfmt, Prettier) write, so a formatted file stays in sync.
const POINTER = `${START}

## Design system

This project uses the Xantoom design system. Before any UI work (pages, components, styles, motion, icons,
layout), read \`.agents/skills/${NAME}/SKILL.md\` and follow it.
${END}`;

const stale: string[] = [];

/** Every file of a directory, relative, with its content. */
function snapshot(dir: string): Map<string, string> {
	const out = new Map<string, string>();
	if (!existsSync(dir)) return out;
	for (const file of new Bun.Glob('**/*').scanSync({ cwd: dir, onlyFiles: true }))
		out.set(file, readFileSync(join(dir, file), 'utf8'));
	return out;
}

const same = (a: Map<string, string>, b: Map<string, string>): boolean =>
	a.size === b.size && [...a].every(([file, text]) => b.get(file) === text);

// 1. The skill itself.
const target = join(project, '.agents', 'skills', NAME);
if (!same(snapshot(SOURCE), snapshot(target))) {
	stale.push(relative(project, target));
	if (!check) {
		rmSync(target, { recursive: true, force: true });
		mkdirSync(target, { recursive: true });
		cpSync(SOURCE, target, { recursive: true });
	}
}

// 2. Claude Code reads .claude/skills/: a relative link, so the checkout can move.
const link = join(project, '.claude', 'skills', NAME);
const wanted = relative(join(project, '.claude', 'skills'), target);
const linked = existsSync(link) && lstatSync(link).isSymbolicLink() && readlinkSync(link) === wanted;
if (!linked) {
	stale.push(relative(project, link));
	if (!check) {
		rmSync(link, { recursive: true, force: true });
		mkdirSync(join(project, '.claude', 'skills'), { recursive: true });
		try {
			symlinkSync(wanted, link, 'dir');
		} catch {
			// No symlinks (some Windows setups): a copy works too.
			cpSync(target, link, { recursive: true });
		}
	}
}

// 3. Pointers: AGENTS.md always (read by most agents), and CLAUDE.md or .claude/CLAUDE.md when the project has one
//    (Claude Code then ignores AGENTS.md) that does not already import AGENTS.md.
function point(file: string, create: boolean): void {
	const path = join(project, file);
	const exists = existsSync(path);
	if (!exists && !create) return;
	const text = exists ? readFileSync(path, 'utf8') : '';
	if (file.endsWith('CLAUDE.md') && /^@(\.\.\/)?AGENTS\.md\s*$/m.test(text)) return;
	const block = new RegExp(`${START}[\\s\\S]*?${END}`);
	const current = block.exec(text)?.[0];
	// A formatter may re-wrap the paragraph: only the words count.
	const words = (value: string): string => value.replace(/\s+/g, ' ').trim();
	if (current !== undefined && words(current) === words(POINTER)) return;
	const next = current !== undefined ? text.replace(block, POINTER) : `${text.trimEnd()}${text.trim() ? '\n\n' : ''}${POINTER}\n`;
	if (next === text) return;
	stale.push(file);
	if (!check) writeFileSync(path, next);
}
point('AGENTS.md', true);
point('CLAUDE.md', false);
point('.claude/CLAUDE.md', false);

if (check && stale.length > 0) {
	console.error(`${NAME}: out of date: ${stale.join(', ')}. Run \`bunx ${NAME} sync\`.`);
	exit(1);
}
if (!check) console.log(stale.length === 0 ? `${NAME}: up to date` : `${NAME}: updated ${stale.join(', ')}`);
