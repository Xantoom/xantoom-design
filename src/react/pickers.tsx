import { type ReactElement, type ReactNode, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Field, type FieldProps } from './field';
import { Popover } from './popover';

type FieldText = Pick<FieldProps, 'label' | 'hint' | 'error' | 'required' | 'className'>;

export interface Choice<T extends string> {
	value: T;
	label: string;
	/** A second line under the label (Combobox). */
	detail?: string;
	disabled?: boolean;
}

/**
 * One choice from a list: the native <select>, drawn by the design system where `appearance: base-select` exists
 * (Chromium) and left to the platform's own list elsewhere, which keeps it usable everywhere, keyboard included.
 */
export function Select<T extends string>({
	value,
	onChange,
	options,
	name,
	disabled,
	...field
}: FieldText & { value: T; onChange: (value: T) => void; options: readonly Choice<T>[]; name?: string; disabled?: boolean }): ReactElement {
	return (
		<Field {...field}>
			{(control) => (
				<select {...control} className="x-select" name={name} disabled={disabled} value={value} onChange={(event) => onChange(event.currentTarget.value as T)}>
					{options.map((option) => (
						<option key={option.value} value={option.value} disabled={option.disabled}>
							{option.label}
						</option>
					))}
				</select>
			)}
		</Field>
	);
}

/** Lower case without accents, so "eve" finds "Événement". */
const fold = (text: string): string => text.normalize('NFD').replaceAll(/\p{M}/gu, '').toLowerCase();

/** The label with the typed part in <mark> (folding keeps the indices: one letter, one mark dropped). */
function highlight(label: string, query: string): ReactNode {
	const at = query ? fold(label).indexOf(fold(query)) : -1;
	if (at < 0) return label;
	const plain = [...label.normalize('NFD')];
	const marks = (from: number, to: number): string => plain.slice(from, to).join('').normalize('NFC');
	// Map folded indices back onto the decomposed label (marks sit between letters and were dropped).
	const letters = plain.flatMap((char, i) => (/\p{M}/u.test(char) ? [] : [i]));
	const start = letters[at] ?? 0;
	const end = letters[at + query.length] ?? plain.length;
	// One span: the item lays its children out with a gap, which would split the word around the mark.
	return (
		<span>
			{marks(0, start)}
			<mark>{marks(start, end)}</mark>
			{marks(end, plain.length)}
		</span>
	);
}

/**
 * A search that picks one choice from a long list (a type, a place, a language): typing filters it, the arrow keys
 * move through it, Enter or Tab takes the active one, Escape closes it. The focus stays in the field.
 */
