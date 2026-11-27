# Components

Classes start with `x-`, variants are `data-*` attributes, and state comes from native attributes (`disabled`,
`aria-selected`, `aria-current`, `aria-busy`, `:checked`, `[open]`). The design system holds no text: every label,
name and message comes from the app's translations. `demo/index.html` shows each of them working.

## Layout

| Class | What it does |
| --- | --- |
| `x-container` | Centred column with safe-area gutters. `data-width="narrow"` (44 rem) or `"wide"` (120 rem) |
| `x-stack` | Vertical flow. `data-gap="1|2|6|8|12"` (default 4) |
| `x-cluster` | Wrapping row. `data-justify="end|between"`, `data-gap` |
| `x-grid` | As many columns as fit. `data-min="sm|lg"` (11, 16 or 22 rem) |
| `x-split` | Side and main columns. They stack once the main one would drop under 60 % |
| `x-shell` | App frame with `<header>`, `<nav>` and `<main>` children. The nav moves above main under 48 rem |
| `x-prose` | 68ch text column |
| `x-cq` | Makes the element a size container (`cqi` units, `@container`) |

## Actions

```html
<button class="x-button" data-variant="primary" type="submit">Save</button>
<button class="x-button">Cancel</button>
<button class="x-button" data-variant="ghost" data-icon aria-label="Settings"><svg aria-hidden="true">…</svg></button>
<button class="x-button" data-variant="danger">Delete…</button>
<button class="x-button" data-variant="primary" aria-busy="true" disabled>Saving…</button>
<div class="x-button-group">…buttons…</div>
<button class="x-cycle" type="button" aria-label="…"><svg data-v="system" data-current>…</svg><svg data-v="light">…</svg><svg data-v="dark">…</svg></button>
```

`data-size="sm|lg"`, `data-block` (full width). A link that looks like a button is still an `<a href>`.

`x-cycle` is one button for a choice of two or three states: it shows the current one, a press moves to the next.
Never a row of buttons or a dropdown for the theme. The theme switch takes two pieces:

- In `<head>`, after the `theme-color` metas and before the stylesheets, inline `xantoom-design/theme-head.js` (a
  classic script of about 300 bytes; a module would run after the first paint). It applies the stored choice and
  points the browser's bar at that scheme's `theme-color`.
- Once the page is parsed, `themeCycle(button)` from `xantoom-design/theme.js`. Until then the CSS already shows the
  right icon. The button's `data-label-system`, `data-label-light` and `data-label-dark` are its accessible name in
  each state (system by default). The `theme-color` metas follow each change: no `onChange` needed for them.

```html
<meta name="theme-color" content="#ebebee" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#15161c" media="(prefers-color-scheme: dark)">
<script>/* contents of xantoom-design/theme-head.js (Vite: import it with ?raw and inline it) */</script>
```

The apps' logos: `import { brand } from 'xantoom-design/brand'`, then `brand('vixion', { size: 40 })` returns the SVG
with unique ids (`label` to name it, `id` for a stable suffix when rendering on a server); `<Brand>` in React.

## Forms

