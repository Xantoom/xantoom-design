// Xantoom design system: the optional behaviour layer (no dependency).
// The CSS works without it; this adds what HTML and CSS cannot do alone, or not yet in every browser:
// animated exits outside Chromium, invoker commands and light dismiss where missing, a dialog's first focus, menus
// placed under their button without anchor positioning, tooltips in every browser, tab, menu and command palette
// keyboards, shortcuts written for the platform, and toasts (shown over an open modal too). What few pages need is
// in extras.js. Call `enhance()` once the page is parsed,
// and again on content inserted later.

const SVG = 'http://www.w3.org/2000/svg';

/** `root` itself when it matches, then its descendants: `enhance(element)` wires the element it is given too. */
const within = (root, selector) => [
	...(root instanceof Element && root.matches(selector) ? [root] : []),
	...root.querySelectorAll(selector),
];

// --- Top layer exits ---------------------------------------------------------------------------------------------

let displayTransitions;
/** Whether `display` really transitions (Firefox parses allow-discrete but does not: bug 1882408). */
function canTransitionDisplay() {
	if (displayTransitions !== undefined) return displayTransitions;
	if (!globalThis.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) return false;
	const probe = document.createElement('div');
	probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
	document.body.append(probe);
	// Reading the style flushes it, so the change below starts a transition.
	void getComputedStyle(probe).display;
	probe.style.display = 'none';
	displayTransitions = getComputedStyle(probe).display === 'block';
	probe.remove();
	return displayTransitions;
}

const nativeExit = () => CSS.supports('overlay', 'auto') && canTransitionDisplay();

/** Resolves once the element's transitions end (at once when reduced motion leaves none running). */
async function settle(element) {
	const running = element.getAnimations({ subtree: true });
	if (running.length === 0) return;
	await Promise.race([
		Promise.allSettled(running.map((a) => a.finished)),
		new Promise((resolve) => setTimeout(resolve, 2000)),
	]);
}

/** Closes a dialog or hides a popover with its exit transition, in every browser. */
export async function closeTopLayer(element, returnValue) {
	if (!nativeExit()) {
		element.setAttribute('data-closing', '');
		await settle(element);
		if (!element.hasAttribute('data-closing')) return;
		element.removeAttribute('data-closing');
	}
	if (element instanceof HTMLDialogElement) element.close(returnValue);
	else element.hidePopover();
}

/**
 * Puts focus where typing starts: the `[autofocus]` element if there is one, else the first field, else the first
 * action (in an alert, the safe one: the main action is last). The browser alone picks the first focusable element,
 * often the close button.
 */
export function focusInitial(dialog) {
	if (dialog.querySelector('[autofocus]')) return;
	const field = dialog.querySelector('input:not([type="hidden"], [type="button"], :disabled), select:not(:disabled), textarea:not(:disabled)');
	(field ?? dialog.querySelector('.x-dialog-actions :is(button, a[href]):not(:disabled)'))?.focus();
}

function dialogs(root) {
	for (const dialog of within(root, 'dialog.x-dialog:not([data-x-ready])')) {
		dialog.setAttribute('data-x-ready', '');
		dialog.addEventListener('toggle', (event) => {
			if (event.newState !== 'open' || !dialog.matches(':modal')) return;
			focusInitial(dialog);
			// Toasts already showing would sit behind the modal, inert: bring them into it.
			const region = document.querySelector('.x-toaster');
			if (region?.querySelector('.x-toast')) hostToaster(region);
		});
		// Esc and `request-close`: animate where the browser would close at once.
		dialog.addEventListener('cancel', (event) => {
			if (nativeExit() || dialog.getAttribute('closedby') === 'none') return;
			event.preventDefault();
			void closeTopLayer(dialog);
		});
		// <form method="dialog"> buttons.
		dialog.addEventListener('submit', (event) => {
			if (nativeExit() || event.target.method !== 'dialog') return;
			event.preventDefault();
			void closeTopLayer(dialog, event.submitter?.value ?? '');
		});
		// closedby="any" (click outside) where the attribute is unknown: press and release both outside.
		if (!('closedBy' in HTMLDialogElement.prototype) && dialog.getAttribute('closedby') === 'any') {
			const outside = (e) => {
				const r = dialog.getBoundingClientRect();
				return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
			};
			let pressedOutside = false;
			dialog.addEventListener('pointerdown', (e) => {
				pressedOutside = outside(e);
			});
			dialog.addEventListener('pointerup', (e) => {
				if (pressedOutside && outside(e)) void closeTopLayer(dialog);
			});
		}
	}
}

