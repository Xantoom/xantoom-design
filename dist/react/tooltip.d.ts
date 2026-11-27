import { type ReactElement, type ReactNode } from 'react';
/**
 * A hint shown on hover and focus, through `interestfor` and `popover="hint"` where the browser has them (elsewhere
 * nothing shows, so never put needed information only here). The trigger keeps its own accessible name: when the
 * tooltip says something else, it describes the trigger.
 */
export declare function Tooltip({ content, children }: {
    content: ReactNode;
    children: ReactElement<Record<string, unknown>>;
}): ReactElement;