```html
<div class="x-field">
  <label class="x-label" for="email">Email</label>
  <input class="x-input" id="email" name="email" type="email" autocomplete="email" required
         aria-describedby="email-hint" spellcheck="false" autocapitalize="none">
  <p class="x-hint" id="email-hint">…</p>
  <p class="x-error" id="email-error" hidden>…</p>   <!-- show it, set aria-invalid and aria-describedby -->
</div>
<textarea class="x-input" …></textarea>               <!-- grows with its content (field-sizing) -->
<select class="x-select" …><button><selectedcontent></selectedcontent></button><option>…</option></select>
<label class="x-check"><input type="checkbox" class="x-checkbox" name="…"> Label</label>
<label class="x-check"><input type="radio" class="x-radio" name="…"> Label</label>
<label class="x-check"><input type="checkbox" class="x-switch" switch role="switch"> Label</label>
<fieldset class="x-options"><legend>View</legend>
  <label><input type="radio" name="view" checked> List</label><label><input type="radio" name="view"> Grid</label>
</fieldset>                                           <!-- data-icons: icon-only, aria-label on each input -->
<div class="x-search"><svg aria-hidden>…</svg><input class="x-input" type="search" placeholder=" " aria-label="…">
  <kbd class="x-kbd">/</kbd><button type="button" aria-label="Clear"><svg aria-hidden>…</svg></button></div>
<label class="x-dropzone"><svg aria-hidden>…</svg><strong>Drop files here</strong><span>or choose</span>
  <small>MP4, WebM · 4 GB</small><input type="file" class="x-visually-hidden"></label>   <!-- data-drag while dragging -->
<input type="range" class="x-range">  <input type="file" class="x-file">  <fieldset class="x-fieldset"><legend>…</legend>…</fieldset>
<div class="x-number" data-step="1"><span class="x-number-scrub" aria-hidden="true"><svg>…</svg></span>
  <input id="…" type="text" inputmode="decimal" role="spinbutton" aria-valuemin="1" aria-valuemax="500" aria-valuenow="20">
  <span class="x-number-unit">GB</span><span class="x-number-steps" aria-hidden="true">
  <button type="button" tabindex="-1" data-step="up"></button><button type="button" tabindex="-1" data-step="down"></button></span></div>
<section class="x-settings" aria-labelledby="rec"><h3 id="rec">Recording</h3><ul>
  <li><span class="x-setting-text"><label for="chat">Save the chat</label><small id="chat-d">…</small></span>
    <input type="checkbox" class="x-switch" switch role="switch" id="chat" aria-describedby="chat-d"></li>
  <li><span class="x-setting-text"><label for="q">Quality</label></span><select class="x-select" id="q">…</select></li>
</ul></section>
```

- A required field gets ` *` after its `.x-label` automatically.
- Invalid fields turn red on `:user-invalid` (after interaction) or `aria-invalid="true"`. On submit, move focus to
  the first error.
- `x-options` is for one choice among a few that stay visible (a view, an alignment). More than five, or a
  setting seldom changed: a select.
- The search shows its shortcut while empty and its clear button once it is not: give it a placeholder (even `" "`).
- An option that cannot be picked now gets `disabled` on its radio: it stays in place, faded, and the arrow keys
  skip it. Say why next to the control, never only in a tooltip.
- A number is typed freely, dragged sideways from its grip (like a design tool's fields: one step per 4 px, Shift
  for ten), and stepped with the arrow keys or the two small arrows at its end (side by side on touch screens).
  Never − and + buttons on both sides. React: `NumberField` (or `DurationField` for m:ss.cc). Without React,
  `numbers()` from `xantoom-design/extras.js` gives it the same keys, steps and grip (limits from the input's
  `aria-valuemin` and `aria-valuemax`, the step from `data-step`).
- Settings: rows in one frame, each a label, a muted line saying what it does, and the control at the end. The title
  reads like an `x-dl` term (never small grey capitals). When the frame is narrow, a control without room moves under
  its label; a select or a text field then takes the width, a number keeps its own.
- A combobox (a search picking one choice from a long list) and a colour field are React components (`Combobox`,
  `ColorField`); their CSS is `x-combobox` with an `x-menu[role="listbox"]`, and `x-color` with `x-swatch`.
- The select's `<button><selectedcontent>` is optional. Chromium and Safari 27 style the picker; elsewhere it is the
  native one.

## Content

