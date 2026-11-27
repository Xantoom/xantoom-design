/** Closes a dialog or hides a popover with its exit transition, in every browser. */
export function closeTopLayer(element: HTMLElement, returnValue?: string): Promise<void>;
/** Shows a toast in the page's `.x-toaster` region and announces it; persistent unless `timeout` (ms) is given. */
export function toast(
	message: string,
	options?: { tone?: 'success' | 'warning' | 'danger' | 'info'; timeout?: number; closeLabel?: string },
): { dismiss(): void };
/** Wires every component under `root`, and `root` itself (idempotent: call it again after inserting content). */
export function enhance(root?: ParentNode): void;