// --- Invoker commands (command / commandfor) where the browser lacks them ---------------------------------------

let invokers = false;
function invokerCommands() {
	if (invokers || 'commandForElement' in HTMLButtonElement.prototype) return;
	invokers = true;
	document.addEventListener('click', (event) => {
		const button = event.target.closest?.('button[commandfor][command]');
		if (!button || button.disabled) return;
		const target = document.getElementById(button.getAttribute('commandfor'));
		if (!target) return;
		const command = button.getAttribute('command');
		if (command === 'show-modal') target.showModal();
		else if (command === 'close') void closeTopLayer(target, button.value);
		else if (command === 'request-close') {
			if (target.dispatchEvent(new Event('cancel', { cancelable: true }))) void closeTopLayer(target, button.value);
		} else if (command === 'show-popover') target.showPopover({ source: button });
		else if (command === 'hide-popover') void closeTopLayer(target);
		else if (command === 'toggle-popover') target.togglePopover({ source: button });
	});
}

// --- Menus and popovers under their button where anchor positioning is missing ------------------------------------

let anchors = false;
function anchorFallback() {
	if (anchors || CSS.supports('position-area', 'block-end')) return;
	anchors = true;
	const sourceOf = (panel, event, id = CSS.escape(panel.id)) =>
		event.source ?? document.querySelector(`[popovertarget="${id}"],[commandfor="${id}"],[aria-controls="${id}"]`);
	const place = (panel, source) => {
		const a = source.getBoundingClientRect();
		const r = panel.getBoundingClientRect();
		const gap = 4;
		const edge = 8;
		const below = a.bottom + gap + r.height <= innerHeight - edge || a.top - gap - r.height < edge;
		const start = getComputedStyle(source).direction === 'rtl' ? a.right - r.width : a.left;
		Object.assign(panel.style, {
			inset: 'auto',
			margin: '0',
			top: `${Math.max(edge, below ? a.bottom + gap : a.top - gap - r.height)}px`,
			left: `${Math.min(Math.max(edge, start), innerWidth - r.width - edge)}px`,
		});
	};
	const open = new Map();
	// Placed before it shows (no frame in the middle of the screen), then flipped once its size is known.
	for (const type of ['beforetoggle', 'toggle'])
		document.addEventListener(
			type,
			(event) => {
				const panel = event.target;
				if (!panel.matches?.('.x-menu, .x-popover')) return;
				if (event.newState !== 'open') return open.delete(panel);
				const source = sourceOf(panel, event) ?? open.get(panel);
				if (!source) return;
				open.set(panel, source);
				place(panel, source);
			},
			true,
		);
	// Kept on its button as the page or a box scrolls; closed once the button is out of sight.
	const follow = (event) => {
		for (const [panel, source] of open) {
			const a = source.getBoundingClientRect();
			const box = event.target.contains?.(source) ? event.target.getBoundingClientRect() : {}; // {}: the viewport alone
			if (a.bottom < box.top || a.top > box.bottom || a.bottom < 0 || a.top > innerHeight) void closeTopLayer(panel);
			else place(panel, source);
		}
	};
	addEventListener('scroll', follow, { capture: true, passive: true });
	addEventListener('resize', follow);
}

// --- Tooltips (popover="hint" + interestfor) ------------------------------------------------------------------------

const normalize = (text) => (text ?? '').replace(/\s+/g, ' ').trim();

function nameOf(element) {
	const ids = element.getAttribute('aria-labelledby');
	if (ids)
		return ids
			.split(/\s+/)
			.map((id) => document.getElementById(id)?.textContent ?? '')
			.join(' ');
	const label = element.getAttribute('aria-label');
	if (label) return label;
	const clone = element.cloneNode(true);
	for (const img of clone.querySelectorAll('img[alt]')) img.replaceWith(img.alt);
	return normalize(clone.textContent) || element.getAttribute('title') || '';
}

const ownedTriggers = new Set();
let hintsWired = false;

