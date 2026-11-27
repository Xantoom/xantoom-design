// xantoom-design/react renders the design system's markup: classes, data-* variants and the ARIA ties.
import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { Avatar, Button, CommandPalette, Field, Flag, IconButton, Menu, MenuItem, Options, TextField } from '../src/react';

const html = (node: React.ReactElement): string => renderToStaticMarkup(node);

describe('react', () => {
	test('a button carries the classes and keeps focus while busy', () => {
		expect(html(<Button variant="primary" size="sm">Save</Button>)).toBe(
			'<button class="x-button" data-variant="primary" data-size="sm" type="button">Save</button>',
		);
		const busy = html(<Button busy>Save</Button>);
		expect(busy).toContain('aria-busy="true"');
		expect(busy).toContain('aria-disabled="true"');
		expect(busy).not.toContain('disabled=""');
	});

	test('an icon button is named once: its tooltip repeats the name without describing it', () => {
		const out = html(<IconButton label="Settings"><svg /></IconButton>);
		expect(out).toContain('aria-label="Settings"');
		expect(out).toContain('data-icon=""');
		expect(out).toMatch(/interestfor="([^"]+)".*<div class="x-tooltip" id="\1" popover="hint">Settings<\/div>/);
		expect(out).not.toContain('aria-describedby');
	});

	test('a field ties its label, hint and error to the control', () => {
		const out = html(<TextField label="Email" hint="Never shared" error="Required" required />);
		const id = /<input[^>]* id="([^"]+)"/.exec(out)?.[1];
		expect(out).toContain(`for="${id}"`);
		expect(out).toContain(`aria-describedby="${id}-error ${id}-hint"`);
		expect(out).toContain('aria-invalid="true"');
		expect(out).toContain('required=""');
		expect(html(<Field label="Name">{(c) => <input {...c} />}</Field>)).not.toContain('aria-describedby');
	});

	test('a menu opens from its trigger and marks its current choice', () => {
		const out = html(
			<Menu label="Sort" trigger={(props) => <button type="button" {...props}>Sort</button>}>
				<MenuItem checked>Name</MenuItem>
				<MenuItem checked={false}>Date</MenuItem>
			</Menu>,
		);
		const id = /popovertarget="([^"]+)"/.exec(out)?.[1];
		expect(out).toContain(`<div id="${id}" class="x-menu" popover="auto" role="menu" aria-label="Sort">`);
		expect(out).toContain('aria-haspopup="menu" aria-expanded="false"');
		expect(out).toContain('role="menuitemradio" aria-checked="true"');
	});

	test('options are radios in one fieldset; icon-only ones keep their names', () => {
		const out = html(
			<Options legend="View" name="view" value="list" onChange={() => undefined}
				options={[{ value: 'list', label: 'List', icon: <svg /> }, { value: 'grid', label: 'Grid', icon: <svg /> }]} />,
		);
		expect(out).toContain('<fieldset class="x-options" data-icons="">');
		expect(out).toContain('aria-label="Grid"');
		expect(out).toContain('checked="" value="list"');
	});

	test('an avatar without a picture shows initials and is named', () => {
		expect(html(<Avatar name="Ada Lovelace" size="sm" />)).toBe(
			'<span class="x-avatar" data-size="sm" role="img" aria-label="Ada Lovelace"><span aria-hidden="true">AL</span></span>',
		);
		expect(html(<Avatar name="Ada" size="3rem" />)).toContain('style="--_size:3rem"');
		expect(html(<Flag code="fr" />)).toContain('class="x-flag"');
	});
});

describe('react, shortcuts', () => {
	test('an icon button shows its shortcut in the tooltip without describing itself twice', () => {
		const out = html(<IconButton label="Search" shortcut="Ctrl K"><svg /></IconButton>);
		expect(out).toContain('Search <kbd class="x-kbd">Ctrl K</kbd>');
		expect(out).not.toContain('aria-describedby');
	});
});

describe('react, command palette', () => {
	const groups = [
		{ id: 'pages', label: 'Pages', items: [{ id: 'a', label: 'Atlas', detail: 'the map', onSelect: () => undefined }] },
		{ id: 'none', label: 'Empty', items: [] },
	];
	const palette = (open: boolean, list = groups) =>
		html(
			<CommandPalette open={open} onClose={() => undefined} label="Search" query="" onQueryChange={() => undefined} groups={list} empty="Nothing" />,
		);

	test('a search tied to its listbox, groups named, empty groups left out', () => {
		const out = palette(true);
		const list = /role="listbox" id="([^"]+)"/.exec(out)?.[1];
		expect(out).toContain(`aria-controls="${list}"`);
		expect(out).toContain('role="combobox"');
		expect(out).toMatch(/role="group" aria-labelledby="([^"]+)"><span id="\1">Pages<\/span>/);
		expect(out).not.toContain('Empty');
		expect(out).toContain('<span class="x-command-detail">the map</span>');
	});

	test('says when nothing matches, and renders nothing while closed', () => {
		expect(palette(true, [])).toContain('<p class="x-command-empty">Nothing</p>');
		expect(palette(false)).not.toContain('combobox');
	});
});