| Markup | Notes |
| --- | --- |
| `<article class="x-card">` | `data-variant="flat"`; `data-interactive` with one `<a class="x-card-link">` makes the whole card clickable |
| `<header class="x-card-head"><span class="x-card-mark">12</span><h3>…</h3>…</header>` | A card's heading row: the mark (a number, an icon) centred on the title, anything after it at the end. A total in the title: `<h3>Recordings <span class="x-count">24</span></h3>` (quiet there). Actions: `<div class="x-card-actions">` |
| `<section class="x-card" data-flush><header class="x-card-head">…</header><div class="x-table-scroll">…</div></section>` | Content edge to edge (a table, a console, a list): the head keeps its padding and a line under it, a table loses its own frame |
| `<dl class="x-dl"><div><dt>Today</dt><dd>…</dd></div>…</dl>` | Labelled text: each term a small bold heading, its text muted and tight under it, the groups well apart. `data-layout="row"`: the term beside its text once the list is 32 rem wide. Never small uppercase grey labels over brighter text: the label must not look quieter than what it labels while weighing more |
| `<span class="x-badge" data-tone="accent|success|warning|danger|info">` | Always with text, never colour alone. `data-tone` sets `--x-tone` (not inherited) for any component, the app's own included; without it, muted |
| `<span class="x-count">12</span>` | A number that grows (unread, results): a pill. A word goes in a badge |
| `<span class="x-avatar">AB</span>` or with an `<img alt>` | `data-size="sm|lg"`, `data-shape="tile"` (app-icon corner). `data-hue style="--x-hue: 212"`: a colour of the person's own (React `seed`, `hueOf(id)`), readable in both themes |
| `<nav class="x-toc" aria-label="…"><a href="#coasts">Coasts</a><a href="#light" data-level="2">…</a></nav>` | Contents of a long page; `contents()` from `xantoom-design/extras.js` marks the section being read (`aria-current="true"`) |
| `<figure class="x-figure"><button type="button" command="show-modal" commandfor="big" aria-label="Enlarge: …"><img …></button><figcaption>…</figcaption></figure>` and `<dialog class="x-dialog x-lightbox" id="big" aria-label="…" closedby="any">…<img …></dialog>` | A captioned picture that opens large |
| `<kbd class="x-kbd" data-mod>K</kbd>` | `data-mod`: `enhance()` adds ⌘ on Apple devices, Ctrl elsewhere (and says it to screen readers). Join keys with `&nbsp;` |
| `<button class="x-chip" type="button" aria-pressed="false">Places</button>` | A filter. A removable value: `<span class="x-chip">…<button type="button" aria-label="Remove …">×</button></span>` |
| `<span class="x-state" data-tone="danger"><svg aria-hidden>…</svg>Recording</span>` | A state is an icon and a word; `data-tone` only where it needs attention. `<span class="x-live">Live</span>` for live media. Nothing pulses |
| `<dl class="x-stats"><div class="x-stat"><dt>…</dt><dd>1 284</dd><span data-trend="up">+38 this week</span></div></dl>` | Key figures; the trend says it in words too. In `components/extras.css` |
| `<svg class="x-flag" aria-hidden="true"><use href="#flag-fr"/></svg>` | Flags fill their box (`preserveAspectRatio="xMidYMid slice"` on each symbol) and always sit next to the language's name |
| `<main class="x-status-page"><span class="x-status-icon"><svg aria-hidden>…</svg></span><p data-code>404</p><h1>…</h1><p>…</p><div class="x-cluster">…</div></main>` | 404, errors, offline: one layout everywhere, always with a way out. In `components/extras.css` |
| `<div class="x-callout" data-tone="…" role="status"><svg aria-hidden>…</svg><p>…</p></div>` | Messages in the page. Prefer them to toasts |
| `<div class="x-table-scroll" role="region" aria-label="…" tabindex="0"><table class="x-table">` | Sticky headers. `data-numeric` on number cells. `<tbody data-long>` renders only rows on screen |
| `<details class="x-accordion" name="group"><summary>…</summary><div>…</div></details>` | `name` makes the group exclusive |
| `<div class="x-empty"><svg aria-hidden>…</svg><h3>…</h3><p>…</p><a class="x-button">…</a></div>` | Every empty or error state offers a next step |

## Feedback

