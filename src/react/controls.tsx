import { Field, type FieldProps } from './field';
import {
	type InputHTMLAttributes,
	type KeyboardEvent,
	type PointerEvent,
	type ReactElement,
	type ReactNode,
	type Ref,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

const ICON = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentcolor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

/** On or off, applied at once (a setting): the native checkbox drawn as a switch, its label beside it. */
export function Switch({
	label,
	checked,
	onChange,
	className,
	...input
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'onChange' | 'role'> & {
	label: ReactNode;
	checked: boolean;
	onChange: (checked: boolean) => void;
}): ReactElement {
	return (
		<label className={className ? `x-check ${className}` : 'x-check'}>
			<input
				{...input}
				type="checkbox"
				// `switch` gives the native switch semantics where it exists (Safari); the role covers the rest.
				{...({ switch: '' } as object)}
				role="switch"
				className="x-switch"
				checked={checked}
				onChange={(event) => onChange(event.currentTarget.checked)}
			/>
			{label}
		</label>
	);
}

/** The decimal and grouping characters of a locale, to read back what it writes. */
function separators(locale?: string): { decimal: string; group: string } {
	const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
	return {
		decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.',
		group: parts.find((p) => p.type === 'group')?.value ?? ',',
	};
}

const decimalsOf = (step: number): number => (String(step).split('.')[1] ?? '').length;

export interface NumberFieldProps extends Pick<FieldProps, 'label' | 'hint' | 'error' | 'required' | 'className'> {
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	/** The arrows' and the drag's increment (default 1); Shift moves ten. */
	step?: number;
	/** Shown after the value (GB, %, px), and read with it. */
	unit?: string;
	/** How the value shows when the field is not being typed in (Intl.NumberFormat options). */
	format?: Intl.NumberFormatOptions;
	locale?: string;
	disabled?: boolean;
	name?: string;
	ref?: Ref<HTMLInputElement>;
}

/**
 * A number: typed freely (checked against the limits when the field is left or on Enter), dragged sideways from the
 * grip, stepped with the arrow keys, Page Up and Down (ten steps), Home and End, or the two small arrows.
 */
export function NumberField({
	label,
	hint,
	error,
	required,
	className,
	value,
	onChange,
	min = Number.NEGATIVE_INFINITY,
	max = Number.POSITIVE_INFINITY,
	step = 1,
	unit,
	format,
	locale,
	disabled,
	name,
	ref,
}: NumberFieldProps): ReactElement {
	const [text, setText] = useState<string | null>(null);
	const [scrubbing, setScrubbing] = useState(false);
	const drag = useRef<{ x: number; from: number } | null>(null);
	const formatter = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: decimalsOf(step), ...format }), [locale, format, step]);
	const { decimal, group } = useMemo(() => separators(locale), [locale]);

	const fit = (next: number): number => Math.min(max, Math.max(min, Number(next.toFixed(decimalsOf(step)))));
	const set = (next: number): void => {
		const fitted = fit(next);
		if (fitted !== value) onChange(fitted);
	};
	const commit = (): void => {
		if (text === null) return;
		const raw = text.replaceAll(group, '').replaceAll(/\s/g, '').replace(decimal, '.').replace(',', '.');
		const parsed = Number(raw);
		if (raw !== '' && Number.isFinite(parsed)) set(parsed);
		setText(null);
	};
	const keys = (event: KeyboardEvent<HTMLInputElement>): void => {
		const big = event.shiftKey ? 10 : 1;
		const by: Record<string, number> = { ArrowUp: step * big, ArrowDown: -step * big, PageUp: step * 10, PageDown: -step * 10 };
		if (event.key === 'Enter') return commit();
		if (event.key === 'Escape' && text !== null) {
			event.preventDefault();
			return setText(null);
		}
		let next: number | undefined;
		if (event.key in by) next = value + (by[event.key] ?? 0);
		else if (event.key === 'Home' && Number.isFinite(min)) next = min;
		else if (event.key === 'End' && Number.isFinite(max)) next = max;
		if (next === undefined) return;
		event.preventDefault();
		setText(null);
		set(next);
	};

	// The grip: 4 px of drag per step (Shift: ten steps), from the value it started at.
	const press = (event: PointerEvent<HTMLSpanElement>): void => {
		if (disabled || event.button !== 0) return;
		event.preventDefault();
		event.currentTarget.setPointerCapture(event.pointerId);
		commit();
		drag.current = { x: event.clientX, from: value };
		setScrubbing(true);
	};
	const move = (event: PointerEvent<HTMLSpanElement>): void => {
		if (!drag.current) return;
		const rtl = getComputedStyle(event.currentTarget).direction === 'rtl' ? -1 : 1;
		const steps = Math.trunc(((event.clientX - drag.current.x) * rtl) / 4);
		set(drag.current.from + steps * step * (event.shiftKey ? 10 : 1));
	};
	const release = (): void => {
		drag.current = null;
		setScrubbing(false);
	};

	const shown = text ?? (Number.isFinite(value) ? formatter.format(value) : '');
	return (
		<Field label={label} hint={hint} error={error} required={required} className={className}>
			{(control) => (
				<div className="x-number" data-scrubbing={scrubbing ? '' : undefined}>
					<span className="x-number-scrub" aria-hidden="true" onPointerDown={press} onPointerMove={move} onPointerUp={release} onPointerCancel={release}>
						<svg {...ICON}>
							<path d="m8 7-5 5 5 5M16 7l5 5-5 5" />
						</svg>
					</span>
					<input
						{...control}
						ref={ref}
						name={name}
						type="text"
						inputMode={decimalsOf(step) > 0 || min < 0 ? 'decimal' : 'numeric'}
						role="spinbutton"
						autoComplete="off"
						disabled={disabled}
						aria-valuenow={Number.isFinite(value) ? value : undefined}
						aria-valuemin={Number.isFinite(min) ? min : undefined}
						aria-valuemax={Number.isFinite(max) ? max : undefined}
						aria-valuetext={unit ? `${formatter.format(value)} ${unit}` : undefined}
						value={shown}
						onChange={(event) => setText(event.target.value)}
						onBlur={commit}
						onKeyDown={keys}
					/>
					{unit ? <span className="x-number-unit">{unit}</span> : null}
					<span className="x-number-steps" aria-hidden="true">
						<button type="button" tabIndex={-1} data-step="up" disabled={disabled || value >= max} onClick={() => set(value + step)} />
						<button type="button" tabIndex={-1} data-step="down" disabled={disabled || value <= min} onClick={() => set(value - step)} />
					</span>
				</div>
			)}
		</Field>
	);
}

