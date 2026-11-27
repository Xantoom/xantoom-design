// Xantoom design system: behaviour few pages need, apart from xantoom.js so that one stays small.
// `contents()` marks the link of the section being read in an .x-toc; `numbers()` gives a plain .x-number field (no
// React) its keys, steps and grip. Call them once the page is parsed, and again on content inserted later.

const within = (root, selector) => [
	...(root instanceof Element && root.matches(selector) ? [root] : []),
	...root.querySelectorAll(selector),
];

// --- Contents that follow the reading: the link of the last heading past the top fifth of its scroller -------------

export function contents(root = document) {
	for (const nav of within(root, '.x-toc:not([data-x-ready])')) {
		nav.setAttribute('data-x-ready', '');
		const links = [...nav.querySelectorAll('a[href^="#"]')]
			.map((link) => [link, document.getElementById(decodeURIComponent(link.hash.slice(1)))])
			.filter(([, target]) => target);
		if (links.length === 0) continue;
		let frame = 0;
		const update = (scroller) => {
			frame = 0;
			const box = scroller instanceof Element ? scroller.getBoundingClientRect() : { top: 0, height: innerHeight };
			const end = scroller instanceof Element ? scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2 : innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
			let current = links[0];
			for (const pair of links) if (pair[1].getBoundingClientRect().top - box.top <= box.height / 5) current = pair;
			if (end) current = links.at(-1);
			for (const [link] of links) link.setAttribute('aria-current', String(link === current[0]));
		};
		addEventListener(
			'scroll',
			(event) => {
				const scroller = event.target === document ? document : event.target;
				if (!frame && (scroller === document || scroller.contains(links[0][1]))) frame = requestAnimationFrame(() => update(scroller));
			},
			{ capture: true, passive: true },
		);
		update(document);
	}
}

// --- Number fields: <div class="x-number" data-step="1"><span class="x-number-scrub">…</span><input role="spinbutton"
// aria-valuemin aria-valuemax …>…<span class="x-number-steps"><button data-step="up">…</div> ----------------------

export function numbers(root = document) {
	for (const box of within(root, '.x-number:not([data-x-ready])')) {
		box.setAttribute('data-x-ready', '');
		const input = box.querySelector('input');
		const step = Number(box.dataset.step ?? 1);
		const limit = (name, fallback) => (input.hasAttribute(name) ? Number(input.getAttribute(name)) : fallback);
		const min = limit('aria-valuemin', -Infinity);
		const max = limit('aria-valuemax', Infinity);
		const digits = (String(step).split('.')[1] ?? '').length;
		const format = new Intl.NumberFormat(document.documentElement.lang || undefined, { maximumFractionDigits: digits });
		// The separators come from a format that has both (a whole-number one writes no decimal mark).
		const parts = new Intl.NumberFormat(document.documentElement.lang || undefined).formatToParts(1000.5);
		const [group = ',', decimal = '.'] = ['group', 'decimal'].map((type) => parts.find((p) => p.type === type)?.value);
		const read = () => Number(input.value.replaceAll(group, '').replaceAll(/\s/g, '').replace(decimal, '.').replace(',', '.'));
		let value = read();
		const set = (next) => {
			if (Number.isFinite(next)) value = Math.min(max, Math.max(min, Number(next.toFixed(digits))));
			input.value = format.format(value);
			input.setAttribute('aria-valuenow', String(value));
			box.querySelector('[data-step="up"]')?.toggleAttribute('disabled', value >= max);
			box.querySelector('[data-step="down"]')?.toggleAttribute('disabled', value <= min);
			input.dispatchEvent(new Event('change', { bubbles: true }));
		};
		input.addEventListener('keydown', (event) => {
			const by = { ArrowUp: 1, ArrowDown: -1, PageUp: 10, PageDown: -10 }[event.key];
			let next;
			if (by) next = value + by * step * (event.shiftKey && Math.abs(by) === 1 ? 10 : 1);
			else if (event.key === 'Home' && min > -Infinity) next = min;
			else if (event.key === 'End' && max < Infinity) next = max;
			else if (event.key === 'Enter') return set(read());
			else return;
			event.preventDefault();
			set(next);
		});
		input.addEventListener('blur', () => set(read()));
		box.addEventListener('click', (event) => {
			const button = event.target.closest('[data-step]');
			if (button) set(value + (button.dataset.step === 'up' ? step : -step));
		});
		// The grip: 4 px of drag per step (Shift: ten), from the value it started at.
		const grip = box.querySelector('.x-number-scrub');
		let drag = null;
		grip?.addEventListener('pointerdown', (event) => {
			if (event.button !== 0 || input.disabled) return;
			event.preventDefault();
			grip.setPointerCapture(event.pointerId);
			set(read());
			drag = [event.clientX, value, getComputedStyle(box).direction === 'rtl' ? -1 : 1];
			box.setAttribute('data-scrubbing', '');
		});
		grip?.addEventListener('pointermove', (event) => {
			if (drag) set(drag[1] + Math.trunc(((event.clientX - drag[0]) * drag[2]) / 4) * step * (event.shiftKey ? 10 : 1));
		});
		for (const type of ['pointerup', 'pointercancel'])
			grip?.addEventListener(type, () => {
				drag = null;
				box.removeAttribute('data-scrubbing');
			});
		set(value);
	}
}
