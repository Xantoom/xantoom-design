# Changelog

## 0.7.0

- Tooltip pictures: `data-tip-img` (a picture above the text, whole) and `data-tip-poster` (a 3:4 cover); React
  `Tooltip` takes `img` and `poster`. The tooltip is placed again once the picture has its size.
- Tooltips on touch: a tap on anything but a control shows the tooltip, a second tap or a tap elsewhere hides it. It
  also hides when the window loses focus.
- React `Select` is now a listbox of its own, the same in every browser: options with an icon or a picture, a second
  line, group headings, a lock and its reason in a tooltip, their own style; typeahead, Home, End, Enter, Space or
  Tab to pick; a search from 12 options; `variant` (`field`, `inline`, `ghost`), `size` (`sm`, `md`, `lg`), `icon`,
  `bare`, `name`. Without `label` it takes `aria-label`, `aria-labelledby` or a SettingRow's `id`. Breaking: it no
  longer renders a native `<select>` (plain HTML keeps `x-select` on one).
- Listbox options (Select, Combobox): `aria-selected` marks the choice with a check, `data-active` the active option;
  the pointer moves the active option. A Combobox now checks its chosen option.
- Field and SettingRow labels have an id (`<control id>-label`), so a control can be read as "label, value".
- New icon: `--x-icon-lock`.
- Budgets: the script 4.5 KB, the React components 10 KB (brotli).

## 0.6.1

- Skill: a rule against local copies. An app wraps a design-system component to adapt its props, never restyles or
  re-implements it, and proposes what is missing for the design system.

## 0.6.0

- Tooltips in every browser: `data-tip` (and `data-tip-sub`, a second line) on any element; `enhance()` shows one
  shared tooltip on mouse hover and keyboard focus, above or under its trigger, and names or describes the trigger
  (`aria-label`, `aria-description`). React `Tooltip` takes `content` and `sub` (strings) and sets them; `IconButton`'s
  `shortcut` is the second line. Breaking: `Tooltip` no longer renders an `interestfor` popover, and `describes` is
  gone.
- Settings: `x-settings` (rows in one frame: label, muted description, control at the end; under the label when
  narrow), React `Settings` and `SettingRow`.
