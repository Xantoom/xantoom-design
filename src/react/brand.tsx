import { brand, type BrandName } from 'xantoom-design/brand';
import { type ReactElement, useId } from 'react';

/** An app's logo, inline (its gradient ids made unique). Decorative beside the app's name; give `label` when alone. */
export function Brand({ name, size = 32, label, className }: { name: BrandName; size?: number; label?: string; className?: string }): ReactElement {
	// useId keeps server and client markup equal; ids may hold only letters, digits, - and _.
	const id = useId().replaceAll(/[^\w-]/g, '');
	return (
		<span
			className={className}
			style={{ display: 'inline-flex', lineHeight: 0 }}
			// The markup is the design system's own logo files, not user input.
			dangerouslySetInnerHTML={{ __html: brand(name, { size, label, id }) }}
		/>
	);
}
