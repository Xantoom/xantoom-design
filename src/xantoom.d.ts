/** Closes a dialog or hides a popover with its exit transition, in every browser. */
export function closeTopLayer(element: HTMLElement, returnValue?: string): Promise<void>;
/** Focuses a dialog's `[autofocus]` element, else its first field, else its first action. */
export function focusInitial(dialog: HTMLDialogElement): void;
/** Shows a toast in the page's `.x-toaster` region (over an open modal too) and announces it; persistent unless `timeout` (ms) is given. */
export function toast(
	message: string,
	options?: { tone?: 'success' | 'warning' | 'danger' | 'info'; timeout?: number; closeLabel?: string },
): { dismiss(): void };
/** Wires every component under `root`, and `root` itself (idempotent: call it again after inserting content). */
export function enhance(root?: ParentNode): void;
/** Wires `data-tip` tooltips (and `data-tip-sub`, a second line) for the document, in every browser; `enhance()` calls it. */
export function tooltips(root?: ParentNode): void;
