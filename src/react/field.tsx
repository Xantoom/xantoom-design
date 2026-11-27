import type { InputHTMLAttributes, ReactElement, ReactNode, Ref, TextareaHTMLAttributes } from 'react';
import { useId } from 'react';

/** What the control of a field must carry: its id, its description and whether it is invalid. */
export interface ControlProps {
	id: string;
	'aria-describedby': string | undefined;
	'aria-invalid': true | undefined;
	required: boolean | undefined;
}

export interface FieldProps {
	label: ReactNode;
	/** Help under the control. */
	hint?: ReactNode;
	/** The error, shown under the control and announced with it; the control turns red. */
	error?: ReactNode;
	required?: boolean;
	className?: string;
	/** The control, given the attributes that tie it to its label, hint and error. */
	children: (control: ControlProps) => ReactNode;
}

/** A label, a control, a hint and an error, tied together. */
export function Field({ label, hint, error, required, className, children }: FieldProps): ReactElement {
	const id = useId();
	const hintId = hint ? `${id}-hint` : undefined;
	const errorId = error ? `${id}-error` : undefined;
	const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;
	return (
		<div className={className ? `x-field ${className}` : 'x-field'}>
			<label className="x-label" htmlFor={id} id={`${id}-label`}>
				{label}
			</label>
			{children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined, required })}
			{hint ? (
				<p className="x-hint" id={hintId}>
					{hint}
				</p>
			) : null}
			{error ? (
				<p className="x-error" id={errorId}>
					{error}
				</p>
			) : null}
		</div>
	);
}

type FieldText = Pick<FieldProps, 'label' | 'hint' | 'error' | 'className'>;

/** A one-line text field. */
export function TextField({
	label,
	hint,
	error,
	className,
	required,
	ref,
	...input
}: FieldText & InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> }): ReactElement {
	return (
		<Field label={label} hint={hint} error={error} className={className} required={required}>
			{(control) => <input ref={ref} className="x-input" {...input} {...control} />}
		</Field>
	);
}

/** A text area that grows with its content. */
export function TextArea({
	label,
	hint,
	error,
	className,
	required,
	ref,
	...area
}: FieldText & TextareaHTMLAttributes<HTMLTextAreaElement> & { ref?: Ref<HTMLTextAreaElement> }): ReactElement {
	return (
		<Field label={label} hint={hint} error={error} className={className} required={required}>
			{(control) => <textarea ref={ref} className="x-input" {...area} {...control} />}
		</Field>
	);
}
