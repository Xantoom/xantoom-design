import { type ReactElement, type ReactNode } from 'react';
/** A picture, or the name's initials on the theme fill when there is none or it fails to load. */
export declare function Avatar({ src, name, size, shape, className, }: {
    src?: string | null;
    /** Used for the initials and as the picture's text. */
    name: string;
    /** `sm`, `lg`, or a CSS length. */
    size?: 'sm' | 'lg' | (string & {});
    /** `tile`: the app-icon corner. */
    shape?: 'tile';
    className?: string;
}): ReactElement;
declare const FLAGS: {
    readonly fr: {
        readonly box: '0 0 3 2';
        readonly body: import("react").JSX.Element;
    };
    readonly de: {
        readonly box: '0 0 5 3';
        readonly body: import("react").JSX.Element;
    };
    readonly it: {
        readonly box: '0 0 3 2';
        readonly body: import("react").JSX.Element;
    };
    readonly es: {
        readonly box: '0 0 3 2';
        readonly body: import("react").JSX.Element;
    };
    readonly gb: {
        readonly box: '0 0 60 30';
        readonly body: import("react").JSX.Element;
    };
};
export type FlagCode = keyof typeof FLAGS;
/** A country's flag, drawn (Windows shows flag emojis as two letters). It always sits next to the language's name. */
export declare function Flag({ code, className }: {
    code: FlagCode;
    className?: string;
}): ReactElement;
/** A spinner, named for screen readers. Show it after about 200 ms, for at least about 400 ms. */
export declare function Spinner({ label, size }: {
    label: string;
    size?: 'sm' | 'lg';
}): ReactElement;
/** The page's toast region, for `toast()`. One per page. */
export declare function Toaster({ label, closeLabel }: {
    label: string;
    closeLabel: string;
}): ReactElement;
/** The colour scheme switch (system, light, dark), on `xantoom-design/theme.js`. Call `applyTheme()` before paint. */
export declare function ThemeCycle({ labels, icons, onChange, className, }: {
    /** The button's name in each state, e.g. "Theme: system. Switch to light". */
    labels: Record<'system' | 'light' | 'dark', string>;
    /** One <svg> per state, in the order of the cycle. */
    icons: Record<'system' | 'light' | 'dark', ReactElement<Record<string, unknown>>>;
    onChange?: (choice: 'system' | 'light' | 'dark') => void;
    className?: string;
}): ReactElement;
export interface Option<T extends string> {
    value: T;
    label: string;
    /** Shown instead of the label, which stays its accessible name. */
    icon?: ReactNode;
}
/** One choice among a few that stay visible (a view, an alignment): radios joined into one control. */
export declare function Options<T extends string>({ legend, name, value, options, onChange, className, }: {
    legend: string;
    name: string;
    value: T;
    options: readonly Option<T>[];
    onChange: (value: T) => void;
    className?: string;
}): ReactElement;
export {};
