export type ThemeChoice = 'system' | 'light' | 'dark';
/** The stored choice; "system" when none, or when storage is blocked. */
export function storedTheme(): ThemeChoice;
/** Applies a choice to the page: `data-theme` on <html> for light or dark, nothing for system. */
export function applyTheme(choice?: ThemeChoice): void;
/** Turns an `.x-cycle` button into the theme switch. Returns a function that removes the wiring. */
export function themeCycle(button: HTMLButtonElement, options?: { onChange?: (choice: ThemeChoice) => void }): () => void;
