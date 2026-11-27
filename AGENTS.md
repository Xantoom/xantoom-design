# Xantoom design system: agent guide

This repository is the design system itself. Its rules for apps are in
[skills/xantoom-design/SKILL.md](skills/xantoom-design/SKILL.md); read them first, since the design system follows
them too.

## Layout

- `tokens/`: DTCG 2025.10 tokens, the source of truth. `xantoom.tokens.json` is the signature; `themes/` holds one
  file per app.
- `src/`: CSS by layer (`reset`, `base`, `layout`, `components/*`, `motion`, `utilities`), plus `xantoom.js`.
  `src/tokens.css` is generated.
- `dist/`: built output (committed: projects install this repository as a git dependency, with no build step).
- `scripts/build.ts`: tokens to CSS, then the lightningcss bundle and the minified script. `scripts/cli.ts` is the
  `xantoom-design` command (`skill`, `contrast`, `migrate`).
- `skills/xantoom-design/`: the cross-agent skill (Agent Skills format), installed on each machine by
  `xantoom-design skill`, never into projects. It ships apart from the CSS: either installs without the other.
- `demo/`: every component on one page (`bun run demo`).

## Rules

- Bun only, exact versions. `bun run check` must pass before every commit (build, oxlint, tests, `dist/` up to date).
- Change a token in `tokens/`, never in `src/tokens.css` or `dist/`.
- Every component change updates `references/components.md` and the demo. Every new rule for apps goes in the skill.
- Keep to the tests' guards: logical properties, no `transition: all`, no raw colours in `src/`, `!important` only for
  `hidden`, size budgets (CSS < 12 KB brotli, JS < 4.5 KB, React < 10 KB, extras < 2 KB each, theme and head script < 0.5 KB).
- Before using a newer CSS or HTML feature, check its coverage against
  [references/browsers.md](skills/xantoom-design/references/browsers.md) and give it a fallback that leaves the page
  usable.
- No text in components: every label comes from the app.
- Release: bump `version` in `package.json` and the skill's metadata, update `CHANGELOG.md`, tag `vX.Y.Z`.
