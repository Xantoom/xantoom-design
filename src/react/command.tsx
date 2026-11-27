import { closeTopLayer } from 'xantoom-design/js';
import { type ReactElement, type ReactNode, useId, useLayoutEffect, useRef, useState } from 'react';
import { useModal } from './dialog';

export interface CommandItem {
	id: string;
	label: string;
	icon?: ReactNode;
	/** A second line under the label (a matching excerpt). */
	detail?: ReactNode;
	/** At the end of the row: a shortcut, a place. */
	hint?: ReactNode;
	/** Run once the palette has closed. */
	onSelect: () => void;
}

export interface CommandGroup {
	id: string;
	label: string;
	items: readonly CommandItem[];
}

export interface CommandPaletteProps {
	open: boolean;
	onClose: () => void;
	/** The palette's accessible name, and its search's. */
	label: string;
	placeholder?: string;
	query: string;
	onQueryChange: (query: string) => void;
	/** Already filtered by the app; empty groups are left out. */
	groups: readonly CommandGroup[];
	/** Shown when no group has an item. */
	empty: ReactNode;
	footer?: ReactNode;
}

/**
 * Search and run (Ctrl/⌘ K): a modal with a search that keeps the focus and a list the arrow keys move through. The app
 * filters; Enter or a click closes the palette and runs the item.
 */
export function CommandPalette({
	open,
	onClose,
	label,
	placeholder,
	query,
	onQueryChange,
	groups,
	empty,
	footer,
}: CommandPaletteProps): ReactElement {
	const id = useId();
	const { ref, element, shown, closed } = useModal(open, onClose);
	const run = useRef<(() => void) | undefined>(undefined);
	const visible = groups.filter((group) => group.items.length > 0);
	const keys = visible.flatMap((group) => group.items.map((item) => `${id}-${group.id}-${item.id}`));
	const byKey = new Map<string, CommandItem>(
		visible.flatMap((group) => group.items.map((item): [string, CommandItem] => [`${id}-${group.id}-${item.id}`, item])),
	);
	// The active option follows the list as the app filters it: the first one, until a key or the pointer moves it.
	const [picked, setPicked] = useState<string>();
	const active = picked !== undefined && byKey.has(picked) ? picked : keys[0];

	useLayoutEffect(() => {
		if (active) document.getElementById(active)?.scrollIntoView({ block: 'nearest' });
	}, [active]);

	const choose = (item: CommandItem | undefined): void => {
		if (!item || !element) return;
		run.current = item.onSelect;
		void closeTopLayer(element);
	};

	return (
		<dialog
			ref={ref}
			className="x-dialog x-command"
			aria-label={label}
			closedby="any"
			onClose={() => {
				closed();
				const next = run.current;
				run.current = undefined;
				next?.();
			}}
		>
			{shown ? (
				<>
					<label className="x-command-search">
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<circle cx="11" cy="11" r="7" fill="none" stroke="currentcolor" strokeWidth="2" />
							<path d="m20 20-3.5-3.5" fill="none" stroke="currentcolor" strokeWidth="2" strokeLinecap="round" />
						</svg>
						<input
							role="combobox"
							aria-expanded="true"
							aria-controls={`${id}-list`}
							aria-autocomplete="list"
							aria-label={label}
							placeholder={placeholder}
							value={query}
							aria-activedescendant={active}
							// React keeps the active option: the design system script leaves this search alone.
							data-x-ready=""
							onChange={(event) => {
								setPicked(undefined);
								onQueryChange(event.currentTarget.value);
							}}
							onKeyDown={(event) => {
								if (event.key === 'Enter') {
									event.preventDefault();
									choose(active ? byKey.get(active) : undefined);
									return;
								}
								const index = active ? keys.indexOf(active) : -1;
								const next = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: keys.length - 1 }[event.key];
								if (next === undefined || keys.length === 0) return;
								event.preventDefault();
								setPicked(keys.at(next % keys.length));
							}}
							autoComplete="off"
							spellCheck={false}
							// The palette opens to type: the search takes the focus (showModal() gives it to the first autofocus).
							autoFocus
						/>
					</label>
					<div className="x-command-list" role="listbox" id={`${id}-list`} aria-label={label}>
						{visible.length === 0 ? <p className="x-command-empty">{empty}</p> : null}
						{visible.map((group) => (
							<div key={group.id} role="group" aria-labelledby={`${id}-${group.id}`}>
								<span id={`${id}-${group.id}`}>{group.label}</span>
								{group.items.map((item) => (
									<div
										key={item.id}
										role="option"
										id={`${id}-${group.id}-${item.id}`}
										aria-selected={active === `${id}-${group.id}-${item.id}`}
										tabIndex={-1}
										onPointerMove={() => setPicked(`${id}-${group.id}-${item.id}`)}
										onClick={() => choose(item)}
									>
										{item.icon}
										<span className="x-command-label">
											{item.label}
											{item.detail ? <span className="x-command-detail">{item.detail}</span> : null}
										</span>
										{item.hint ? <small>{item.hint}</small> : null}
									</div>
								))}
							</div>
						))}
					</div>
					{footer ? <footer>{footer}</footer> : null}
				</>
			) : null}
		</dialog>
	);
}
