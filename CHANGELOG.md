# Changelog

## 0.2.1

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
