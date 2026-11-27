import type { ButtonHTMLAttributes, ReactElement, ReactNode, Ref } from 'react';
import { Tooltip } from './tooltip';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	/** Full width. */
	block?: boolean;
	/**
	 * Working: a spinner before the kept label, and no second press. It keeps the keyboard focus, unlike `disabled`,
	 * and the label stays the button's name.
	 */
	busy?: boolean;
	ref?: Ref<HTMLButtonElement>;
}

/** The attributes that give any element (a link that looks like a button) the button's look. */
export function buttonProps({ variant, size, block }: Pick<ButtonProps, 'variant' | 'size' | 'block'> = {}) {
	return {
		className: 'x-button',
		'data-variant': variant === 'secondary' ? undefined : variant,
		'data-size': size === 'md' ? undefined : size,
		'data-block': block ? '' : undefined,
	};
}

export function Button({ variant, size, block, busy = false, type = 'button', className, onClick, ...props }: ButtonProps): ReactElement {
	const look = buttonProps({ variant, size, block });
	return (
		<button
			{...look}
			type={type}
			className={className ? `${look.className} ${className}` : look.className}
			aria-busy={busy || undefined}
			aria-disabled={busy || props['aria-disabled'] || undefined}
			onClick={busy ? undefined : onClick}
			{...props}
		/>
	);
}

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'block'> {
	/** The accessible name, also shown as a tooltip (`tooltip={false}` to show none). */
	label: string;
	tooltip?: boolean | ReactNode;
	/** A keyboard shortcut shown in the tooltip after the label, e.g. "Ctrl K". */
	shortcut?: ReactNode;
	/** The icon, `aria-hidden`. */
	children: ReactNode;
}

/** A square button holding one icon: named by `label`, which its tooltip repeats. */
export function IconButton({ label, tooltip = true, shortcut, variant = 'ghost', ...props }: IconButtonProps): ReactElement {
	const button = <Button variant={variant} data-icon="" aria-label={label} {...props} />;
	if (tooltip === false) return button;
	const content =
		tooltip !== true ? tooltip : shortcut ? (
			<>
				{label} <kbd className="x-kbd">{shortcut}</kbd>
			</>
		) : (
			label
		);
	return (
		<Tooltip content={content} describes={tooltip !== true}>
			{button}
		</Tooltip>
	);
}
