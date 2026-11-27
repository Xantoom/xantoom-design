# Xantoom design system

One signature, one theme per app. The design language of every Xantoom web project
(Vixion, [Vixely](https://vixely.app), Vexode, Vixeeny,
[xantoom.dev](https://xantoom.dev)): tokens, pure-CSS components, motion and an agent skill.

- **Pure CSS**, about 9 KB brotli for every component (or the foundation plus only the families a page uses), in cascade layers that an app's own CSS always overrides.
- **Native HTML underneath**: `<dialog>`, `popover`, `<details>`, `<select>`, invoker commands. The browser handles
  focus, top layer, Esc and form semantics.
- **Accessible**: WCAG 2.2 AA. Every colour pair is contrast-tested in both modes, focus is always visible, targets
  are 24 px (44 px on touch), and it works in forced colours and with reduced motion.
- **Every screen and language**: logical properties throughout, RTL and CJK typography, container-driven layouts
  from 320 px to 8K, ultra-wide and square.
- **Motion everywhere**, compositor-only, opt-in under `prefers-reduced-motion`, with entry and exit transitions on
  every overlay.
- **Optional script** (about 4.5 KB): exit animations outside Chromium, tooltips in every browser, tab, menu and command
  palette keyboards, shortcuts written for the platform, toasts, and fallbacks for invoker commands and `closedby`.
  `theme.js` (0.4 KB) applies the system, light or dark choice before the first paint and drives the theme button.
- **Extras** for few pages: `components/extras.css` (command palette, scrubber, error pages, key figures) and
  `extras.js` (contents that follow the reading, number fields without React).
- **React and Tailwind**: `xantoom-design/react` (about 8 KB brotli for all of it; apps bundle what they import) and
  `xantoom-design/tailwind.css`.
- **The family's logos** in [`brand/`](brand), one source for every site that shows them.
- **Theme contrast check** for apps with their own themes: `bunx xantoom-design contrast src/themes.css --theme <app> [--prefix <app> --ground <name>]`.
- **Agent skill**: [`skills/xantoom-design`](skills/xantoom-design/SKILL.md), in the open Agent Skills format, so any
  coding agent knows the rules. Installed on the machine, apart from the CSS.

## Use it

The CSS and the skill are installed apart; either works without the other.

```sh
bun add github:Xantoom/xantoom-design#v0.5.1     # the CSS, script, React components and tokens, in a project
bunx github:Xantoom/xantoom-design skill          # the agent skill, once per machine (~/.claude/skills, ~/.agents/skills)
```

Run the second again to update the skill. On a machine that holds a checkout of this repository, link the skill
instead (`ln -s <checkout>/skills/xantoom-design ~/.claude/skills/xantoom-design`): `skill` leaves a link alone.

```css
@layer x, app;
@import "xantoom-design/css";
@import "xantoom-design/themes/vexode.css";
```

A site that uses only some components imports `xantoom-design/foundation` (tokens, reset, base, motion and
utilities) plus their families: `@import "xantoom-design/components/forms.css";` (`actions`, `forms`, `content`,
`feedback`, `navigation`, `overlays`, and `extras` for the rare ones).

React and Tailwind apps import the foundation, the families they use and `xantoom-design/tailwind.css`, which gives
Tailwind the tokens under the design system's names and clears its palette. `xantoom-design/react` holds thin
components (button, icon button, field, select, combobox, number, duration, colour, settings, menu, tooltip, dialog,
toaster, avatar, flag, options, theme switch) that put
the classes on native elements; the CSS draws them and `xantoom.js` drives them.

```css
/* Tailwind's preflight under the design system, its utilities over it. */
@layer theme, base, x, components, utilities;
@import 'tailwindcss';
@import 'xantoom-design/foundation';
@import 'xantoom-design/components/overlays.css';   /* and the other families the app's components use */
@import 'xantoom-design/themes/vexode.css';
@import 'xantoom-design/tailwind.css';               /* bg-surface, text-fg-muted, rounded-md, duration-fast… */
```

```tsx
import { Button, Dialog, Menu, MenuItem, TextField, Tooltip } from 'xantoom-design/react';
```

```html
<meta name="color-scheme" content="light dark">
<button class="x-button" data-variant="primary" command="show-modal" commandfor="confirm">Delete…</button>
<dialog class="x-dialog" id="confirm" aria-labelledby="confirm-title" closedby="any">…</dialog>

<script type="module">
  import { enhance } from 'xantoom-design/js';
  enhance();
</script>
```

Fonts: [Inter](https://rsms.me/inter/) and [JetBrains Mono](https://www.jetbrains.com/lp/mono/), both under the SIL
Open Font License. Self-host them (for example `@fontsource-variable/inter`); the stacks fall back to system fonts.

## Themes

| Theme | Gradient | Character |
| --- | --- | --- |
| `xantoom` | vermilion → amber | the default |
| `vixion` | butter → apricot → candy pink | soft, rounder |
| `vixely` | electric blue → violet | sharp, denser |
| `vexode` | night → teal | calm, rounder |
| `vixeeny` | graphite (white in dark mode) | neutral, sharp |

A new app takes a free hue from the registry in
[`new-app.md`](skills/xantoom-design/references/new-app.md), adds `tokens/themes/<app>.tokens.json`, and passes the
contrast tests.

## Develop

```sh
bun install
bun run demo      # http://localhost:4318/demo/
bun run check     # build, lint, tests (contrast, sizes, source rules), and dist/ up to date
```

The tokens (`tokens/`, [DTCG 2025.10](https://www.designtokens.org/tr/2025.10/format/)) are the source of truth;
`bun run build` writes `src/tokens.css` and `dist/`. Both are committed, so a git dependency needs no build.

## Licence

MIT © Xantoom. Inter and JetBrains Mono are not included; they are under the SIL Open Font License 1.1.