function hints(root) {
	for (const trigger of within(root, '[interestfor]')) {
		const hint = document.getElementById(trigger.getAttribute('interestfor'));
		if (hint?.getAttribute('popover') !== 'hint') continue;
		const name = normalize(nameOf(trigger));
		if (normalize(hint.textContent) === name) continue;
		if (!hint.hasAttribute('role')) hint.setAttribute('role', 'tooltip');
		if (!name) {
			if (!trigger.hasAttribute('aria-labelledby')) trigger.setAttribute('aria-labelledby', hint.id);
		} else if ([trigger.getAttribute('popovertarget'), trigger.getAttribute('commandfor')].includes(hint.id)) {
			if (!trigger.hasAttribute('aria-expanded')) {
				trigger.setAttribute('aria-expanded', String(hint.matches(':popover-open')));
				ownedTriggers.add(trigger);
			}
		} else if (!trigger.hasAttribute('aria-describedby')) trigger.setAttribute('aria-describedby', hint.id);
	}
	if (hintsWired) return;
	hintsWired = true;
	// `toggle` does not bubble: listen in the capture phase.
	document.addEventListener(
		'toggle',
		({ target, newState }) => {
			for (const trigger of ownedTriggers)
				if (trigger.getAttribute('interestfor') === target.id)
					trigger.setAttribute('aria-expanded', String(newState === 'open'));
		},
		true,
	);
	// Where `hint` is unknown it acts as `manual` and a clicked toggletip would never close: make it `auto` as it opens.
	const probe = document.createElement('div');
	probe.popover = 'hint';
	if (probe.popover !== 'hint')
		document.addEventListener(
			'beforetoggle',
			({ target, newState }) => {
				const toggletip =
					target.getAttribute('popover') === 'hint' &&
					document.querySelector(`[popovertarget="${CSS.escape(target.id)}"]`);
				if (newState === 'open' && toggletip) target.popover = 'auto';
			},
			true,
		);
}

// --- Tooltips on [data-tip]: one shared tooltip, on mouse hover and keyboard focus, in every browser ---------------

let tip;
let tipHost = null;
let tipTimer = 0;
let tipLeft = 0;

/** Names an unnamed trigger by its tooltip, or adds the tooltip as its description when it says something else. */
function tipLabel(element) {
	const name = normalize(nameOf(element));
	const text = normalize(element.dataset.tip);
	if (!name) element.setAttribute('aria-label', text);
	else if (name !== text && !element.hasAttribute('aria-description')) element.setAttribute('aria-description', text);
}

// Touched, these show their tooltip; a control does what it does instead.
const TAP = 'a[href], button, input, select, textarea, label, [role=button], [role=switch], [role=slider], [role=tab]';

function showTip(host) {
	clearTimeout(tipTimer);
	tipHost = host;
	tipLabel(host);
	const { tip: text, tipSub, tipImg, tipPoster } = host.dataset;
	tip.replaceChildren(text);
	if (tipSub) tip.append(Object.assign(document.createElement('small'), { textContent: tipSub }));
	// A picture above the text (an icon, a flag) or a cover (a poster, 3:4); placed again once it has its size.
	if (tipImg || tipPoster) {
		const img = Object.assign(new Image(), { src: tipPoster ?? tipImg, alt: '', onload: () => tipHost === host && placeTip() });
		img.toggleAttribute('data-poster', !!tipPoster);
		tip.prepend(img);
	}
	// Over a modal or in full screen, the rest of the page is hidden: the tooltip goes where its trigger is.
	const layer = host.closest('dialog:modal, :popover-open') ?? document.fullscreenElement ?? document.body;
	if (tip.parentElement !== layer) {
		tip.togglePopover(false);
		layer.append(tip);
	}
	tip.togglePopover(true);
	placeTip();
}

function placeTip() {
	const a = tipHost.getBoundingClientRect();
	const r = tip.getBoundingClientRect();
	const above = a.top - r.height - 6 >= 8;
	Object.assign(tip.style, {
		top: `${above ? a.top - r.height - 6 : a.bottom + 6}px`,
		left: `${Math.min(Math.max(8, a.left + a.width / 2 - r.width / 2), innerWidth - r.width - 8)}px`,
	});
}

function hideTip() {
	clearTimeout(tipTimer);
	if (tipHost) tipLeft = Date.now();
	tipHost = null;
	tip?.togglePopover(false);
}

/**
 * Wires `data-tip` for the whole document (`enhance()` calls it): `data-tip-sub` adds a second line, `data-tip-img` a
 * picture and `data-tip-poster` a cover above the text. Mouse hover and keyboard focus show it; on touch, a tap on
 * anything but a control shows it and a second tap, or a tap elsewhere, hides it.
 */
