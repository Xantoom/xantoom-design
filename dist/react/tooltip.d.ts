import { type ReactElement } from 'react';
/**
 * A hint on mouse hover and keyboard focus, in every browser (xantoom.js `data-tip`: one shared tooltip, placed above
 * its trigger or under it). It names a trigger that has no name, and describes one whose name says something else. On
 * touch, a tap shows it on anything but a control (a button, a link, a field): never put needed information only here.
 */
export declare function Tooltip({ content, sub, img, poster, children, }: {
    content: string;
    /** A second line, quieter (a shortcut, a detail). */
    sub?: string;
    /** A picture above the text, whole (an icon, a flag): its URL. */
    img?: string;
    /** A 3:4 cover above the text (a poster, a book): its URL. */
    poster?: string;
    children: ReactElement<Record<string, unknown>>;
}): ReactElement;