const editable = (target: EventTarget | null): boolean =>
	target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

/**
 * A search box: its icon, the shortcut that focuses it while it is empty (a single key such as "/"), then a button
 * that clears it. Escape clears it too.
 */
export function SearchField({
	label,
	value,
	onChange,
	shortcut,
	clearLabel,
	className,
	placeholder,
	ref,
	...input
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> & {
	/** The field's accessible name (it has no visible label). */
	label: string;
	value: string;
	onChange: (value: string) => void;
	shortcut?: string;
	clearLabel: string;
	ref?: Ref<HTMLInputElement>;
}): ReactElement {
	const own = useRef<HTMLInputElement | null>(null);
	useEffect(() => {
		if (!shortcut) return;
		const listen = (event: globalThis.KeyboardEvent): void => {
			if (event.key !== shortcut || event.ctrlKey || event.metaKey || event.altKey || editable(event.target)) return;
			event.preventDefault();
			own.current?.focus();
		};
		document.addEventListener('keydown', listen);
		return () => document.removeEventListener('keydown', listen);
	}, [shortcut]);
	return (
		<div className={className ? `x-search ${className}` : 'x-search'}>
			<svg {...ICON}>
				<circle cx="11" cy="11" r="7" />
				<path d="m20 20-3.5-3.5" />
			</svg>
			<input
				{...input}
				ref={(node) => {
					own.current = node;
					if (typeof ref === 'function') ref(node);
					else if (ref) ref.current = node;
				}}
				className="x-input"
				type="search"
				aria-label={label}
				placeholder={placeholder ?? ' '}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				onKeyDown={(event) => {
					input.onKeyDown?.(event);
					// Cleared first; a second Escape reaches what holds the field (a dialog, a popover).
					if (event.key === 'Escape' && value) {
						event.preventDefault();
						event.stopPropagation();
						onChange('');
					}
				}}
			/>
			{shortcut ? <kbd className="x-kbd" aria-hidden="true">{shortcut}</kbd> : null}
			<button
				type="button"
				aria-label={clearLabel}
				onClick={() => {
					onChange('');
					own.current?.focus();
				}}
			>
				<svg {...ICON}>
					<path d="M18 6 6 18M6 6l12 12" />
				</svg>
			</button>
		</div>
	);
}

interface FileOptions {
	/** File types, as the input's `accept` ("image/*", ".srt,.vtt"). */
	accept?: string;
	multiple?: boolean;
	/** The chosen files (never an empty list). */
	onFiles: (files: File[]) => void;
}

/** A hidden file input that any button opens: `{(pick) => <Button onClick={pick}>Import</Button>}`. */
export function FilePicker({ accept, multiple, onFiles, children }: FileOptions & { children: (pick: () => void) => ReactNode }): ReactElement {
	const input = useRef<HTMLInputElement>(null);
	return (
		<>
			{children(() => input.current?.click())}
			<FileInput ref={input} accept={accept} multiple={multiple} onFiles={onFiles} hidden />
		</>
	);
}

function FileInput({ onFiles, ...props }: FileOptions & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { ref?: Ref<HTMLInputElement> }): ReactElement {
	return (
		<input
			{...props}
			type="file"
			onChange={(event) => {
				const files = [...(event.currentTarget.files ?? [])];
				// Cleared, so choosing the same file again fires again.
				event.currentTarget.value = '';
				if (files.length > 0) onFiles(files);
			}}
		/>
	);
}

/** A drop zone that is also a button: drop files on it, or press it to choose them. */
export function DropZone({
	title,
	hint,
	detail,
	icon,
	className,
	...options
}: FileOptions & { title: ReactNode; hint?: ReactNode; detail?: ReactNode; icon?: ReactNode; className?: string }): ReactElement {
	const [over, setOver] = useState(false);
	return (
		<label
			className={className ? `x-dropzone ${className}` : 'x-dropzone'}
			data-drag={over ? '' : undefined}
			onDragOver={(event) => {
				event.preventDefault();
				setOver(true);
			}}
			onDragLeave={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOver(false);
			}}
			onDrop={(event) => {
				event.preventDefault();
				setOver(false);
				const files = [...event.dataTransfer.files];
				if (files.length > 0) options.onFiles(multiple(options) ? files : files.slice(0, 1));
			}}
		>
			{icon}
			<strong>{title}</strong>
			{hint ? <span>{hint}</span> : null}
			{detail ? <small>{detail}</small> : null}
			<FileInput {...options} className="x-visually-hidden" />
		</label>
	);
}

const multiple = (options: FileOptions): boolean => options.multiple === true;