export function tooltips(root = document) {
	for (const element of within(root, '[data-tip]')) tipLabel(element);
	if (tip) return;
	// Hidden from assistive technology: what it says is already the trigger's name or description.
	tip = Object.assign(document.createElement('div'), { className: 'x-tooltip', id: 'x-tip', popover: 'manual' });
	tip.setAttribute('aria-hidden', 'true');
	// In the page from the start: a popover hidden while disconnected throws.
	document.body.append(tip);
	const hostOf = (event) => event.target.closest?.('[data-tip]');
	// The first waits; a neighbour hovered right after shows at once.
	document.addEventListener('pointerover', (event) => {
		const host = hostOf(event);
		if (!host || host === tipHost || event.pointerType !== 'mouse') return;
		clearTimeout(tipTimer);
		tipTimer = setTimeout(() => showTip(host), Date.now() - tipLeft < 600 ? 0 : 450);
	});
	document.addEventListener('pointerout', (event) => {
		const host = hostOf(event);
		if (host && event.pointerType === 'mouse' && !host.contains(event.relatedTarget)) hideTip();
	});
	// After the frame: focus that lands while a popover is being shown must not show another in the same operation.
	document.addEventListener('focusin', (event) => {
		const host = hostOf(event);
		if (host) requestAnimationFrame(() => host.matches(':focus-visible') && host === document.activeElement && showTip(host));
	});
	document.addEventListener('focusout', (event) => hostOf(event) === tipHost && hideTip());
	document.addEventListener(
		'pointerdown',
		(event) => {
			const host = hostOf(event);
			const tap = host && host !== tipHost && event.pointerType !== 'mouse' && !event.target.closest(TAP);
			hideTip();
			if (tap) showTip(host);
		},
		true,
	);
	addEventListener('scroll', hideTip, { capture: true, passive: true });
	addEventListener('blur', hideTip);
	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') hideTip();
	});
}

// --- Tabs -----------------------------------------------------------------------------------------------------------

function tabs(root) {
	const native = 'focusgroup' in HTMLElement.prototype;
	for (const list of within(root, '.x-tablist:not([data-x-ready])')) {
		list.setAttribute('data-x-ready', '');
		const all = () => [...list.querySelectorAll('[role="tab"]')];
		const panelOf = (tab) =>
			list.parentElement.querySelector(`:scope > [role="tabpanel"][aria-labelledby~="${CSS.escape(tab.id)}"]`);
		const select = (selected, focus) => {
			for (const tab of all()) {
				const on = tab === selected;
				tab.setAttribute('aria-selected', String(on));
				tab.toggleAttribute('focusgroupstart', on);
				if (!native) tab.tabIndex = on ? 0 : -1;
				const panel = panelOf(tab);
				if (!panel) continue;
				if (on) panel.removeAttribute('hidden');
				else if (!panel.hasAttribute('hidden')) panel.setAttribute('hidden', 'until-found');
			}
			if (focus) selected.focus();
			selected.scrollIntoView({ block: 'nearest', inline: 'nearest', container: 'nearest' });
		};
		const current = all().find((t) => t.getAttribute('aria-selected') === 'true') ?? all()[0];
		if (!native) for (const tab of all()) tab.tabIndex = tab === current ? 0 : -1;
		list.addEventListener('click', (event) => {
			const tab = event.target.closest('[role="tab"]');
			if (tab) select(tab, false);
		});
		// Selection follows focus: the native focusgroup moves focus, this keeps the selection in step.
		list.addEventListener('focusin', (event) => {
			const tab = event.target.closest('[role="tab"]');
			if (tab && native && tab.getAttribute('aria-selected') !== 'true') select(tab, false);
		});
		if (!native)
			list.addEventListener('keydown', (event) => {
				const list_ = all();
				const index = list_.indexOf(document.activeElement);
				if (index < 0) return;
				const rtl = getComputedStyle(list).direction === 'rtl';
				const step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1, ArrowDown: 1, ArrowUp: -1 }[event.key];
				let next;
				if (event.key === 'Home') next = 0;
				else if (event.key === 'End') next = list_.length - 1;
				else if (step !== undefined) next = (index + step + list_.length) % list_.length;
				else return;
				event.preventDefault();
				select(list_[next], true);
			});
		// Find-in-page revealed a hidden panel: select its tab.
		for (const tab of all()) panelOf(tab)?.addEventListener('beforematch', () => select(tab, false));
	}
}