- React `Select` (the native select in a field) and `Combobox` (a search picking one option: filters without accents
  or case, marks the match, arrows, Enter or Tab takes the active option, Escape closes), `ColorField` (plane, hue
  bar, hex code), `DurationField` (m:ss.cc on NumberField's grip and keys).
- Cards: a quiet `x-count` in the title, `x-card-actions` at the end of the head, `x-card[data-flush]` for content
  edge to edge.
- Avatars coloured by their person: `data-hue` with `--x-hue`; React `Avatar seed` and `hueOf()`.
- Long pages: `x-toc` (its current link marked by `contents()`) and `x-figure` with an `x-lightbox` dialog.
- Menus placed by `enhance()` without anchor positioning follow their button as the page or a box scrolls, and close
  once it is out of sight.
- A two-line menu row is computed from the sizes that draw it, not a fixed 3.375 rem.
- `x-dl`: the term sits right on its text (2 px), both at 14 px; pairs 12 px apart.
- `xantoom-design contrast` checks `[data-x-accent]` zones: ink on fill 4.5:1, the zone's accent on each ground 3:1,
  in every theme (light and dark when the file has none).
- Extras: the command palette, scrubber, error page and key figures moved to `components/extras.css` (out of
  `xantoom.css`, which stays under its budget); `xantoom-design/extras.js` holds `contents()` and `numbers()` (a plain
  `x-number` field's keys, steps and grip). Breaking: a page with one of those components imports
  `xantoom-design/components/extras.css`.

## 0.5.1

- The skill and the CSS install apart. `xantoom-design skill` installs the skill on the machine
  (`~/.claude/skills`, `~/.agents/skills`; a link to a checkout is left alone). `xantoom-design sync` is gone: a
  project no longer holds a copy of the skill, a postinstall or a generated pointer. Projects that ran it delete
  `.agents/skills/xantoom-design`, `.claude/skills/xantoom-design` and their `"postinstall": "xantoom-design sync"`.

## 0.5.0

- Toasts show during a modal: `toast()` moves the toaster into the open modal (the page behind is inert) and back
  when it closes, instead of waiting for it to close.
- Dialogs put focus on `[autofocus]`, else the first field, else the first action (`focusInitial()`, run by
  `enhance()` and `useModal()`).
- Alerts: `role="alertdialog"` is narrow, and `.x-dialog-head` sets an icon in its tone beside the title with the
  sentence under it. React `Dialog` takes `variant="alert"`, `icon`, `tone` and `description`, and passes other
  attributes through.
- Menus: a second line (`.x-menu-text` with `<small>`) and a value at the end (`[data-detail]`); `--rows` limits the
  height to N items and half the next. React `MenuItem` takes `description` and `detail`, `Menu` takes `rows`.
- Menus and popovers open under their button where anchor positioning is missing (`enhance()`), instead of centred.
- `x-options`: a disabled choice stays in place, faded; React `Option` takes `disabled`.
- New `x-number`: a number typed freely, dragged sideways from its grip, stepped with the arrow keys or two small
  arrows at its end. React `NumberField` drives it (limits, Shift ×10, Page Up and Down, Home and End, Intl format).
- New React components: `Switch`, `SearchField` (shortcut key, clear button, Escape), `FilePicker` and `DropZone`,
  `Brand`.
- New `x-card-head` and `x-card-mark` (a card's title row, its mark centred on the title) and `x-dl` (labelled text:
  bold term, muted text tight under it, groups apart; `data-layout="row"`).
- `data-x-accent` zones: three colours (`--x-scope`, `--x-scope-ink`, `--x-scope-text`) recolour the fill and the
  accent inside a part of an app.
- Theme: `xantoom-design/theme-head.js`, a classic script to inline in `<head>`; `applyTheme()` points the
  `theme-color` metas at the chosen scheme; `x-cycle` shows the right icon before `themeCycle()` runs.
- `xantoom-design/brand`: `brand(name, { size, label, id })` returns an app's logo as SVG with unique ids.
- `xantoom-design migrate <dir> --map old=new --radius old=new [--dry-run]` renames an app's colour and radius
  classes and variables for the Tailwind bridge.
- Docs: what each CSS family weighs and the lint's `themeImports` (new-app.md), the migration recipe and its pitfalls
  (migrating.md), zone colours (tokens.md).

## 0.4.2

- React: `Popover` (a panel anchored to its button, controlled or not, anchored even when opened from code) and
  `useClose()` to close a popover, menu or dialog from inside; `CommandPalette` on `x-command`, which keeps its active
  option in React so the list can change under it; `useModal()`, the native modal behind `Dialog`.
- `IconButton` takes a `shortcut`, shown in its tooltip; `MenuItem` takes a `target` (`_blank` adds `rel="noopener"`).
- A button with `aria-pressed="true"` shows as pressed (accent, sunk), whatever its variant.
- `x-command`: an option can hold a second line (`.x-command-detail`) and the list an empty state
  (`.x-command-empty`); the first option is active as soon as the palette opens.
- The reset gives `dialog` and `[popover]` back their `margin: auto`, which a reset loaded before it (Tailwind's
  preflight) removed, leaving them in a corner.
- Checkboxes stay square: their radius is capped at 0.25rem.
- `tailwind.css`: interface links inherit their colour, as with the preflight; prose keeps its links.

## 0.4.1

- `xantoom-design contrast` reads blocks for every theme (`[data-theme]`, with `:not([data-theme^="…"])` or
  `:not([data-theme="…"])` exclusions), and `--ground <name>` adds an app's own ground (`--<prefix>-<name>`) that
  text and interface colours must read on.

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
