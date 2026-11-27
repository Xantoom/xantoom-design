import { type ReactElement, type ReactNode } from 'react';
/** Closes the popover, menu or dialog around the caller (a form inside it, a "Done" button). */
export declare function useClose(): () => void;
/** Provides `useClose()` for what a top-layer element holds. */
export declare function CloseProvider({ element, children }: {
    element: HTMLElement | null;
    children: ReactNode;
}): ReactElement;
/** What a popover's button must carry: it opens the popover, and says whether it is open. */
export interface PopoverTriggerProps {
    popovertarget: string;
    'aria-expanded': boolean;
}
/**
 * A panel anchored to its button (filters, notifications, a small form): Escape and a click outside close it, focus
 * returns to the button. Controlled with `open` and `onOpenChange`, or left to the browser.
 */
export declare function Popover({ trigger, label, children, open, onOpenChange, className, }: {
    /** The button; spread the props on it. */
    trigger: (props: PopoverTriggerProps) => ReactNode;
    /** The panel's accessible name. */
    label: string;
    children: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Size and padding. Never a display (flex, grid): it would show the closed panel; lay out an inner element. */
    className?: string;
}): ReactElement;
