import { themeCycle } from 'xantoom-design/theme.js';
import { cloneElement, type ReactElement, type ReactNode, useCallback, useState } from 'react';

/** Initials from a name: the first letter of its first two words. */
const initials = (name: string): string =>
	name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((word) => [...word][0] ?? '')
		.join('');

/** A stable hue (0–359) from an id: the same person keeps one colour on every screen (avatar, cursor, comments). */
export function hueOf(seed: string): number {
	let hash = 0;
	for (const char of seed) hash = (Math.imul(hash, 31) + (char.codePointAt(0) ?? 0)) >>> 0;
	return hash % 360;
}

/**
 * A picture, or the name's initials when there is none or it fails to load: on the theme fill, or with `seed` (the
 * person's id) on a colour of their own.
 */
export function Avatar({
	src,
	name,
	size,
	shape,
	seed,
	className,
}: {
	src?: string | null;
	/** Used for the initials and as the picture's text. */
	name: string;
	/** `sm`, `lg`, or a CSS length. */
	size?: 'sm' | 'lg' | (string & {});
	/** `tile`: the app-icon corner. */
	shape?: 'tile';
	/** The person's id: their initials on a colour drawn from it, the same everywhere. */
	seed?: string;
	className?: string;
}): ReactElement {
	const [failed, setFailed] = useState<string | null>(null);
	const named = size === 'sm' || size === 'lg';
	const style = { ...(size && !named ? { '--_size': size } : {}), ...(seed === undefined ? {} : { '--x-hue': hueOf(seed) }) };
	return (
		<span
			className={className ? `x-avatar ${className}` : 'x-avatar'}
			data-size={named ? size : undefined}
			data-shape={shape}
			data-hue={seed === undefined ? undefined : ''}
			style={Object.keys(style).length > 0 ? (style as React.CSSProperties) : undefined}
			role={src && failed !== src ? undefined : 'img'}
			aria-label={src && failed !== src ? undefined : name}
		>
			{src && failed !== src ? (
				<img src={src} alt={name} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(src)} />
			) : (
				<span aria-hidden="true">{initials(name)}</span>
			)}
		</span>
	);
}

const FLAGS = {
	fr: { box: '0 0 3 2', body: <><rect width="1" height="2" fill="#002654" /><rect x="1" width="1" height="2" fill="#fff" /><rect x="2" width="1" height="2" fill="#ce1126" /></> },
	de: { box: '0 0 5 3', body: <><rect width="5" height="1" fill="#000" /><rect y="1" width="5" height="1" fill="#dd0000" /><rect y="2" width="5" height="1" fill="#ffce00" /></> },
	it: { box: '0 0 3 2', body: <><rect width="1" height="2" fill="#009246" /><rect x="1" width="1" height="2" fill="#fff" /><rect x="2" width="1" height="2" fill="#ce2b37" /></> },
	es: { box: '0 0 3 2', body: <><rect width="3" height="2" fill="#aa151b" /><rect y="0.5" width="3" height="1" fill="#f1bf00" /></> },
	gb: {
		box: '0 0 60 30',
		body: (
			<>
				<rect width="60" height="30" fill="#012169" />
				<path d="M0 0L60 30M60 0L0 30" stroke="#fff" strokeWidth="6" />
				<path d="M0 0L60 30M60 0L0 30" stroke="#c8102e" strokeWidth="2.4" />
				<path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
				<path d="M30 0v30M0 15h60" stroke="#c8102e" strokeWidth="6" />
			</>
		),
	},
} as const;

export type FlagCode = keyof typeof FLAGS;

/** A country's flag, drawn (Windows shows flag emojis as two letters). It always sits next to the language's name. */
export function Flag({ code, className }: { code: FlagCode; className?: string }): ReactElement {
	const flag = FLAGS[code];
	return (
		<svg className={className ? `x-flag ${className}` : 'x-flag'} viewBox={flag.box} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
			{flag.body}
		</svg>
	);
}

/** A spinner, named for screen readers. Show it after about 200 ms, for at least about 400 ms. */
export function Spinner({ label, size }: { label: string; size?: 'sm' | 'lg' }): ReactElement {
	return <span className="x-spinner" role="status" aria-label={label} data-size={size} />;
}

/** The page's toast region, for `toast()`. One per page. */
export function Toaster({ label, closeLabel }: { label: string; closeLabel: string }): ReactElement {
	return <section className="x-toaster" popover="manual" role="region" aria-label={label} data-close-label={closeLabel} />;
}

/** The colour scheme switch (system, light, dark), on `xantoom-design/theme.js`. Call `applyTheme()` before paint. */
export function ThemeCycle({
	labels,
	icons,
	onChange,
	className,
}: {
	/** The button's name in each state, e.g. "Theme: system. Switch to light". */
	labels: Record<'system' | 'light' | 'dark', string>;
	/** One <svg> per state, in the order of the cycle. */
	icons: Record<'system' | 'light' | 'dark', ReactElement<Record<string, unknown>>>;
	onChange?: (choice: 'system' | 'light' | 'dark') => void;
	className?: string;
}): ReactElement {
	const ref = useCallback((button: HTMLButtonElement | null) => (button ? themeCycle(button, { onChange }) : undefined), [onChange]);
	return (
		<button
			ref={ref}
			type="button"
			className={className ? `x-cycle ${className}` : 'x-cycle'}
			data-label-system={labels.system}
			data-label-light={labels.light}
			data-label-dark={labels.dark}
		>
			{(Object.keys(icons) as (keyof typeof icons)[]).map((state) =>
				cloneElement(icons[state], { key: state, 'data-v': state, 'aria-hidden': true }),
			)}
		</button>
	);
}

export interface Option<T extends string> {
	value: T;
	label: string;
	/** Shown instead of the label, which stays its accessible name. */
	icon?: ReactNode;
	/** Cannot be picked now: shown faded, skipped by the arrow keys. */
	disabled?: boolean;
}

/** One choice among a few that stay visible (a view, an alignment): radios joined into one control. */
export function Options<T extends string>({
	legend,
	name,
	value,
	options,
	onChange,
	className,
}: {
	legend: string;
	name: string;
	value: T;
	options: readonly Option<T>[];
	onChange: (value: T) => void;
	className?: string;
}): ReactElement {
	const icons = options.every((option) => option.icon);
	return (
		<fieldset className={className ? `x-options ${className}` : 'x-options'} data-icons={icons ? '' : undefined}>
			<legend>{legend}</legend>
			{options.map((option) => (
				<label key={option.value}>
					<input
						type="radio"
						name={name}
						value={option.value}
						checked={option.value === value}
						disabled={option.disabled}
						aria-label={icons ? option.label : undefined}
						onChange={() => onChange(option.value)}
					/>
					{icons ? option.icon : option.label}
				</label>
			))}
		</fieldset>
	);
}