```html
<progress class="x-progress" value="40" max="100" aria-label="Upload"></progress>   <!-- no value: indeterminate -->
<span class="x-spinner" role="status" aria-label="Loading…"></span>
<span class="x-skeleton"></span>   <!-- size it (in the app layer) exactly like the content it stands for -->
<div class="x-banner" data-tone="warning" role="status"><svg aria-hidden>…</svg><p>…</p>
  <button class="x-button" data-size="sm">…</button><button class="x-banner-close" type="button" aria-label="…">…</button></div>
<!-- Scrubber, a media timeline (components/extras.css) -->
<div class="x-scrubber" role="slider" tabindex="0" aria-label="…" aria-valuemin="0" aria-valuemax="…" aria-valuenow="…"
  aria-valuetext="1:12:40" style="--value: 35%; --buffered: 62%"><div class="x-scrubber-track"></div>
  <div class="x-scrubber-thumb"></div><output aria-hidden="true">…</output></div>
```

The banner is about the app (an announcement, maintenance, an update): it stays until closed, across the top. The
scrubber is drawn by the CSS; the app sets `--value`, `--buffered`, `--hover` and the hovered time, and owns the
keyboard (arrow keys, `aria-valuetext` with the time).

Show a spinner or skeleton only after about 200 ms, and for at least about 400 ms once shown.

## Navigation

```html
<a class="x-skip-link" href="#main">Skip to content</a>            <!-- first element of <body> -->
<a class="x-navlink" href="/projects" aria-current="page"><svg aria-hidden>…</svg>Projects</a>
<nav aria-label="Breadcrumb"><ol class="x-breadcrumb"><li><a href="/">Home</a></li><li aria-current="page">…</li></ol></nav>
<nav aria-label="Pages"><ul class="x-pagination"><li><a href="?p=1" aria-current="page">1</a></li>…</ul></nav>
<div class="x-tabs">
  <div class="x-tablist" role="tablist" aria-label="…">
    <button class="x-tab" type="button" role="tab" id="t-a" aria-selected="true">A</button>
    <button class="x-tab" type="button" role="tab" id="t-b">B</button>
  </div>
  <div role="tabpanel" aria-labelledby="t-a" tabindex="0">…</div>
  <div role="tabpanel" aria-labelledby="t-b" hidden="until-found">…</div>
</div>
```

Tabs are not page navigation: use links with `aria-current` for that. Write the initial state in the HTML.
`enhance()` adds selection, arrow keys, Home and End, find-in-page, and scrolls the selected tab into view. Put no
padding on the panel itself: put it on a child.

## Overlays

