// xantoom-design/react: thin components that put the design system's classes on native elements. The CSS draws
// them; React adds only behaviour (ids, popovers, showModal, busy state), through xantoom.js where it has it.
export { Button, IconButton, buttonProps, type ButtonProps, type ButtonSize, type ButtonVariant, type IconButtonProps } from './button';
export { Avatar, Flag, Options, Spinner, ThemeCycle, Toaster, type FlagCode, type Option } from './content';
export { Brand } from './brand';
export { DropZone, FilePicker, NumberField, SearchField, Switch, type NumberFieldProps } from './controls';
export { CommandPalette, type CommandGroup, type CommandItem, type CommandPaletteProps } from './command';
export { Dialog, useModal, type DialogProps } from './dialog';
export { Field, TextArea, TextField, type ControlProps, type FieldProps } from './field';
export { Menu, MenuGroup, MenuItem, MenuLabel, MenuSeparator, type MenuItemProps, type MenuTriggerProps } from './menu';
export { CloseProvider, Popover, useClose, type PopoverTriggerProps } from './popover';
export { Tooltip } from './tooltip';
export { toast } from 'xantoom-design/js';

// HTML attributes React passes through but its types do not know yet.
declare module 'react' {
	interface HTMLAttributes<T> {
		/** Interest invokers: shows the popover `id` on hover and focus. */
		interestfor?: string;
	}
	interface ButtonHTMLAttributes<T> {
		/** The popover this button toggles (React 19 renders `popoverTarget` under that very name). */
		popovertarget?: string;
	}
	interface DialogHTMLAttributes<T> {
		/** Which user actions close the dialog: `any` adds a click outside. */
		closedby?: 'any' | 'closerequest' | 'none';
	}
}
