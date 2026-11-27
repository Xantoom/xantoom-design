// The 0.7 additions: tooltip pictures, and Select as a listbox of its own.
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { Select, SettingRow, Tooltip } from '../src/react';

const html = (node: React.ReactElement): string => renderToStaticMarkup(node);
const noop = (): void => undefined;
const source = (file: string): string => readFileSync(join(import.meta.dir, '..', file), 'utf8');

describe('tooltip pictures', () => {
	test('a picture or a cover is one more attribute on the trigger', () => {
		expect(html(<Tooltip content="France" img="/fr.svg"><span>FR</span></Tooltip>)).toBe('<span data-tip="France" data-tip-img="/fr.svg">FR</span>');
		expect(html(<Tooltip content="Dune" poster="/dune.jpg"><span>Dune</span></Tooltip>)).toContain('data-tip-poster="/dune.jpg"');
	});

	test('the script draws them and lets a tap show the tooltip of what is not a control', () => {
		const js = source('src/xantoom.js');
		expect(js).toContain('tipPoster ?? tipImg');
		expect(js).toMatch(/const TAP = 'a\[href\], button, input, select, textarea, label,/);
		expect(source('src/components/overlays.css')).toContain('& > img[data-poster]');
	});
});

describe('select', () => {
	const options = [
		{ value: 'place', label: 'Lieu', group: 'World' },
		{ value: 'event', label: 'Événement', detail: '12 elements', group: 'World' },
		{ value: 'note', label: 'Note', disabled: true, reason: 'Needs a plan' },
	] as const;

	test('a button with a listbox popup, read as "label, choice"', () => {
		const out = html(<Select label="Kind" value="event" onChange={noop} options={options} />);
		const id = /<label class="x-label" for="([^"]+)" id="\1-label">Kind<\/label>/.exec(out)?.[1];
		expect(id).toBeDefined();
		const value = /<span class="x-select-value" id="([^"]+)">/.exec(out)?.[1];
		expect(out).toContain(`id="${id}" class="x-select" aria-labelledby="${id}-label ${value}" aria-haspopup="listbox" aria-expanded="false"`);
		expect(out).toContain('<span class="x-select-value"');
		expect(out).toMatch(/class="x-menu" popover="auto"/);
		expect(out).toMatch(/role="listbox" tabindex="-1" aria-labelledby="[^"]+-label"/);
	});

	test('options carry the choice, their group, a second line, and a disabled one its reason', () => {
		const out = html(<Select label="Kind" value="event" onChange={noop} options={options} />);
		expect(out).toMatch(/<div role="group" aria-labelledby="([^"]+)"><div class="x-menu-label" id="\1">World<\/div>/);
		expect(out).toMatch(/role="option" aria-selected="true"[^>]*><span class="x-menu-text"><span>Événement<\/span><small>12 elements<\/small><\/span>/);
		expect(out).toMatch(/role="option" aria-selected="false" aria-disabled="true" data-tip="Needs a plan"/);
	});

	test('without a label it takes its name from aria-label, or from the SettingRow label by its id', () => {
		const alone = html(<Select aria-label="Sort" value="place" onChange={noop} options={options} variant="ghost" size="sm" bare />);
		const self = /<button type="button" id="([^"]+)"/.exec(alone)?.[1];
		expect(alone).toMatch(new RegExp(`aria-label="Sort" aria-labelledby="${self} [^"]+"`));
		expect(alone).toContain('data-variant="ghost" data-size="sm" data-bare=""');
		const row = html(<SettingRow label="Kind">{(control) => <Select {...control} value="place" onChange={noop} options={options} />}</SettingRow>);
		const id = /<label for="([^"]+)"/.exec(row)?.[1];
		expect(row).toContain(`id="${id}" class="x-select" aria-labelledby="${id}-label `);
	});

	test('a long list gets its search only with a label for it', () => {
		const many = Array.from({ length: 12 }, (_, i) => ({ value: `v${i}`, label: `Option ${i}` }));
		expect(html(<Select aria-label="Pick" value="v0" onChange={noop} options={many} />)).not.toContain('type="search"');
		expect(html(<Select aria-label="Pick" value="v0" onChange={noop} options={many} search={{ label: 'Search', empty: 'None' }} />)).toContain('type="search" role="combobox" aria-label="Search"');
		expect(html(<Select aria-label="Pick" value="v0" onChange={noop} options={many.slice(0, 11)} search={{ label: 'Search', empty: 'None' }} />)).not.toContain('type="search"');
	});

	test('a name submits the choice with a form', () => {
		expect(html(<Select aria-label="Kind" name="kind" value="place" onChange={noop} options={options} />)).toContain('<input type="hidden" name="kind" value="place"/>');
	});
});
