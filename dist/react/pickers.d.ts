import { type CSSProperties, type ReactElement, type ReactNode } from 'react';
import { type FieldProps } from './field';
type FieldText = Pick<FieldProps, 'label' | 'hint' | 'error' | 'required' | 'className'>;
export interface Choice<T extends string> {
    value: T;
    label: string;
    /** A second line under the label. */
    detail?: string;
    /** Before the label, in the list and on the button: an icon, or an <img> (a flag, a cover). */
    icon?: ReactNode;
    disabled?: boolean;
    /** Why it is disabled: a lock, and this in its tooltip. */
    reason?: string;
    /** The heading it shows under (Select); options of one group follow each other. */
    group?: string;
    /** The label's own style, e.g. a font shown in that font. */
    style?: CSSProperties;
}
type Named = {
    /** The button's id (a SettingRow's control id): its label is the element `${id}-label`. */
    id?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: true;
};
export interface SelectProps<T extends string> extends Partial<FieldText>, Named {
    value: T;
    onChange: (value: T) => void;
    options: readonly Choice<T>[];
    /** `inline`: a value in a row of properties, framed on hover and while open. `ghost`: muted, in a toolbar. */
    variant?: 'field' | 'inline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    /** Before the choice on the button: what the select changes (a sort icon). */
    icon?: ReactNode;
    /** Only the chevron shows: the choice is read elsewhere. */
    bare?: boolean;
    /** A search over the list, once it holds 12 options or more: its label, and what shows when nothing matches. */
    search?: {
        label: string;
        empty: ReactNode;
    };
    /** How many options show before the list scrolls. */
    rows?: number;
    /** Submitted with a form, in a hidden input. */
    name?: string;
    disabled?: boolean;
}
/**
 * One choice from a list, drawn the same in every browser: a button showing the choice, a listbox in a popover (in the
 * top layer, so over a modal too). Options take an icon or a picture, a second line, a group heading, a disabled
 * state with its reason. The arrow keys, Home, End and typing move through the list; Enter, Space or Tab take the
 * active option; Escape closes it. From 12 options, with `search`, a field filters the list.
 * With `label`, it is a field (label, hint, error); without, `aria-label`, `aria-labelledby` or `id` names it.
 */
export declare function Select<T extends string>({ label, hint, error, required, className, ...props }: SelectProps<T>): ReactElement;
/**
 * A search that picks one choice from a long list (a type, a place, a language): typing filters it, the arrow keys
 * move through it, Enter or Tab takes the active one, Escape closes it. The focus stays in the field.
 */
export declare function Combobox<T extends string>({ value, onChange, options, placeholder, empty, rows, name, disabled, ...field }: FieldText & {
    /** The chosen value, or null when none is. */
    value: T | null;
    onChange: (value: T) => void;
    options: readonly Choice<T>[];
    placeholder?: string;
    /** Shown when nothing matches what is typed. */
    empty: ReactNode;
    /** How many options show before the list scrolls. */
    rows?: number;
    name?: string;
    disabled?: boolean;
}): ReactElement;
/**
 * A colour: a button showing it, opening a picker (saturation and brightness on a plane, the arrow keys there too;
 * the hue on a bar; the hex code to type or paste). `value` and `onChange` use "#rrggbb".
 */
export declare function ColorField({ label, value, onChange, labels, className, }: {
    label: string;
    value: string;
    onChange: (hex: string) => void;
    /** The picker's parts, for assistive technology: the plane, the hue bar, the hex field. */
    labels: {
        plane: string;
        hue: string;
        hex: string;
    };
    className?: string;
}): ReactElement;
/**
 * A list of settings in one frame: <Settings title="Recording">{rows}</Settings>. Each row is a SettingRow; its control
 * sits at the end, and moves under the label when the frame is narrow.
 */
export declare function Settings({ title, level, children, className }: {
    title: ReactNode;
    level?: 2 | 3 | 4;
    children: ReactNode;
    className?: string;
}): ReactElement;
/** One setting: its label, what it does, and its control (given the id and description it must carry). */
export declare function SettingRow({ label, description, children, }: {
    label: ReactNode;
    description?: ReactNode;
    children: (control: {
        id: string;
        'aria-describedby': string | undefined;
    }) => ReactNode;
}): ReactElement;
export {};
