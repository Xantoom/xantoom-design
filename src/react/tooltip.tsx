import { tooltips } from 'xantoom-design/js';
import { cloneElement, type ReactElement, useEffect } from 'react';

/**
 * A hint on mouse hover and keyboard focus, in every browser (xantoom.js `data-tip`: one shared tooltip, placed above
 * its trigger or under it). It names a trigger that has no name, and describes one whose name says something else;
 * touch screens never show it, so never put needed information only here.
 */
export function Tooltip({
	content,
	sub,
	children,
}: {
	content: string;
	/** A second line, quieter (a shortcut, a detail). */
	sub?: string;
	children: ReactElement<Record<string, unknown>>;
}): ReactElement {
	useEffect(() => tooltips(), []);
	return cloneElement(children, { 'data-tip': content, 'data-tip-sub': sub });
}
