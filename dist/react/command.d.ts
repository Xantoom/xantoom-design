import { type ReactElement, type ReactNode } from 'react';
export interface CommandItem {
    id: string;
    label: string;
    icon?: ReactNode;
    /** A second line under the label (a matching excerpt). */
    detail?: ReactNode;
    /** At the end of the row: a shortcut, a place. */
    hint?: ReactNode;
    /** Run once the palette has closed. */
    onSelect: () => void;
}
export interface CommandGroup {
    id: string;
    label: string;
    items: readonly CommandItem[];
}
export interface CommandPaletteProps {
    open: boolean;
    onClose: () => void;
    /** The palette's accessible name, and its search's. */
    label: string;
    placeholder?: string;
    query: string;
    onQueryChange: (query: string) => void;
    /** Already filtered by the app; empty groups are left out. */
    groups: readonly CommandGroup[];
    /** Shown when no group has an item. */
    empty: ReactNode;
    footer?: ReactNode;
}
/**
 * Search and run (Ctrl/⌘ K): a modal with a search that keeps the focus and a list the arrow keys move through. The app
 * filters; Enter or a click closes the palette and runs the item.
 */
export declare function CommandPalette({ open, onClose, label, placeholder, query, onQueryChange, groups, empty, footer, }: CommandPaletteProps): ReactElement;
