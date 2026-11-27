import { closeTopLayer, enhance } from 'xantoom-design/js';
import { CloseProvider } from './popover';
import { createContext, type ReactElement, type ReactNode, useCallback, useContext, useId, useState } from 'react';

/** What the menu's button must carry: it opens the menu, and says so. */
export interface MenuTriggerProps {
	popovertarget: string;
	'aria-haspopup': 'menu';
	'aria-expanded': boolean;
}

const MenuContext = createContext<HTMLElement | null>(null);

/**
 * A short list of actions or choices in a popover, anchored to its button: Escape, a click outside and a choice close
 * it, arrow keys, Home and End move through it (xantoom.js), and focus returns to the button.
 */
export function Menu({
	trigger,
	label,
	children,
	className,
}: {
	/** The button; spread the props on it. */
	trigger: (props: MenuTriggerProps) => ReactNode;
	/** The menu's accessible name. */
	label: string;
	children: ReactNode;
	/** Size only. Never a display (flex, grid): it would show the closed menu. */
	className?: string;
}): ReactElement {
	const id = useId();
	const [open, setOpen] = useState(false);
	const [panel, setPanel] = useState<HTMLElement | null>(null);
	const ref = useCallback((node: HTMLDivElement | null) => {
		setPanel(node);
		if (node) enhance(node);
	}, []);
	return (
		<>
			{trigger({ popovertarget: id, 'aria-haspopup': 'menu', 'aria-expanded': open })}
			<div
				ref={ref}
				id={id}
				className={className ? `x-menu ${className}` : 'x-menu'}
				popover="auto"
				role="menu"
				aria-label={label}
				onToggle={(event) => {
					setOpen((event.nativeEvent as ToggleEvent).newState === 'open');
				}}
			>
				<MenuContext value={panel}>
					<CloseProvider element={panel}>{children}</CloseProvider>
				</MenuContext>
			</div>
		</>
	);
}

export interface MenuItemProps {
	icon?: ReactNode;
	children: ReactNode;
	onSelect?: () => void;
	/** One choice among several: `true` marks it current (a check), `false` an other choice. */
	checked?: boolean;
	tone?: 'danger';
	/** A shortcut shown at the end (not wired). */
	shortcut?: ReactNode;
	/** A link instead of an action. */
	href?: string;
	/** Where the link opens (`_blank`: a new tab, with `rel="noopener"`). */
	target?: string;
	download?: boolean | string;
	disabled?: boolean;
}

export function MenuItem({ icon, children, onSelect, checked, tone, shortcut, href, target, download, disabled }: MenuItemProps): ReactElement {
	const menu = useContext(MenuContext);
	const choose = () => {
		if (menu) void closeTopLayer(menu);
		onSelect?.();
	};
	const content = (
		<>
			{icon}
			<span className="x-truncate">{children}</span>
			{shortcut ? <kbd className="x-kbd">{shortcut}</kbd> : null}
		</>
	);
	if (href)
		return (
			<a
				className="x-menu-item"
				role="menuitem"
				tabIndex={-1}
				href={href}
				target={target}
				rel={target === '_blank' ? 'noopener' : undefined}
				download={download}
				data-tone={tone}
				onClick={choose}
			>
				{content}
			</a>
		);
	return (
		<button
			className="x-menu-item"
			type="button"
			role={checked === undefined ? 'menuitem' : 'menuitemradio'}
			aria-checked={checked}
			tabIndex={-1}
			disabled={disabled}
			data-tone={tone}
			onClick={choose}
		>
			{content}
		</button>
	);
}

export function MenuLabel({ children }: { children: ReactNode }): ReactElement {
	return (
		<p className="x-menu-label" role="presentation">
			{children}
		</p>
	);
}

/** Choices of which one is current: a named group, so the set is announced. */
export function MenuGroup({ label, children }: { label: string; children: ReactNode }): ReactElement {
	return (
		<div role="group" aria-label={label}>
			{children}
		</div>
	);
}

export function MenuSeparator(): ReactElement {
	return <hr className="x-menu-separator" />;
}
