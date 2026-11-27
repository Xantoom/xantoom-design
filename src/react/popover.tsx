import { closeTopLayer, enhance } from 'xantoom-design/js';
import {
	createContext,
	type ReactElement,
	type ReactNode,
	useCallback,
	useContext,
	useId,
	useLayoutEffect,
	useState,
} from 'react';

const CloseContext = createContext<() => void>(() => undefined);

/** Closes the popover, menu or dialog around the caller (a form inside it, a "Done" button). */
export function useClose(): () => void {
	return useContext(CloseContext);
}

/** Provides `useClose()` for what a top-layer element holds. */
export function CloseProvider({ element, children }: { element: HTMLElement | null; children: ReactNode }): ReactElement {
	const close = useCallback(() => {
		if (element) void closeTopLayer(element);
	}, [element]);
	return <CloseContext value={close}>{children}</CloseContext>;
}

/** What a popover's button must carry: it opens the popover, and says whether it is open. */
export interface PopoverTriggerProps {
	popoverTarget: string;
	'aria-expanded': boolean;
}

/**
 * A panel anchored to its button (filters, notifications, a small form): Escape and a click outside close it, focus
 * returns to the button. Controlled with `open` and `onOpenChange`, or left to the browser.
 */
export function Popover({
	trigger,
	label,
	children,
	open,
	onOpenChange,
	className,
}: {
	/** The button; spread the props on it. */
	trigger: (props: PopoverTriggerProps) => ReactNode;
	/** The panel's accessible name. */
	label: string;
	children: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** Size and padding. Never a display (flex, grid): it would show the closed panel; lay out an inner element. */
	className?: string;
}): ReactElement {
	const id = useId();
	const [shown, setShown] = useState(false);
	const [panel, setPanel] = useState<HTMLElement | null>(null);
	const ref = useCallback((node: HTMLDivElement | null) => {
		setPanel(node);
		if (node) enhance(node);
	}, []);

	useLayoutEffect(() => {
		if (!panel || open === undefined) return;
		// Opened from code: anchored to its button all the same.
		const source = document.querySelector<HTMLElement>(`[popovertarget="${CSS.escape(id)}"]`) ?? undefined;
		if (open && !panel.matches(':popover-open')) panel.showPopover({ source });
		else if (!open && panel.matches(':popover-open')) void closeTopLayer(panel);
	}, [open, panel, id]);

	return (
		<>
			{trigger({ popoverTarget: id, 'aria-expanded': shown })}
			<div
				ref={ref}
				id={id}
				className={className ? `x-popover ${className}` : 'x-popover'}
				popover="auto"
				role="dialog"
				aria-label={label}
				onToggle={(event) => {
					const now = (event.nativeEvent as ToggleEvent).newState === 'open';
					setShown(now);
					onOpenChange?.(now);
				}}
			>
				{/* Rendered only while open, so what it holds starts fresh each time. */}
				{shown ? <CloseProvider element={panel}>{children}</CloseProvider> : null}
			</div>
		</>
	);
}