// --- Menus (role="menu" only: a plain group of buttons in a popover needs nothing) ----------------------------------

function menus(root) {
	for (const menu of within(root, '.x-menu[role="menu"]:not([data-x-ready])')) {
		menu.setAttribute('data-x-ready', '');
		const items = () => [...menu.querySelectorAll('[role^="menuitem"]:not([aria-disabled="true"], :disabled)')];
		menu.addEventListener('toggle', (event) => {
			if (event.newState === 'open') items()[0]?.focus();
		});
		menu.addEventListener('keydown', (event) => {
			const list = items();
			const index = list.indexOf(document.activeElement);
			const next = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: list.length - 1 }[event.key];
			if (next === undefined) return;
			event.preventDefault();
			list.at(next % list.length)?.focus();
		});
	}
}

// --- Command palette (focus stays in the search; the active option is aria-activedescendant) --------------------------

function commands(root) {
	for (const input of within(root, '.x-command [role="combobox"]:not([data-x-ready])')) {
		input.setAttribute('data-x-ready', '');
		const list = document.getElementById(input.getAttribute('aria-controls'));
		if (!list) continue;
		const options = () => [...list.querySelectorAll('[role="option"]:not([hidden], [aria-disabled="true"])')];
		const activate = (option) => {
			for (const o of options()) o.setAttribute('aria-selected', String(o === option));
			if (!option) return input.removeAttribute('aria-activedescendant');
			if (!option.id) option.id = `x-option-${Math.random().toString(36).slice(2, 9)}`;
			input.setAttribute('aria-activedescendant', option.id);
			option.scrollIntoView({ block: 'nearest', container: 'nearest' });
		};
		// The app re-filters on input: the first visible option becomes active once it has (a frame later), unless a key
		// comes first, which then starts from that first option.
		let pending = 0;
		const settleFilter = () => {
			cancelAnimationFrame(pending);
			pending = 0;
			activate(options()[0]);
		};
		input.addEventListener('input', () => {
			cancelAnimationFrame(pending);
			pending = requestAnimationFrame(settleFilter);
		});
		// Opened: the first option is active, so Enter runs it straight away.
		pending = requestAnimationFrame(settleFilter);
		input.addEventListener('keydown', (event) => {
			if (pending) settleFilter();
			const all = options();
			const index = all.findIndex((o) => o.getAttribute('aria-selected') === 'true');
			if (event.key === 'Enter' && index >= 0) {
				event.preventDefault();
				all[index].click();
				return;
			}
			const next = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: all.length - 1 }[event.key];
			if (next === undefined || all.length === 0) return;
			event.preventDefault();
			activate(all.at(next % all.length));
		});
		list.addEventListener('pointermove', (event) => {
			const option = event.target.closest?.('[role="option"]');
			if (option && option.getAttribute('aria-selected') !== 'true') activate(option);
		});
	}
}

// --- Shortcuts written for the platform: <kbd class="x-kbd" data-mod>K</kbd> reads ⌘ K on Apple devices, Ctrl K elsewhere

const apple = () => /Mac|iPhone|iPad/.test(navigator.userAgentData?.platform ?? navigator.platform ?? '');

function shortcuts(root) {
	const mac = apple();
	for (const kbd of within(root, 'kbd[data-mod]:not([data-x-ready])')) {
		kbd.setAttribute('data-x-ready', '');
		const symbol = document.createElement('span');
		symbol.setAttribute('aria-hidden', 'true');
		symbol.textContent = mac ? '⌘' : 'Ctrl';
		const spoken = document.createElement('span');
		spoken.className = 'x-visually-hidden';
		spoken.textContent = mac ? 'Command ' : 'Control ';
		kbd.prepend(symbol, spoken);
	}
}

// --- Toasts ---------------------------------------------------------------------------------------------------------

function announce(message) {
	if ('ariaNotify' in document) {
		document.ariaNotify(message);
		return;
	}
	let live = document.getElementById('x-announcer');
	if (!live) {
		live = document.createElement('div');
		live.id = 'x-announcer';
		live.className = 'x-visually-hidden';
		live.setAttribute('aria-live', 'polite');
		document.body.append(live);
	}
	live.textContent = '';
	requestAnimationFrame(() => {
		live.textContent = message;
	});
}

