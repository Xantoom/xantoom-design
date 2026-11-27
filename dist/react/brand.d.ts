import { type BrandName } from 'xantoom-design/brand';
import { type ReactElement } from 'react';
/** An app's logo, inline (its gradient ids made unique). Decorative beside the app's name; give `label` when alone. */
export declare function Brand({ name, size, label, className }: {
    name: BrandName;
    size?: number;
    label?: string;
    className?: string;
}): ReactElement;