export function Combobox<T extends string>({
	value,
	onChange,
	options,
	placeholder,
	empty,
	rows = 8,
	name,
	disabled,
	...field
}: FieldText & {
	/** The chosen value, or null when none is. */
	value: T | null;
	onChange: (value: T) => void;
	options: readonly Choice<T>[];
	placeholder?: string;
	/** Shown when nothing matches what is typed. */
	empty: ReactNode;
	/** How many options show before the list scrolls. */
	rows?: number;
	name?: string;
	disabled?: boolean;
}): ReactElement {
	const id = useId();
	const input = useRef<HTMLInputElement>(null);
	const list = useRef<HTMLDivElement>(null);
	const [query, setQuery] = useState<string | null>(null);
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState(0);
	const chosen = options.find((option) => option.value === value);
	const shown = query === null ? options : options.filter((option) => fold(option.label).includes(fold(query)));
	const current = shown[Math.min(active, shown.length - 1)];
	const optionId = (option: Choice<T>): string => `${id}-${option.value}`;

	useLayoutEffect(() => {
		const panel = list.current;
		if (!panel || !input.current) return;
		if (open && !panel.matches(':popover-open')) {
			panel.style.minInlineSize = `${input.current.offsetWidth}px`;
			panel.showPopover({ source: input.current } as ShowPopoverOptions);
		} else if (!open && panel.matches(':popover-open')) panel.hidePopover();
	}, [open]);
	useEffect(() => {
		if (open && current) document.getElementById(optionId(current))?.scrollIntoView({ block: 'nearest' });
	});

	const pick = (option: Choice<T> | undefined): void => {
		if (option && !option.disabled) onChange(option.value);
		setQuery(null);
		setOpen(false);
	};

	return (
		<Field {...field}>
			{(control) => (
				<>
					<div className="x-combobox">
						<input
							{...control}
							ref={input}
							className="x-input"
							role="combobox"
							name={name}
							disabled={disabled}
							aria-expanded={open}
							aria-controls={`${id}-list`}
							aria-autocomplete="list"
							aria-activedescendant={open && current ? optionId(current) : undefined}
							autoComplete="off"
							spellCheck={false}
							placeholder={placeholder}
							value={query ?? chosen?.label ?? ''}
							onChange={(event) => {
								setQuery(event.currentTarget.value);
								setActive(0);
								setOpen(true);
							}}
							onClick={() => setOpen(true)}
							onBlur={() => {
								setQuery(null);
								setOpen(false);
							}}
							onKeyDown={(event) => {
								if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
									event.preventDefault();
									if (!open) return setOpen(true);
									const by = event.key === 'ArrowDown' ? 1 : -1;
									setActive((shown.indexOf(current as Choice<T>) + by + shown.length) % Math.max(1, shown.length));
								} else if (event.key === 'Enter' && open) {
									event.preventDefault();
									pick(current);
								} else if (event.key === 'Tab' && open && query !== null) {
									// Tab takes the active option too, then moves on as usual.
									pick(current);
								} else if (event.key === 'Escape' && (open || query !== null)) {
									event.preventDefault();
									event.stopPropagation();
									setQuery(null);
									setOpen(false);
								}
							}}
						/>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentcolor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
							<path d="m6 9 6 6 6-6" />
						</svg>
					</div>
					<div
						ref={list}
						id={`${id}-list`}
						className="x-menu"
						role="listbox"
						popover="manual"
						aria-label={typeof field.label === 'string' ? field.label : undefined}
						style={{ '--rows': rows } as React.CSSProperties}
					>
						{shown.length === 0 ? <p className="x-menu-empty">{empty}</p> : null}
						{shown.map((option) => (
							<div
								key={option.value}
								id={optionId(option)}
								className="x-menu-item"
								role="option"
								aria-selected={option === current}
								aria-disabled={option.disabled || undefined}
								// Pressing an option must not take the focus from the field (which would close the list).
								onPointerDown={(event) => event.preventDefault()}
								onPointerMove={() => setActive(shown.indexOf(option))}
								onClick={() => pick(option)}
							>
								{option.detail ? (
									<span className="x-menu-text">
										<span>{highlight(option.label, query ?? '')}</span>
										<small>{option.detail}</small>
									</span>
								) : (
									highlight(option.label, query ?? '')
								)}
							</div>
						))}
					</div>
				</>
			)}
		</Field>
	);
}

type Hsv = [hue: number, saturation: number, brightness: number];

const toHex = ([h, s, v]: Hsv): string => {
	const channel = (n: number): string => {
		const k = (n + h / 60) % 6;
		return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255)
			.toString(16)
			.padStart(2, '0');
	};
	return `#${channel(5)}${channel(3)}${channel(1)}`;
};

const toHsv = (hex: string, hue = 0): Hsv => {
	const [r = 0, g = 0, b = 0] = (hex.slice(1).match(/../g) ?? []).map((pair) => Number.parseInt(pair, 16) / 255);
	const max = Math.max(r, g, b);
	const range = max - Math.min(r, g, b);
	let h = hue;
	if (range) h = 60 * (max === r ? ((g - b) / range + 6) % 6 : max === g ? (b - r) / range + 2 : (r - g) / range + 4);
	return [h, max ? range / max : 0, max];
};

const HEX = /^#?([\da-f]{6})$/i;

/**
 * A colour: a button showing it, opening a picker (saturation and brightness on a plane, the arrow keys there too;
 * the hue on a bar; the hex code to type or paste). `value` and `onChange` use "#rrggbb".
 */
