import { type ReactElement, type ReactNode } from 'react';
/** What the menu's button must carry: it opens the menu, and says so. */
export interface MenuTriggerProps {
    popoverTarget: string;
    'aria-haspopup': 'menu';
    'aria-expanded': boolean;
}
/**
 * A short list of actions or choices in a popover, anchored to its button: Escape, a click outside and a choice close
 * it, arrow keys, Home and End move through it (xantoom.js), and focus returns to the button.
 */
export declare function Menu({ trigger, label, children, rows, className, }: {
    /** The button; spread the props on it. */
    trigger: (props: MenuTriggerProps) => ReactNode;
    /** The menu's accessible name. */
    label: string;
    children: ReactNode;
    /** Shows this many items and half the next, then scrolls. */
    rows?: number;
    /** Size only. Never a display (flex, grid): it would show the closed menu. */
    className?: string;
}): ReactElement;
export interface MenuItemProps {
    icon?: ReactNode;
    children: ReactNode;
    /** A second line under the label, muted (a count, a note). */
    description?: ReactNode;
    /** A short value at the end (a format, a size). */
    detail?: ReactNode;
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
export declare function MenuItem({ icon, children, description, detail, onSelect, checked, tone, shortcut, href, target, download, disabled, }: MenuItemProps): ReactElement;
export declare function MenuLabel({ children }: {
    children: ReactNode;
}): ReactElement;
/** Choices of which one is current: a named group, so the set is announced. */
export declare function MenuGroup({ label, children }: {
    label: string;
    children: ReactNode;
}): ReactElement;
export declare function MenuSeparator(): ReactElement;