```html
<!-- Modal dialog (a bottom sheet on phones; data-variant="sheet" is a side sheet; data-size="lg") -->
<button class="x-button" command="show-modal" commandfor="confirm">Delete…</button>
<dialog class="x-dialog" id="confirm" aria-labelledby="confirm-title" closedby="any">
  <h1 id="confirm-title">…</h1><p>…</p>
  <form method="dialog" class="x-dialog-actions">
    <button class="x-button" value="cancel" autofocus>Cancel</button>
    <button class="x-button" data-variant="danger" value="delete">Delete</button>
  </form>
</dialog>

<!-- Alert: a narrow question; its icon in the tone, its sentence announced with it -->
<dialog class="x-dialog" role="alertdialog" id="drop" aria-labelledby="drop-title" aria-describedby="drop-text" closedby="closerequest">
  <header class="x-dialog-head" data-tone="danger"><svg aria-hidden>…</svg><h1 id="drop-title">Delete this recording?</h1>
    <p id="drop-text">…</p></header>
  <form method="dialog" class="x-dialog-actions"><button class="x-button">Cancel</button>
    <button class="x-button" data-variant="danger" value="delete">Delete</button></form>
</dialog>

<!-- Popover / menu (a group of buttons; add role="menu" + role="menuitem" only with enhance()) -->
<button class="x-button" popovertarget="actions" aria-label="More"><svg aria-hidden>…</svg></button>
<div class="x-menu" id="actions" popover>
  <p class="x-menu-label">…</p>
  <button class="x-menu-item" type="button"><svg aria-hidden>…</svg>Rename…<kbd class="x-kbd">F2</kbd></button>
  <button class="x-menu-item" type="button"><span class="x-menu-text"><span>English</span><small>298 lines</small></span><span data-detail>SRT</span></button>
  <hr class="x-menu-separator">
  <button class="x-menu-item" type="button" data-tone="danger">Delete…</button>
</div>
<div class="x-popover" id="details" popover>…</div>

<!-- Language menu: flags next to names, the current one marked -->
<button class="x-button" data-variant="ghost" popovertarget="lang" aria-label="Language: Français"><svg class="x-flag" aria-hidden="true"><use href="#flag-fr"/></svg></button>
<div class="x-menu" id="lang" popover>
  <a class="x-menu-item" href="/fr/" hreflang="fr" lang="fr" aria-current="true"><svg class="x-flag" aria-hidden="true">…</svg>Français</a>
  <a class="x-menu-item" href="/en/" hreflang="en" lang="en"><svg class="x-flag" aria-hidden="true">…</svg>English</a>
</div>

<!-- Command palette (components/extras.css): a dialog with a search and a listbox; the app filters, enhance() adds the keys -->
<dialog class="x-dialog x-command" id="palette" aria-label="Commands" closedby="any">
  <label class="x-command-search"><svg aria-hidden>…</svg><input role="combobox" aria-expanded="true"
    aria-controls="palette-list" aria-autocomplete="list" aria-label="Search commands"></label>
  <div class="x-command-list" role="listbox" id="palette-list" aria-label="Results">
    <div role="group" aria-labelledby="g-pages"><span id="g-pages">Pages</span>
      <div role="option" id="o-1" aria-selected="true"><span>…</span><small>…</small></div></div>
  </div>
  <footer><span><kbd class="x-kbd">↑</kbd> <kbd class="x-kbd">↓</kbd> …</span></footer>
</dialog>

<!-- Tooltip, in every browser: enhance() shows one on mouse hover and keyboard focus -->
<button class="x-button" data-icon aria-label="Bold" data-tip="Bold" data-tip-sub="Ctrl B"><svg aria-hidden>…</svg></button>

<!-- Toasts: one region per page, filled by toast() -->
<section class="x-toaster" popover="manual" role="region" aria-label="Notifications" data-close-label="Dismiss"></section>
```

```js
import { enhance, toast, closeTopLayer } from 'xantoom-design/js';
enhance();
toast(t('saved'), { tone: 'success', timeout: 6000 });   // persistent without timeout
```

- Dialogs: name them (`aria-labelledby`); `enhance()` puts focus on `[autofocus]`, else the first field, else the
  first action (the safe one: the main action is last). Close with
  `<form method="dialog">` or `command="close"`. No `role="dialog"`, `aria-modal`, focus trap or scroll lock: the
  browser does all of it. Use `command="request-close"` and a `cancel` handler for unsaved changes.
- Menus and popovers anchor to their invoker where CSS anchor positioning exists, and flip at screen edges. Elsewhere
  `enhance()` places them under their button (above it when there is no room), keeps them there as the page or a box
  scrolls, and closes them once the button is out of sight.
- A long menu: `style="--rows: 6"` shows six items and half the seventh, then scrolls.
- A menu item with `aria-current` (a language, a sort order) gets a check at its end.
- The command palette keeps focus in its search; arrow keys, Home and End move the active option
  (`aria-activedescendant`), Enter clicks it, and the first visible option becomes active after each input.
