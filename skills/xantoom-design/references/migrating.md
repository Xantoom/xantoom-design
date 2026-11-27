# Moving an app to the design system

An app that had its own tokens and components moves in this order. Each step builds and passes its checks before the
next one.

## 1. Layers and imports

A Tailwind app:

```css
@layer theme, base, x, components, utilities;
@import 'tailwindcss';
@import 'xantoom-design/foundation';
@import 'xantoom-design/components/forms.css';   /* only the families it uses */
@import 'xantoom-design/themes/<app>.css';
@import 'xantoom-design/tailwind.css';
```

Without Tailwind: `@layer x, app;`, then `xantoom-design/css` (or the foundation and families) and the theme.

## 2. Rename colours and radii

The bridge uses the design system's names. Write the app's old-to-new table, try it, then apply it:

```sh
bunx xantoom-design migrate src --map ink=fg,ink-2=fg-muted,muted=fg-faint,line-2=line-strong \
  --radius xs=sm,sm=md,md=lg --dry-run
bunx xantoom-design migrate src --map … --radius …
```

It renames whole names in classes (with variants and opacity: `hover:bg-ink/50`) and in `--color-*` and `--radius-*`
variables, longest first, so `ink-2` never becomes `fg-2`. Radii shift by one step when the app's scale started a
step lower: rename them in one run, never one after another. Then delete the app's own colour aliases and keep in its
`@theme` only the colours the design system has no name for, defined from `--x-*` tokens.

## 3. Swap components

Replace each local button, field, menu, dialog, tooltip and switch with the design system's (`xantoom-design/react`,
or the classes). Keep a local wrapper only to adapt props, never to restyle.

## Pitfalls already met

- **A popover with a display utility.** `flex` or `grid` on a `popover` element overrides the `display: none` that
  hides it: the closed menu shows. Lay out an inner element.
- **Dialog margins.** Tailwind's preflight sets `margin: 0` on everything: a `<dialog>` lands in the top corner. The
  design system's reset restores `margin: auto` for `dialog` and `[popover]` (0.4.2): keep the layer order above.
- **Unlayered page CSS beats every layer.** A host page or an embed that sets `body { background; color }` or
  `:root { color-scheme }` outside any layer overrides the design system's base, whatever its specificity: the page
  stays light in dark mode. Restate those on `:root` and `body` unlayered in the page, or remove the host's.
- **`color-scheme` decides `light-dark()`.** Every token is `light-dark()`: if something forces `color-scheme: light`
  (a frame, an old meta), the dark theme never shows even with `data-theme="dark"`.
- **`--x-fill` is a gradient.** Overriding it with a bare colour does nothing (it is a background image): use
  `linear-gradient(<colour> 0 0)`, or `data-x-accent` for a zone (tokens.md).
- **The lint rejects bridge colours** until `themeImports` names the bridge (new-app.md).
- **CSS budgets.** Importing `xantoom-design/css` in a site that uses three components costs about 10 KB brotli:
  import the families it uses (the table in new-app.md).