function closeIcon() {
	const svg = document.createElementNS(SVG, 'svg');
	for (const [name, value] of Object.entries({
		viewBox: '0 0 24 24',
		'aria-hidden': 'true',
		fill: 'none',
		stroke: 'currentColor',
		'stroke-width': '2',
		'stroke-linecap': 'round',
	}))
		svg.setAttribute(name, value);
	const path = document.createElementNS(SVG, 'path');
	path.setAttribute('d', 'M6 6l12 12M18 6 6 18');
	svg.append(path);
	return svg;
}

let lastFocus = null;

/**
 * While a modal is open the rest of the page is inert, so the toaster moves into the modal (on top, clickable) and
 * back once it closes.
 */
function hostToaster(region) {
	const modal = [...document.querySelectorAll('dialog:modal')].at(-1);
	if (!modal || modal.contains(region)) return;
	const home = [region.parentNode, region.nextSibling];
	const move = (parent, next) => {
		const shown = region.matches(':popover-open');
		if (shown) region.hidePopover();
		parent.insertBefore(region, next);
		if (shown || region.querySelector('.x-toast')) region.showPopover();
	};
	move(modal, null);
	modal.addEventListener('close', () => move(...home), { once: true });
}

async function remove(item, region) {
	if (!item.isConnected || item.hasAttribute('data-closing')) return;
	const hadFocus = item.contains(document.activeElement);
	item.setAttribute('data-closing', '');
	await settle(item);
	const next = item.nextElementSibling ?? item.previousElementSibling;
	item.remove();
	if (hadFocus) (next?.querySelector('button') ?? lastFocus)?.focus();
	if (!region.querySelector('.x-toast') && region.matches(':popover-open')) region.hidePopover();
}

/**
 * Shows a toast in the page's `.x-toaster` region and announces it. Persistent unless `timeout` (ms) is given; the
 * timer pauses while the toast is hovered or focused. The close button's name comes from `closeLabel` or the
 * region's `data-close-label` (the design system holds no text of its own). Shows over an open modal too.
 */
export function toast(message, { tone, timeout = 0, closeLabel } = {}) {
	const region = document.querySelector('.x-toaster');
	if (!region) throw new Error('xantoom: add a .x-toaster region to the page');
	let dismissed = false;
	let item;
	const handle = {
		dismiss() {
			dismissed = true;
			if (item) void remove(item, region);
		},
	};
	const show = () => {
		if (dismissed) return;
		hostToaster(region);
		item = document.createElement('div');
		item.className = 'x-toast';
		if (tone) item.dataset.tone = tone;
		const text = document.createElement('p');
		text.textContent = message;
		const close = document.createElement('button');
		close.type = 'button';
		close.className = 'x-button';
		Object.assign(close.dataset, { variant: 'ghost', icon: '', size: 'sm' });
		close.setAttribute('aria-label', closeLabel ?? region.dataset.closeLabel ?? '');
		close.append(closeIcon());
		close.addEventListener('click', handle.dismiss);
		item.append(text, close);
		region.append(item);
		if (!region.matches(':popover-open')) region.showPopover();
		announce(message);
		if (timeout > 0) {
			let left = timeout;
			let since = Date.now();
			let timer = setTimeout(handle.dismiss, left);
			let paused = false;
			const pause = () => {
				if (paused) return;
				paused = true;
				clearTimeout(timer);
				left -= Date.now() - since;
			};
			// After the event, so :focus-within and :hover describe where focus and pointer went.
			const resume = () =>
				setTimeout(() => {
					if (!paused || item.matches(':hover, :focus-within')) return;
					paused = false;
					since = Date.now();
					timer = setTimeout(handle.dismiss, Math.max(left, 1000));
				});
			item.addEventListener('pointerenter', pause);
			item.addEventListener('focusin', pause);
			item.addEventListener('pointerleave', resume);
			item.addEventListener('focusout', resume);
		}
	};
	show();
	return handle;
}

// --- Entry point ------------------------------------------------------------------------------------------------------

let started = false;

/** Wires every component under `root` (idempotent: call it again after inserting content). */
export function enhance(root = document) {
	if (!started) {
		started = true;
		document.addEventListener('focusin', (event) => {
			if (!event.target.closest?.('.x-toaster')) lastFocus = event.target;
		});
	}
	invokerCommands();
	anchorFallback();
	dialogs(root);
	hints(root);
	tooltips(root);
	tabs(root);
	menus(root);
	commands(root);
	shortcuts(root);
}