- Tooltips: `data-tip` (and `data-tip-sub`, a quieter second line) on any element; `data-tip-img` puts a picture
  above the text (an icon, a flag: whole, 3.5 rem high) and `data-tip-poster` a 3:4 cover (10 rem high). One shared
  tooltip shows on mouse hover (after 450 ms; at once on a neighbour) and keyboard focus, above its trigger or under
  it, and hides on Escape, a press, a scroll or when the window loses focus. It names a trigger that has none and
  describes one whose name says something else (`aria-description`). On touch, a tap on anything but a control (a
  link, a button, a field, a label, a switch, a slider, a tab) shows it, and a second tap or a tap elsewhere hides
  it; a control does what it does instead, so never put needed information only there. The older
  `interestfor` + `popover="hint"` markup still works, in Chromium only.
- Toasts are for supplemental news; keep their actions available elsewhere. During a modal, `toast()` moves the
  region into the modal (the page behind is inert), so a toast shows over it, clickable, and moves back when it
  closes.
- An alert (`role="alertdialog"`) asks one question that needs an answer: no click outside
  (`closedby="closerequest"`), focus on the safe action.

## Utilities

`x-visually-hidden`, `x-tabular` (tabular numbers), `x-mono`, `x-muted`, `x-truncate`, `x-display` (hero size),
`x-flip-rtl` (directional icons), `x-tile` (the brand tile), `x-surface`, `x-raised`, `x-reveal` (rises in on scroll),
`x-pressable`, `x-enter` and `x-stagger` (see motion), and:

| Utility | Use |
| --- | --- |
| `x-touch-target` | A small control (an icon in a dense row) gets a 44 px hit area on touch screens. Needs a positioned box |
| `x-lazy` | An item of a long list, rendered only near the screen. Set `--x-lazy-size` to its usual height |
| `x-readable` | A colour someone else chose (a chat name, a label): set `--x-color`, it stays legible in both themes |
| `x-scrollbar-none`, `x-scrollbar-stable` | Hide a scrollbar (the box still scrolls), or keep its room so content never shifts |

Scrollbars are styled everywhere: a rounded thumb of `--x-scrollbar-thumb` (the control edge, 3:1 on every surface,
the text colour under `prefers-contrast: more`) on `--x-scrollbar-track`, thickening under the pointer. Set those two
on a box to change its scrollbar; never transition them. Do not set `scrollbar-width` or `scrollbar-color` in app
code (except `none` through `x-scrollbar-none`): in Chromium they switch off the styled scrollbar and bring back the
arrow buttons Windows draws.

## React

`xantoom-design/react` puts these classes on native elements and adds only behaviour; it needs React 19.2+ and
`enhance()` from `xantoom-design/js` (the components call it on what they render).

