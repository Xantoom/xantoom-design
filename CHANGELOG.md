# Changelog

## 0.4.0

- `xantoom-design/react`: thin React components on native elements (Button, IconButton, Tooltip, Field, TextField,
  TextArea, Menu with its items, Dialog, Toaster and `toast`, Avatar, Flag, Spinner, Options, ThemeCycle). The CSS
  draws them; they add only behaviour, through `xantoom.js` where it has it. Types included.
- `xantoom-design/tailwind.css`: the tokens as a Tailwind 4 `@theme inline`, under the design system's names
  (`bg-surface`, `text-fg-muted`, `rounded-md`, `duration-fast`), with Tailwind's palette cleared. Tailwind apps
  declare `@layer theme, base, x, components, utilities;` so the preflight sits under the design system.
- `enhance(element)` also wires the element it is given, not only its descendants.
- A busy button keeps its width: the spinner sits over the label, which turns transparent.
- A menu item marks its current choice with `aria-checked="true"` (a `menuitemradio`) as well as `aria-current`.
- Types for `xantoom-design/js` and `xantoom-design/theme.js`.

## 0.3.0

- New components: `x-options` (a fieldset of radios, text or icons; replaces `x-segmented`), `x-search` (icon, clear
  button and shortcut hint, all CSS), `x-dropzone`, `x-count`, `x-banner` (narrow screens put its action under the
  text), `x-scrubber` (a media timeline with buffered range, hover time and RTL), `x-command` (a command palette on
  `x-dialog`, with filtering and keys in the script), `x-cycle` (one button cycling through icons),
  `x-stats` (tiles that stretch to fill the last row instead of leaving a hole), `x-state` and `x-live` (status
  lines), `x-flag`, `x-status-page` (404 and other error pages).
- `xantoom-design/theme.js`: the stored theme choice (`x-theme`), applied before paint, cycled by an `x-cycle` button
  whose labels and order come from its markup, and kept in sync across tabs.
- The script labels `kbd[data-mod]` as ⌘ on Apple systems and Ctrl elsewhere, with a spoken name; `x-kbd` stays
  left-to-right inside right-to-left text.
- Menus mark the current item (`aria-current`) with a check; chips give their remove button a 28 px hit area and
  tint the chip in danger while it is hovered.
- Less rounded: radii are 6, 8, 10 and 14 px (badges take the small one); the select picker's options follow the
  picker's curve. Vixely's and Vixion's radius knobs move to 0.9 and 1.1.
- A field in an `x-cluster` takes its content's width instead of the whole row.
- `xantoom-design contrast <file.css>`: checks an app's themes (by role, whatever it names its properties, through
  `var()`, `light-dark()`, hex, rgb() and oklch()) against WCAG 2.2 AA; exits 1 on a failure.
- `xantoom-design/brand/*`: the Vexode, Vixion, Vixely and Vixeeny logos.
- The skill: native elements first, reorganise rather than stack on narrow screens, favicons served with their type,
  theme contrast checked with the CLI.
- Fix: the shadow tokens rendered nothing. `light-dark()` takes colours only, so a whole shadow inside it was invalid
  and `box-shadow` fell back to `none`. Both modes now share one geometry and each layer switches its colour; the
  build refuses shadows whose light and dark geometry differ, and a test rejects `light-dark()` around anything but
  a colour.
- The reset gives `box-sizing: border-box` to every element (`:where(*, ::before, ::after)`), not to a hand-kept list
  that missed headings, `blockquote`, `legend`, `output` and others.
- An interactive card no longer rises and grows its shadow on hover: its edge firms up and its ground shifts a shade.
- One file per component family in `dist/components/`, each with the icons it uses, for sites that import the
  foundation plus what they use. The skip link moves to the foundation.
- `data-tone` is now a foundation rule setting `--x-tone` (not inherited), usable by any component.
- An `Inter Fallback` face (Arial or Liberation Sans scaled to Inter Variable's widths and metrics) right after Inter
  in `--x-font-sans`, so text does not reflow when Inter loads.
- Removed: `x-meter` (it drew nothing), `x-segmented` (use `x-options`), and the `cursor`, `font` and
  `touch-action` declarations the reset already makes.

## 0.2.2

- `xantoom-design/foundation`: tokens, reset, base, motion and utilities without the components (2.8 KB brotli), for
  apps that bring their own components.
- `sync` accepts its pointer re-wrapped by a Markdown formatter (`proseWrap: always`): only the words are compared.

## 0.2.1

- Scrollbars use the WebKit pseudo-elements wherever they exist (a rounded thumb that thickens under the pointer,
  without the arrow buttons Windows adds to standard scrollbars); the standard properties only where they are missing.
- `cursor: pointer` also on ARIA widgets (checkbox, radio, switch, option, menu items) and on labels wrapping a
  checkbox or radio, so apps no longer keep their own list.

## 0.2.0

- Custom scrollbars everywhere: thin, a thumb at 3:1 on every surface (`--x-scrollbar-thumb`, `--x-scrollbar-track`),
  the text colour under `prefers-contrast: more`, and a rounded WebKit fallback where `scrollbar-color` is missing.
- From Vixion: `x-touch-target` (44 px hit area on touch screens), `x-lazy` (long lists rendered near the screen),
  `x-readable` (someone else's colour, legible in both themes), `x-enter` and `x-stagger` (content and list items
  coming in, a beat apart, with `sibling-index()`), `x-scrollbar-none` and `x-scrollbar-stable`.

## 0.1.2

- `sync` also points `.claude/CLAUDE.md` to the skill (unless it imports AGENTS.md), and writes its AGENTS.md block
  the way Markdown formatters do, so a formatted project stays in sync.

## 0.1.1

- `--x-line-strong` for lines that must show (outlined tags, scrollbars), and `--x-accent-hover` for hovered accent
  text.
- The skill asks agents to propose moving reusable work from a project into the design system.

## 0.1.0

First release.

- Tokens in DTCG 2025.10: the Xantoom signature (xantoom.dev's grounds, Inter and JetBrains Mono, space, radius,
  motion, two-layer shadows) and themes for xantoom.dev, Vixion, Vixely, Vexode and Vixeeny.
- Pure-CSS components in cascade layers: layout primitives, buttons, fields, select (customizable where supported),
  checkbox, radio, switch, segmented control, range, file, card, badge, avatar, kbd, callout, table, accordion, empty
  state, progress, meter, spinner, skeleton, skip link, nav link, breadcrumb, pagination, tabs, dialog and sheets,
  popover, menu, tooltip and toaster.
- Optional script: exit animations outside Chromium, invoker command and `closedby` fallbacks, tooltip semantics,
  tab and menu keyboards, toasts.
- Cross-agent skill and `xantoom-design sync`.
- Tests: WCAG contrast for every theme in both modes, size budgets, source rules.