export function ColorField({
	label,
	value,
	onChange,
	labels,
	className,
}: {
	label: string;
	value: string;
	onChange: (hex: string) => void;
	/** The picker's parts, for assistive technology: the plane, the hue bar, the hex field. */
	labels: { plane: string; hue: string; hex: string };
	className?: string;
}): ReactElement {
	const id = useId();
	// The hue is kept apart: a grey has none, and dragging through one must not lose it.
	const [hsv, setHsv] = useState<Hsv>(() => toHsv(value));
	const [typed, setTyped] = useState<string | null>(null);
	const plane = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (toHex(hsv) !== value.toLowerCase()) setHsv((now) => toHsv(value, now[0]));
	}, [value, hsv]);

	const update = (next: Hsv): void => {
		setHsv(next);
		onChange(toHex(next));
	};
	const at = (event: React.PointerEvent<HTMLDivElement>): void => {
		const box = event.currentTarget.getBoundingClientRect();
		const x = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
		const s = getComputedStyle(event.currentTarget).direction === 'rtl' ? 1 - x : x;
		update([hsv[0], s, 1 - Math.min(1, Math.max(0, (event.clientY - box.top) / box.height))]);
	};
	const [h, s, v] = hsv;
	const percent = (n: number): string => `${Math.round(n * 100)} %`;

	return (
		<div className={className ? `x-field ${className}` : 'x-field'}>
			<span className="x-label" id={`${id}-label`}>
				{label}
			</span>
			<Popover
				label={label}
				trigger={(props) => (
					<button {...props} type="button" className="x-button" aria-labelledby={`${id}-label ${id}-value`}>
						<span className="x-swatch" style={{ '--x-swatch': value } as React.CSSProperties} />
						<span id={`${id}-value`}>{value.toUpperCase()}</span>
					</button>
				)}
			>
				<div className="x-color" style={{ '--_hue': h } as React.CSSProperties}>
					<div
						ref={plane}
						data-plane=""
						role="slider"
						tabIndex={0}
						aria-label={labels.plane}
						aria-valuenow={Math.round(s * 100)}
						aria-valuetext={`${percent(s)}, ${percent(v)}`}
						onPointerDown={(event) => {
							event.currentTarget.setPointerCapture(event.pointerId);
							at(event);
						}}
						onPointerMove={(event) => {
							if (event.currentTarget.hasPointerCapture(event.pointerId)) at(event);
						}}
						onKeyDown={(event) => {
							const d = event.shiftKey ? 0.1 : 0.02;
							const rtl = getComputedStyle(event.currentTarget).direction === 'rtl' ? -1 : 1;
							const by = { ArrowLeft: [-d * rtl, 0], ArrowRight: [d * rtl, 0], ArrowUp: [0, d], ArrowDown: [0, -d] }[event.key];
							if (!by) return;
							event.preventDefault();
							const fit = (n: number): number => Math.min(1, Math.max(0, n));
							update([h, fit(s + (by[0] ?? 0)), fit(v + (by[1] ?? 0))]);
						}}
					>
						<span style={{ '--_x': `${s * 100}%`, '--_y': `${(1 - v) * 100}%` } as React.CSSProperties} />
					</div>
					<input type="range" min={0} max={359} value={Math.round(h)} aria-label={labels.hue} onChange={(event) => update([Number(event.currentTarget.value), s, v])} />
					<div>
						<span className="x-swatch" style={{ '--x-swatch': value } as React.CSSProperties} />
						<input
							className="x-input"
							aria-label={labels.hex}
							spellCheck={false}
							autoComplete="off"
							value={typed ?? value.toUpperCase()}
							onChange={(event) => {
								const text = event.currentTarget.value;
								setTyped(text);
								const match = HEX.exec(text.trim());
								if (match) {
									const next = toHsv(`#${match[1]}`, h);
									setHsv(next);
									onChange(`#${match[1]?.toLowerCase()}`);
								}
							}}
							onBlur={() => setTyped(null)}
						/>
					</div>
				</div>
			</Popover>
		</div>
	);
}

/**
 * A list of settings in one frame: <Settings title="Recording">{rows}</Settings>. Each row is a SettingRow; its control
 * sits at the end, and moves under the label when the frame is narrow.
 */
export function Settings({ title, level = 3, children, className }: { title: ReactNode; level?: 2 | 3 | 4; children: ReactNode; className?: string }): ReactElement {
	const id = useId();
	const Heading = `h${level}` as const;
	return (
		<section className={className ? `x-settings ${className}` : 'x-settings'} aria-labelledby={id}>
			<Heading id={id}>{title}</Heading>
			<ul>{children}</ul>
		</section>
	);
}

/** One setting: its label, what it does, and its control (given the id and description it must carry). */
export function SettingRow({
	label,
	description,
	children,
}: {
	label: ReactNode;
	description?: ReactNode;
	children: (control: { id: string; 'aria-describedby': string | undefined }) => ReactNode;
}): ReactElement {
	const id = useId();
	return (
		<li>
			<span className="x-setting-text">
				<label htmlFor={id}>{label}</label>
				{description ? <small id={`${id}-d`}>{description}</small> : null}
			</span>
			{children({ id, 'aria-describedby': description ? `${id}-d` : undefined })}
		</li>
	);
}
