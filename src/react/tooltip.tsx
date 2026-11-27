import { cloneElement, type ReactElement, type ReactNode, useId } from 'react';

/**
 * A hint shown on hover and focus, through `interestfor` and `popover="hint"` where the browser has them (elsewhere
 * nothing shows, so never put needed information only here). The trigger keeps its own accessible name: when the
 * tooltip says something else, it describes the trigger.
 */
export function Tooltip({
	content,
	children,
	describes = typeof content !== 'string' || content !== children.props['aria-label'],
}: {
	content: ReactNode;
	/** Whether the tooltip adds to the trigger's name (`aria-describedby`); by default, when it says something else. */
	describes?: boolean;
	children: ReactElement<Record<string, unknown>>;
}): ReactElement {
	const id = useId();
	return (
		<>
			{cloneElement(children, {
				interestfor: id,
				...(describes ? { 'aria-describedby': id } : {}),
			})}
			<div className="x-tooltip" id={id} popover="hint" role={describes ? 'tooltip' : undefined}>
				{content}
			</div>
		</>
	);
}
