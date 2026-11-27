import { type DialogHTMLAttributes, type ReactElement, type ReactNode, type RefCallback } from 'react';
type Passed = Omit<DialogHTMLAttributes<HTMLDialogElement>, 'open' | 'onClose' | 'title' | 'children' | 'className' | 'role'>;
export interface DialogProps extends Passed {
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
    /** A side sheet, or an alert: a narrow question that needs an answer (role="alertdialog", no click outside). */
    variant?: 'sheet' | 'alert';
    /** An icon beside the title, in the tone's colour. */
    icon?: ReactNode;
    tone?: 'accent' | 'success' | 'warning' | 'danger' | 'info';
    /** The sentence the dialog is about, under the title and announced with it. */
    description?: ReactNode;
    className?: string;
}
/**
 * A modal on the native <dialog>: the browser traps focus, closes on Escape and on a click outside (`closedby`), and
 * returns focus to what opened it. A bottom sheet on phones. The content is rendered only while it is open (and
 * during its exit).
 */
export declare function Dialog({ open, onClose, title, children, actions, closeLabel, size, variant, icon, tone, description, className, ...rest }: DialogProps): ReactElement;
/**
 * A native modal <dialog> driven by `open`: shown with showModal(), closed with its exit, content kept only while it
 * shows. Spread `ref` and `onClose={closed}` on the dialog.
 */
export declare function useModal(open: boolean, onClose: () => void): {
    ref: RefCallback<HTMLDialogElement>;
    element: HTMLDialogElement | null;
    shown: boolean;
    closed: () => void;
};
export {};
