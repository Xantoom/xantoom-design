import { closeTopLayer, tooltips } from 'xantoom-design/js';
import { type CSSProperties, type ReactElement, type ReactNode, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Field, type FieldProps } from './field';
import { Popover } from './popover';

type FieldText = Pick<FieldProps, 'label' | 'hint' | 'error' | 'required' | 'className'>;

export interface Choice<T extends string> {
	value: T;
	label: string;
	/** A second line under the label. */
	detail?: string;
	/** Before the label, in the list and on the button: an icon, or an <img> (a flag, a cover). */
	icon?: ReactNode;
	disabled?: boolean;
	/** Why it is disabled: a lock, and this in its tooltip. */
	reason?: string;
	/** The heading it shows under (Select); options of one group follow each other. */
	group?: string;
	/** The label's own style, e.g. a font shown in that font. */
	style?: CSSProperties;
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

type Named = {
	/** The button's id (a SettingRow's control id): its label is the element `${id}-label`. */
	id?: string;
	'aria-label'?: string;
	'aria-labelledby'?: string;
	'aria-describedby'?: string;
	'aria-invalid'?: true;
};

export interface SelectProps<T extends string> extends Partial<FieldText>, Named {
	value: T;
	onChange: (value: T) => void;
	options: readonly Choice<T>[];
	/** `inline`: a value in a row of properties, framed on hover and while open. `ghost`: muted, in a toolbar. */
	variant?: 'field' | 'inline' | 'ghost';
	size?: 'sm' | 'md' | 'lg';
	/** Before the choice on the button: what the select changes (a sort icon). */
	icon?: ReactNode;
	/** Only the chevron shows: the choice is read elsewhere. */
	bare?: boolean;
	/** A search over the list, once it holds 12 options or more: its label, and what shows when nothing matches. */
	search?: { label: string; empty: ReactNode };
	/** How many options show before the list scrolls. */
	rows?: number;
	/** Submitted with a form, in a hidden input. */
	name?: string;
	disabled?: boolean;
}

/**
 * One choice from a list, drawn the same in every browser: a button showing the choice, a listbox in a popover (in the
 * top layer, so over a modal too). Options take an icon or a picture, a second line, a group heading, a disabled
 * state with its reason. The arrow keys, Home, End and typing move through the list; Enter, Space or Tab take the
 * active option; Escape closes it. From 12 options, with `search`, a field filters the list.
 * With `label`, it is a field (label, hint, error); without, `aria-label`, `aria-labelledby` or `id` names it.
 */
export function Select<T extends string>({ label, hint, error, required, className, ...props }: SelectProps<T>): ReactElement {
	if (label === undefined) return <SelectButton {...props} className={className} />;
	return (
		<Field label={label} hint={hint} error={error} required={required} className={className}>
			{({ required: _required, ...control }) => <SelectButton {...props} {...control} />}
		</Field>
	);
}

function SelectButton<T extends string>({
	value,
	onChange,
	options,
	variant = 'field',
	size = 'md',
	icon,
	bare,
	search,
	rows = 8,
	name,
	disabled,
	className,
	...named
}: Omit<SelectProps<T>, keyof FieldText | 'required'> & { className?: string }): ReactElement {
	const id = useId();
	const button = useRef<HTMLButtonElement>(null);
	const panel = useRef<HTMLDivElement>(null);
	const list = useRef<HTMLDivElement>(null);
	const field = useRef<HTMLInputElement>(null);
	const typed = useRef({ text: '', at: 0 });
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [active, setActive] = useState<Choice<T>>();
	const chosen = options.find((option) => option.value === value);
	const searching = search !== undefined && options.length >= 12;
	const shown = query ? options.filter((option) => fold(`${option.label} ${option.detail ?? ''}`).includes(fold(query))) : options;
	const enabled = shown.filter((option) => !option.disabled);
	const current = active && enabled.includes(active) ? active : enabled[0];
	const optionId = (option: Choice<T>): string => `${id}-${options.indexOf(option)}`;
	const self = named.id ?? `${id}-button`;
	// The button reads "label, choice": its label (or its own aria-label), then the value.
	const labelledBy = named['aria-labelledby'] ?? (named['aria-label'] ? self : `${self}-label`);

	useEffect(() => tooltips(), []);
	useEffect(() => {
		if (open && current) document.getElementById(optionId(current))?.scrollIntoView({ block: 'nearest' });
	});

	const opening = (): void => {
		if (panel.current && button.current) panel.current.style.minInlineSize = bare ? '' : `${button.current.offsetWidth}px`;
	};
	const pick = (option: Choice<T> | undefined): void => {
		if (!option || option.disabled) return;
		onChange(option.value);
		if (panel.current) void closeTopLayer(panel.current);
	};
	const move = (to: number): void => {
		const at = current ? enabled.indexOf(current) : -1;
		setActive(enabled[Math.min(Math.max(to === Infinity ? enabled.length - 1 : to === -Infinity ? 0 : at + to, 0), enabled.length - 1)]);
	};
	// Typing a name's first letters goes to it; the same letter again goes to the next one.
	const typeahead = (key: string): void => {
		const now = Date.now();
		const t = typed.current;
		t.text = (now - t.at > 700 ? '' : t.text) + fold(key);
		t.at = now;
		const from = current ? enabled.indexOf(current) + (t.text.length === 1 ? 1 : 0) : 0;
		const hit = [...enabled.slice(from), ...enabled.slice(0, from)].find((option) => fold(option.label).startsWith(t.text));
		if (hit) setActive(hit);
	};

	const groups: [string | undefined, Choice<T>[]][] = [];
	for (const option of shown) {
		const last = groups.at(-1);
		if (last && last[0] === option.group) last[1].push(option);
		else groups.push([option.group, [option]]);
	}
	const row = (option: Choice<T>): ReactElement => {
		const text = (
			<span style={option.style}>{searching ? highlight(option.label, query) : option.label}</span>
		);
		return (
			<div
				key={option.value}
				id={optionId(option)}
				className="x-menu-item"
				role="option"
				aria-selected={option.value === value}
				aria-disabled={option.disabled || undefined}
				data-active={option === current ? '' : undefined}
				data-tip={option.disabled ? option.reason : undefined}
				onPointerMove={() => !option.disabled && setActive(option)}
				onClick={() => pick(option)}
			>
				{option.icon}
				{option.detail ? (
					<span className="x-menu-text">
						{text}
						<small>{option.detail}</small>
					</span>
				) : (
					text
				)}
			</div>
		);
	};

	return (
		<>
			<button
				ref={button}
				type="button"
				id={self}
				className={className ? `x-select ${className}` : 'x-select'}
				aria-label={named['aria-label']}
				aria-labelledby={`${labelledBy} ${id}-value`}
				aria-describedby={named['aria-describedby']}
				aria-invalid={named['aria-invalid']}
				aria-haspopup="listbox"
				aria-expanded={open}
				popoverTarget={`${id}-panel`}
				data-variant={variant === 'field' ? undefined : variant}
				data-size={size === 'md' ? undefined : size}
				data-bare={bare ? '' : undefined}
				disabled={disabled}
				onClick={opening}
				onKeyDown={(event) => {
					if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && !open) {
						event.preventDefault();
						opening();
						panel.current?.showPopover({ source: button.current } as ShowPopoverOptions);
					}
				}}
			>
				{icon}
				<span className="x-select-value" id={`${id}-value`}>
					{chosen?.icon}
					<span style={chosen?.style}>{chosen?.label}</span>
				</span>
			</button>
			{name ? <input type="hidden" name={name} value={value} /> : null}
			<div
				ref={panel}
				id={`${id}-panel`}
				className="x-menu"
				popover="auto"
				style={{ '--rows': rows } as CSSProperties}
				onToggle={(event) => {
					const now = (event.nativeEvent as ToggleEvent).newState === 'open';
					setOpen(now);
					setQuery('');
					if (now) {
						setActive(chosen);
						(field.current ?? list.current)?.focus();
					}
				}}
				onKeyDown={(event) => {
					const inList = event.target === list.current;
					const keys: Record<string, () => void> = {
						ArrowDown: () => move(1),
						ArrowUp: () => move(-1),
						Enter: () => pick(current),
						...(inList ? { Home: () => move(-Infinity), End: () => move(Infinity), ' ': () => pick(current) } : {}),
					};
					if (event.key === 'Tab') pick(current);
					else if (keys[event.key]) {
						event.preventDefault();
						keys[event.key]?.();
					} else if (inList && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) typeahead(event.key);
				}}
			>
				{searching ? (
					<input
						ref={field}
						className="x-input"
						type="search"
						role="combobox"
						aria-label={search.label}
						placeholder={search.label}
						aria-expanded={open}
						aria-controls={`${id}-list`}
						aria-autocomplete="list"
						aria-activedescendant={current ? optionId(current) : undefined}
						autoComplete="off"
						spellCheck={false}
						value={query}
						onChange={(event) => setQuery(event.currentTarget.value)}
					/>
				) : null}
				<div
					ref={list}
					id={`${id}-list`}
					role="listbox"
					tabIndex={-1}
					aria-labelledby={labelledBy}
					aria-activedescendant={!searching && current ? optionId(current) : undefined}
				>
					{shown.length === 0 ? <p className="x-menu-empty">{search?.empty}</p> : null}
					{groups.map(([group, items], index) =>
						group === undefined ? (
							items.map(row)
						) : (
							<div key={`${group}-${index}`} role="group" aria-labelledby={`${id}-g${index}`}>
								<div className="x-menu-label" id={`${id}-g${index}`}>
									{group}
								</div>
								{items.map(row)}
							</div>
						),
					)}
				</div>
			</div>
		</>
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
								aria-selected={option.value === value}
								data-active={option === current ? '' : undefined}
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

/** The colour picker on its own (in a Popover with a button of the app's): the plane, the hue bar, the hex code. */
export function ColorPicker({
	value,
	onChange,
	labels,
}: {
	value: string;
	onChange: (hex: string) => void;
	/** The picker's parts, for assistive technology: the plane, the hue bar, the hex field. */
	labels: { plane: string; hue: string; hex: string };
}): ReactElement {
	// The hue is kept apart: a grey has none, and dragging through one must not lose it.
	const [hsv, setHsv] = useState<Hsv>(() => toHsv(value));
	const [typed, setTyped] = useState<string | null>(null);
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
		<div className="x-color" style={{ '--_hue': h } as React.CSSProperties}>
			<div
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
	);
}

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
				<ColorPicker value={value} onChange={onChange} labels={labels} />
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
				<label htmlFor={id} id={`${id}-label`}>
					{label}
				</label>
				{description ? <small id={`${id}-d`}>{description}</small> : null}
			</span>
			{children({ id, 'aria-describedby': description ? `${id}-d` : undefined })}
		</li>
	);
}
