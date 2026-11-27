// The 0.5 additions: new React controls, the alert dialog, menu descriptions, logos and the migrate command.
import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { brand, brands } from '../src/brand.js';
import { rename } from '../scripts/migrate.ts';
import { Brand, Dialog, DropZone, Menu, MenuItem, NumberField, Options, SearchField, Switch } from '../src/react';

const html = (node: React.ReactElement): string => renderToStaticMarkup(node);
const noop = (): void => undefined;

describe('react controls', () => {
	test('a switch is a native checkbox with the switch role, inside its label', () => {
		const out = html(<Switch label="Chat" checked onChange={noop} />);
		expect(out).toMatch(/^<label class="x-check"><input type="checkbox" switch="" role="switch" class="x-switch" checked=""\/>Chat<\/label>$/);
	});

	test('a number field is a spinbutton tied to its label, with its unit read out', () => {
		const out = html(<NumberField label="Alert under" value={1500} onChange={noop} min={1} max={5000} unit="GB" locale="en" />);
		const id = /<input[^>]* id="([^"]+)"/.exec(out)?.[1];
		expect(out).toContain(`for="${id}"`);
		expect(out).toContain('role="spinbutton"');
		expect(out).toContain('aria-valuenow="1500" aria-valuemin="1" aria-valuemax="5000" aria-valuetext="1,500 GB"');
		expect(out).toContain('value="1,500"');
		expect(out).toContain('<span class="x-number-unit">GB</span>');
		expect(out).toContain('<span class="x-number-scrub" aria-hidden="true">');
	});

	test('a number field disables the arrow that would leave its limits', () => {
		const out = html(<NumberField label="N" value={10} onChange={noop} min={0} max={10} />);
		expect(out).toContain('data-step="up" disabled=""');
		expect(out).not.toContain('data-step="down" disabled=""');
	});

	test('a search field shows its shortcut and a named clear button', () => {
		const out = html(<SearchField label="Search" value="" onChange={noop} shortcut="/" clearLabel="Clear" />);
		expect(out).toContain('type="search" aria-label="Search" placeholder=" "');
		expect(out).toContain('<kbd class="x-kbd" aria-hidden="true">/</kbd>');
		expect(out).toContain('aria-label="Clear"');
	});

	test('a drop zone is a label around a hidden file input', () => {
		const out = html(<DropZone title="Drop" accept="image/*" onFiles={noop} />);
		expect(out).toMatch(/^<label class="x-dropzone"><strong>Drop<\/strong><input accept="image\/\*" class="x-visually-hidden" type="file"\/><\/label>$/);
	});

	test('a disabled option stays visible, its radio disabled', () => {
		const out = html(
			<Options legend="Q" name="q" value="a" onChange={noop} options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B', disabled: true }]} />,
		);
		expect(out).toContain('<input type="radio" disabled="" name="q" value="b"/>');
	});
});

describe('react menus and dialogs', () => {
	test('a menu item takes a description and a detail; a menu, a row limit', () => {
		const out = html(
			<Menu label="Tracks" rows={4} trigger={(props) => <button type="button" {...props}>T</button>}>
				<MenuItem description="312 lines" detail="ASS" checked>French</MenuItem>
			</Menu>,
		);
		expect(out).toContain('style="--rows:4"');
		expect(out).toContain('<span class="x-menu-text"><span>French</span><small>312 lines</small></span><span data-detail="">ASS</span>');
	});

	test('an alert dialog is described by its sentence and passes other attributes through', () => {
		// Closed dialogs render no content: check the frame only.
		const out = html(<Dialog open={false} onClose={noop} title="Delete?" variant="alert" description="Gone for good." data-testid="d" />);
		expect(out).toContain('role="alertdialog"');
		expect(out).toContain('closedby="closerequest"');
		expect(out).toContain('data-testid="d"');
		expect(out).toMatch(/aria-describedby="[^"]+"/);
	});
});

describe('brand', () => {
	test('every logo, with ids made unique per call', () => {
		expect(brands).toEqual(['vexode', 'vixeeny', 'vixely', 'vixion']);
		const a = brand('vixion');
		const b = brand('vixion', { size: 20, label: 'Vixion' });
		const idA = /id="([^"]+)"/.exec(a)?.[1];
		const idB = /id="([^"]+)"/.exec(b)?.[1];
		expect(idA).not.toBe(idB);
		expect(a).toContain(`url(#${idA})`);
		expect(a).toContain('aria-hidden="true"');
		expect(b).toContain('width="20" height="20" role="img" aria-label="Vixion"');
		expect(brand('vexode', { id: 'r1' })).toContain('id="g-r1"');
		expect(html(<Brand name="vixely" />)).toContain('<svg width="32"');
	});
});

describe('migrate', () => {
	const colours = new Map([['ink', 'fg'], ['ink-2', 'fg-muted'], ['muted', 'fg-faint']]);
	const radii = new Map([['sm', 'md'], ['md', 'lg']]);

	test('renames whole names once, longest first, with variants and opacity', () => {
		const { text, count } = rename('<p className="text-ink-2 hover:bg-ink/50 border-s-muted rounded-sm md:rounded-t-md">', colours, radii);
		expect(text).toBe('<p className="text-fg-muted hover:bg-fg/50 border-s-fg-faint rounded-md md:rounded-t-lg">');
		expect(count).toBe(5);
	});

	test('leaves look-alikes alone and renames CSS variables', () => {
		expect(rename('text-inked ink-2 bg-muted-foo', colours, radii).count).toBe(0);
		expect(rename('color: var(--color-ink-2); border-radius: var(--radius-sm);', colours, radii).text).toBe(
			'color: var(--color-fg-muted); border-radius: var(--radius-md);',
		);
	});
});
