import { type ReactElement, type ReactNode } from 'react';
import { type FieldProps } from './field';
type FieldText = Pick<FieldProps, 'label' | 'hint' | 'error' | 'required' | 'className'>;
export interface Choice<T extends string> {
    value: T;
    label: string;
    /** A second line under the label (Combobox). */
    detail?: string;
    disabled?: boolean;
}
/**
 * One choice from a list: the native <select>, drawn by the design system where `appearance: base-select` exists
 * (Chromium) and left to the platform's own list elsewhere, which keeps it usable everywhere, keyboard included.
 */
export declare function Select<T extends string>({ value, onChange, options, name, disabled, ...field }: FieldText & {
    value: T;
    onChange: (value: T) => void;
    options: readonly Choice<T>[];
    name?: string;
    disabled?: boolean;
}): ReactElement;
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
