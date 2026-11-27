// Xantoom design system: the colour scheme choice (system, light, dark), applied before the first paint and kept.
//
// In <head>, before the stylesheets:   <script type="module">import { applyTheme } from '…/theme.js'; applyTheme();</script>
// (or inline the same few lines). Then wire the button once the page is parsed: `themeCycle(button)`.
//
// <button class="x-cycle" type="button" data-label-system="…" data-label-light="…" data-label-dark="…">
//   <svg data-v="system">…</svg><svg data-v="light">…</svg><svg data-v="dark">…</svg>
// </button>
// Each data-label-* is the button's accessible name in that state ("Theme: system. Switch to light"): the design
// system holds no text of its own. The order of the icons is the order of the cycle.

const KEY = 'x-theme';
const STATES = ['system', 'light', 'dark'];

/** The stored choice; "system" when none, or when storage is blocked. */
export function storedTheme() {
	try {
		const value = localStorage.getItem(KEY);
		return STATES.includes(value) ? value : 'system';
	} catch {
		return 'system';
	}
}

/** Applies a choice to the page: `data-theme` on <html> for light or dark, nothing for system. */
export function applyTheme(choice = storedTheme()) {
	if (choice === 'system') document.documentElement.removeAttribute('data-theme');
	else document.documentElement.setAttribute('data-theme', choice);
}

function store(choice) {
	try {
		if (choice === 'system') localStorage.removeItem(KEY);
		else localStorage.setItem(KEY, choice);
	} catch {
		// Storage blocked: the choice lasts for this page only.
	}
}

/**
 * Turns an `.x-cycle` button into the theme switch: it shows the current choice and a press moves to the next.
 * Returns a function that removes the wiring.
 */
export function themeCycle(button, { onChange } = {}) {
	const order = [...button.querySelectorAll(':scope > svg[data-v]')].map((svg) => svg.dataset.v);
	const show = (choice) => {
		for (const svg of button.querySelectorAll(':scope > svg[data-v]'))
			svg.toggleAttribute('data-current', svg.dataset.v === choice);
		const label = button.getAttribute(`data-label-${choice}`);
		if (label) button.setAttribute('aria-label', label);
	};
	const press = () => {
		const current = storedTheme();
		const next = order[(order.indexOf(current) + 1) % order.length] ?? 'system';
		store(next);
		applyTheme(next);
		show(next);
		onChange?.(next);
	};
	// Another tab changed it.
	const sync = (event) => {
		if (event.key !== KEY) return;
		applyTheme();
		show(storedTheme());
	};
	show(storedTheme());
	button.addEventListener('click', press);
	addEventListener('storage', sync);
	return () => {
		button.removeEventListener('click', press);
		removeEventListener('storage', sync);
	};
}
