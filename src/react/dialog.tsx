import { closeTopLayer, enhance } from 'xantoom-design/js';
import { CloseProvider } from './popover';
import { type ReactElement, type ReactNode, type RefCallback, useCallback, useId, useLayoutEffect, useRef, useState } from 'react';

export interface DialogProps {
	open: boolean;
	/** Escape, a click outside, a `<form method="dialog">` button or `open` turning false closed it. */
	onClose: () => void;
	title: ReactNode;
	children?: ReactNode;
	/** The buttons at the bottom; the main one last. */
	actions?: ReactNode;
	/** A button in the corner, its accessible name. */
	closeLabel?: string;
	size?: 'lg';
	/** A side sheet. */
	variant?: 'sheet';
	className?: string;
}

/**
 * A modal on the native <dialog>: the browser traps focus, closes on Escape and on a click outside (`closedby`), and
 * returns focus to what opened it. A bottom sheet on phones. The content is rendered only while it is open (and
 * during its exit).
 */
export function Dialog({ open, onClose, title, children, actions, closeLabel, size, variant, className }: DialogProps): ReactElement {
	const titleId = useId();
	const { ref, element, shown, closed } = useModal(open, onClose);
	return (
		<dialog
			ref={ref}
			className={className ? `x-dialog ${className}` : 'x-dialog'}
			aria-labelledby={titleId}
			closedby="any"
			data-size={size}
			data-variant={variant}
			onClose={closed}
		>
			{shown ? (
				<CloseProvider element={element}>
					<h1 id={titleId}>{title}</h1>
					{closeLabel ? (
						<form method="dialog">
							<button className="x-button x-dialog-close" data-variant="ghost" data-icon="" aria-label={closeLabel}>
								<svg viewBox="0 0 24 24" aria-hidden="true">
									<path d="M18 6 6 18M6 6l12 12" fill="none" stroke="currentcolor" strokeWidth="2" strokeLinecap="round" />
								</svg>
							</button>
						</form>
					) : null}
					{children}
					{actions ? <div className="x-dialog-actions">{actions}</div> : null}
				</CloseProvider>
			) : null}
		</dialog>
	);
}

/**
 * A native modal <dialog> driven by `open`: shown with showModal(), closed with its exit, content kept only while it
 * shows. Spread `ref` and `onClose={closed}` on the dialog.
 */
export function useModal(
	open: boolean,
	onClose: () => void,
): { ref: RefCallback<HTMLDialogElement>; element: HTMLDialogElement | null; shown: boolean; closed: () => void } {
	const node = useRef<HTMLDialogElement | null>(null);
	const [shown, setShown] = useState(open);
	const [element, setElement] = useState<HTMLDialogElement | null>(null);
	if (open && !shown) setShown(true);
	const ref = useCallback((dialog: HTMLDialogElement | null) => {
		node.current = dialog;
		setElement(dialog);
		if (dialog) enhance(dialog);
	}, []);

	useLayoutEffect(() => {
		const dialog = node.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) void closeTopLayer(dialog);
	}, [open, shown]);

	// Removed while open (its parent went): close it first, so focus goes back where it was.
	useLayoutEffect(
		() => () => {
			if (node.current?.open) node.current.close();
		},
		[],
	);

	const closed = useCallback(() => {
		setShown(false);
		onClose();
	}, [onClose]);
	return { ref, element, shown, closed };
}
