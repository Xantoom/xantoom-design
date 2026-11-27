import { type FieldProps } from './field';
import { type InputHTMLAttributes, type ReactElement, type ReactNode, type Ref } from 'react';
/** On or off, applied at once (a setting): the native checkbox drawn as a switch, its label beside it. */
export declare function Switch({ label, checked, onChange, className, ...input }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'onChange' | 'role'> & {
    /** Without it, the bare switch: named by `aria-label`, or by a SettingRow's label through its `id`. */
    label?: ReactNode;
    checked: boolean;
    onChange: (checked: boolean) => void;
}): ReactElement;
export interface NumberFieldProps extends Partial<Pick<FieldProps, 'label' | 'hint' | 'error' | 'required' | 'className'>> {
    /** Without `label`, the bare control: named by these (a SettingRow passes `id` and `aria-describedby`). */
    id?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    /** The arrows' and the drag's increment (default 1); Shift moves ten. */
    step?: number;
    /** Shown after the value (GB, %, px), and read with it. */
    unit?: string;
    /** How the value shows when the field is not being typed in (Intl.NumberFormat options). */
    format?: Intl.NumberFormatOptions;
    locale?: string;
    disabled?: boolean;
    name?: string;
    ref?: Ref<HTMLInputElement>;
}
/**
 * A number: typed freely (checked against the limits when the field is left or on Enter), dragged sideways from the
 * grip, stepped with the arrow keys, Page Up and Down (ten steps), Home and End, or the two small arrows.
 */
export declare function NumberField({ format, locale, step, ...props }: NumberFieldProps): ReactElement;
/**
 * A duration in seconds, shown m:ss.cc: the grip, arrows and keys of NumberField (a tenth of a second by default,
 * Shift ten times that), and free typing ("2:30", "150.5" or "150,5").
 */
export declare function DurationField({ locale, step, min, ...props }: Omit<NumberFieldProps, 'format' | 'unit'>): ReactElement;
/**
 * A search box: its icon, the shortcut that focuses it while it is empty (a single key such as "/"), then a button
 * that clears it. Escape clears it too.
 */
export declare function SearchField({ label, value, onChange, shortcut, clearLabel, className, placeholder, ref, ...input }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> & {
    /** The field's accessible name (it has no visible label). */
    label: string;
    value: string;
    onChange: (value: string) => void;
    shortcut?: string;
    clearLabel: string;
    ref?: Ref<HTMLInputElement>;
}): ReactElement;
interface FileOptions {
    /** File types, as the input's `accept` ("image/*", ".srt,.vtt"). */
    accept?: string;
    multiple?: boolean;
    /** The chosen files (never an empty list). */
    onFiles: (files: File[]) => void;
}
/** A hidden file input that any button opens: `{(pick) => <Button onClick={pick}>Import</Button>}`. */
export declare function FilePicker({ accept, multiple, onFiles, children }: FileOptions & {
    children: (pick: () => void) => ReactNode;
}): ReactElement;
/** A drop zone that is also a button: drop files on it, or press it to choose them. */
export declare function DropZone({ title, hint, detail, icon, className, ...options }: FileOptions & {
    title: ReactNode;
    hint?: ReactNode;
    detail?: ReactNode;
    icon?: ReactNode;
    className?: string;
}): ReactElement;
export {};
