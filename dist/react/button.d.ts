import type { ButtonHTMLAttributes, ReactElement, ReactNode, Ref } from 'react';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    /** Full width. */
    block?: boolean;
    /**
     * Working: a spinner before the kept label, and no second press. It keeps the keyboard focus, unlike `disabled`,
     * and the label stays the button's name.
     */
    busy?: boolean;
    ref?: Ref<HTMLButtonElement>;
}
/** The attributes that give any element (a link that looks like a button) the button's look. */
export declare function buttonProps({ variant, size, block }?: Pick<ButtonProps, 'variant' | 'size' | 'block'>): {
    className: string;
    'data-variant': "danger" | "ghost" | "primary" | undefined;
    'data-size': "lg" | "sm" | undefined;
    'data-block': string | undefined;
};
export declare function Button({ variant, size, block, busy, type, className, onClick, ...props }: ButtonProps): ReactElement;
export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'block'> {
    /** The accessible name, also shown as a tooltip (`tooltip={false}` to show none). */
    label: string;
    tooltip?: boolean | ReactNode;
    /** The icon, `aria-hidden`. */
    children: ReactNode;
}
/** A square button holding one icon: named by `label`, which its tooltip repeats. */
export declare function IconButton({ label, tooltip, variant, ...props }: IconButtonProps): ReactElement;
