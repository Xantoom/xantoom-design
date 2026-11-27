// Xantoom design system: the stored colour scheme, applied before the first paint. Inline the built file
// (dist/theme-head.js) in <head>, after the theme-color metas and before the stylesheets. Same logic as applyTheme()
// in theme.js, without a module (a module runs after the first paint).
(() => {
	let choice = null;
	try {
		choice = localStorage.getItem('x-theme');
	} catch {
		// Storage blocked: the system scheme.
	}
	if (choice !== 'light' && choice !== 'dark') return;
	document.documentElement.setAttribute('data-theme', choice);
	const metas = [...document.querySelectorAll('meta[name="theme-color"][media]')];
	for (const meta of metas) meta.dataset.xColor = meta.content;
	const forced = metas.find((meta) => meta.media.includes(choice))?.dataset.xColor;
	if (forced) for (const meta of metas) meta.content = forced;
})();
