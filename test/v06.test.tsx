// The 0.6 additions: tooltips on data-tip, settings, select, combobox, duration, colour, seeded avatars, zones.
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { Avatar, ColorField, Combobox, DurationField, SettingRow, Settings, Tooltip, hueOf } from '../src/react';

const html = (node: React.ReactElement): string => renderToStaticMarkup(node);
const noop = (): void => undefined;
const css = (file: string): string => readFileSync(join(import.meta.dir, '..', file), 'utf8');

describe('tooltips', () => {
	test('a tooltip is two attributes on its trigger, nothing rendered beside it', () => {
		expect(html(<Tooltip content="Mute" sub="M"><button type="button">x</button></Tooltip>)).toBe('<button type="button" data-tip="Mute" data-tip-sub="M">x</button>');
	});
});

describe('settings', () => {
	test('a list of settings is a titled section, each row a label tied to its control and description', () => {
		const out = html(
			<Settings title="Recording">
				<SettingRow label="Chat" description="Saved beside the video.">
					{(control) => <input type="checkbox" className="x-switch" role="switch" {...control} />}
				</SettingRow>
			</Settings>,
		);
		const [, heading] = /<section class="x-settings" aria-labelledby="([^"]+)"><h3 id="\1">Recording<\/h3>/.exec(out) ?? [];
		expect(heading).toBeDefined();
		const id = /<input[^>]* id="([^"]+)"/.exec(out)?.[1];
		expect(out).toContain(`<label for="${id}" id="${id}-label">Chat</label><small id="${id}-d">`);
		expect(out).toContain(`aria-describedby="${id}-d"`);
	});
});

describe('pickers', () => {
	const options = [
		{ value: 'place', label: 'Lieu' },
		{ value: 'event', label: 'Événement', detail: '12 elements' },
	] as const;

	test('a combobox is a field with the combobox role, tied to a listbox popover', () => {
		const out = html(<Combobox label="Kind" value="event" onChange={noop} options={options} empty="None" />);
		const list = /aria-controls="([^"]+)"/.exec(out)?.[1];
		expect(out).toContain('role="combobox"');
		expect(out).toContain('aria-expanded="false"');
		expect(out).toContain('value="Événement"');
		expect(out).toContain(`id="${list}" class="x-menu" role="listbox" popover="manual" aria-label="Kind"`);
		expect(out).toContain('<span class="x-menu-text"><span>Événement</span><small>12 elements</small></span>');
	});

	test('a duration reads m:ss.cc, h:mm:ss.cc from an hour', () => {
		expect(html(<DurationField label="Start" value={64.25} onChange={noop} locale="en" />)).toContain('value="1:04.25"');
		expect(html(<DurationField label="Start" value={3725.5} onChange={noop} locale="fr" />)).toContain('value="1:02:05,50"');
		expect(html(<DurationField label="Start" value={59.999} onChange={noop} locale="en" />)).toContain('value="1:00.00"');
	});

	test('a colour field is a button naming the colour, its picker labelled part by part', () => {
		const out = html(<ColorField label="Outline" value="#2f5bff" onChange={noop} labels={{ plane: 'Saturation and brightness', hue: 'Hue', hex: 'Hex' }} />);
		expect(out).toContain('<span class="x-swatch" style="--x-swatch:#2f5bff"></span>');
		expect(out).toContain('>#2F5BFF</span>');
		expect(out).toMatch(/popovertarget="([^"]+)"[^>]*>.*id="\1" class="x-popover" popover="auto" role="dialog" aria-label="Outline"/);
	});
});

describe('avatars', () => {
	test('a seed gives a stable hue, the same on every render', () => {
		expect(hueOf('user-42')).toBe(hueOf('user-42'));
		expect(hueOf('user-42')).not.toBe(hueOf('user-43'));
		const out = html(<Avatar name="Mila Arnaud" seed="user-42" />);
		expect(out).toContain(`data-hue="" style="--x-hue:${hueOf('user-42')}"`);
		expect(out).toContain('<span aria-hidden="true">MA</span>');
	});
});

describe('stylesheets', () => {
	test('the rare components live in extras.css, out of xantoom.css', () => {
		for (const name of ['.x-command', '.x-scrubber', '.x-status-page', '.x-stats']) {
			expect(css('dist/xantoom.css')).not.toContain(`${name}{`);
			expect(css('dist/components/extras.css')).toContain(name);
		}
	});

	test('a two-line menu row is computed from the sizes that draw it', () => {
		expect(css('src/components/overlays.css')).not.toContain('3.375rem');
	});
});
