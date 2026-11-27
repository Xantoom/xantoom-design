#!/usr/bin/env bun
// The `xantoom-design` command. The design system ships two things installed apart: the CSS (with its script, React
// components and tokens), added to a project with `bun add`, and the agent skill, installed once on the machine. A
// project never holds a copy of the skill, and installing the CSS never touches it.
//
//   xantoom-design skill [--force]   installs the skill on this machine (~/.claude/skills and ~/.agents/skills)
//   xantoom-design contrast …        checks a theme's contrast (scripts/contrast.ts)
//   xantoom-design migrate …         renames an app's colour and radius classes (scripts/migrate.ts)
import { cpSync, lstatSync, mkdirSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { argv, exit } from 'node:process';

const NAME = 'xantoom-design';
const [command, ...args] = argv.slice(2);

if (command === 'contrast') {
	const { main } = await import('./contrast.ts');
	exit(await main(args));
}

if (command === 'migrate') {
	const { main } = await import('./migrate.ts');
	exit(await main(args));
}

if (command === 'skill') {
	const source = join(import.meta.dir, '..', 'skills', NAME);
	// Claude Code reads ~/.claude/skills; other agents (Agent Skills format) ~/.agents/skills.
	for (const root of [join(homedir(), '.claude', 'skills'), join(homedir(), '.agents', 'skills')]) {
		const target = join(root, NAME);
		let link = false;
		try {
			link = lstatSync(target).isSymbolicLink();
		} catch {
			// Not installed yet.
		}
		// A link points at a checkout of this repository (the design system's own machine): it is always current.
		if (link && !args.includes('--force')) {
			console.log(`${target}: a link to a checkout, left as it is`);
			continue;
		}
		rmSync(target, { recursive: true, force: true });
		mkdirSync(root, { recursive: true });
		cpSync(source, target, { recursive: true });
		console.log(`${target}: installed`);
	}
	exit(0);
}

console.error(`Usage: ${NAME} skill [--force] | contrast … | migrate …`);
exit(command ? 1 : 0);
