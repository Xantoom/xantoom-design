import type { InputHTMLAttributes, ReactElement, ReactNode, Ref, TextareaHTMLAttributes } from 'react';
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
export declare function Field({ label, hint, error, required, className, children }: FieldProps): ReactElement;
type FieldText = Pick<FieldProps, 'label' | 'hint' | 'error' | 'className'>;
/** A one-line text field. */
export declare function TextField({ label, hint, error, className, required, ref, ...input }: FieldText & InputHTMLAttributes<HTMLInputElement> & {
    ref?: Ref<HTMLInputElement>;
}): ReactElement;
/** A text area that grows with its content. */
export declare function TextArea({ label, hint, error, className, required, ref, ...area }: FieldText & TextareaHTMLAttributes<HTMLTextAreaElement> & {
    ref?: Ref<HTMLTextAreaElement>;
}): ReactElement;
export {};