| Component | Renders |
| --- | --- |
| `<Button variant size block busy>` | `.x-button`; `busy` shows the spinner and blocks presses but keeps focus. `buttonProps()` gives a link the look |
| `<IconButton label shortcut>` | A ghost icon button named by `label`, with a tooltip repeating it (`tooltip={false}` for none) and its shortcut. A toggle takes `aria-pressed`: pressed, it sits in and turns accent |
| `<Tooltip content sub img poster>` | `data-tip` (and `data-tip-sub`, `-img`, `-poster`) on its child: the shared tooltip, in every browser |
| `<Select value onChange options label? variant size icon bare search rows name>` | One choice from a list, the same in every browser: `button.x-select` (`aria-haspopup="listbox"`) and a listbox in a popover (top layer, so over a modal too). Options (`{ value, label, detail, icon, disabled, reason, group, style }`) take an icon or an `<img>`, a second line, a group heading (consecutive options of one `group`), a lock with `reason` in its tooltip, their own style (a font in its face). Arrows, Home, End and typing move; Enter, Space or Tab take the active option; Escape closes. `search: { label, empty }` adds a filter field from 12 options. `variant`: `field` (default), `inline` (framed on hover and while open, in a row of properties), `ghost` (muted, in a toolbar); `size`: `sm`, `md`, `lg`; `icon` before the value; `bare` shows only the chevron. With `label` it is a field; without, `aria-label`, `aria-labelledby` or a SettingRow's `id` names it. `name` submits it in a hidden input. Plain HTML keeps the native `<select class="x-select">` |
| `<Combobox label value onChange options empty placeholder rows>` | A search picking one option (`{ value, label, detail }`) from a long list: typing filters (accents and case aside) and marks the match, the arrows move, Enter or Tab takes the active option, Escape closes. Focus stays in the field |
| `<ColorField label value onChange labels>` | A button showing the colour, opening a picker: saturation and brightness on a plane (arrow keys too), hue on a bar, the hex code. `labels` names the three parts |
| `<Settings title level>` with `<SettingRow label description>{(control) => …}</SettingRow>` | `x-settings`: the control gets the id and description it must carry |
| `<DurationField label value onChange step min max locale>` | A duration in seconds shown m:ss.cc (h:mm:ss.cc from an hour), on NumberField's grip and keys (a tenth of a second, Shift a second); "2:30", "150.5" or "150,5" typed |
| `<Field label hint error required>{(control) => …}</Field>`, `<TextField>`, `<TextArea>` | Label, hint and error tied to the control (`id`, `aria-describedby`, `aria-invalid`) |
| `<Menu label rows trigger={(props) => <Button {...props}>…</Button>}>` with `MenuItem` (`icon`, `description`, `detail`, `checked`, `tone`, `shortcut`, `href`, `target`), `MenuLabel`, `MenuGroup`, `MenuSeparator` | A `popover` menu anchored to its button; a choice closes it and focus returns. `rows` limits its height; `description` is a muted second line, `detail` a value at the end |
| `<Popover label trigger open onOpenChange>` and `useClose()` | A panel anchored to its button (filters, a small form); its content exists only while open, and `useClose()` closes it from inside. `className` sizes it: a display utility (`flex`) would show it closed, so lay out an inner element |
| `<Dialog open onClose title actions closeLabel size variant icon tone description>` | A modal `<dialog closedby="any">`; its content exists only while open, focus starts in its first field. `variant="alert"`: `role="alertdialog"`, narrow, no click outside, `icon` in the `tone`, `description` announced. Other attributes pass through. `useModal()` drives any other native modal the same way |
| `<Switch label checked onChange>` | `x-switch` in its `x-check` label: a native checkbox with `switch` and `role="switch"` |
| `<NumberField label value onChange min max step unit format locale>` | `x-number`: typed freely (checked on leaving or Enter, Escape undoes), dragged from the grip, arrow keys (Shift ×10), Page Up and Down, Home and End, the small arrows; shown with `Intl.NumberFormat` |
| `<SearchField label value onChange shortcut clearLabel>` | `x-search`: the shortcut (one key, "/") focuses it while empty, then the clear button; Escape clears it before closing what holds it |
| `<FilePicker accept multiple onFiles>{(pick) => …}</FilePicker>`, `<DropZone title hint detail icon accept multiple onFiles>` | A hidden file input any button opens; the `x-dropzone`, with its drag state |
| `<Brand name size label>` | An app's logo from `xantoom-design/brand`, its ids unique |
| `<CommandPalette open onClose label query onQueryChange groups empty>` | Needs `xantoom-design/components/extras.css`. `x-command`: the app filters `groups` (`{ id, label, items: [{ id, label, icon, detail, hint, onSelect }] }`); the first item is active, the arrow keys move it, Enter or a click closes and runs it |
| `<Toaster label closeLabel>` and `toast()` | The toast region, once per page |
| `<Avatar name src size shape seed>`, `<Flag code>`, `<Spinner label>` | Initials when the picture is missing or fails, on a colour of the person's own with `seed` (their id; `hueOf(id)` gives the same hue for a cursor or a name); drawn flags (fr, gb, de, it, es) |
| `<Options legend name value options onChange>` | `x-options`; icon-only when every option has an icon; `disabled` on an option fades it and the arrows skip it |
| `<ThemeCycle labels icons>` | The `x-cycle` theme switch on `theme.js` |
