import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPrompt } from '../public/js/prompt.js';
import { DEFAULT_TEMPLATE, DEFAULT_STYLES, GUARDRAIL } from '../public/js/config.js';

const base = { template: DEFAULT_TEMPLATE, selection: {}, twist: '', styles: DEFAULT_STYLES };

test('empty choices drop their lines but keep the fixed ones', () => {
  const prompt = buildPrompt(base);
  assert.ok(prompt.startsWith('Create an original superhero character illustration.'));
  assert.ok(!prompt.includes('Origin:'));
  assert.ok(!prompt.includes('Extra details:'));
});

test('multi-select values are joined and single values are used as-is', () => {
  const prompt = buildPrompt({ ...base, selection: { powers: ['Fire', 'Ice'], gender: ['Non-binary'] } });
  assert.match(prompt, /Superpowers: Fire, Ice/);
  assert.match(prompt, /Gender presentation: Non-binary/);
});

test('the art style is replaced by its wording', () => {
  const prompt = buildPrompt({ ...base, selection: { style: ['Anime'] } });
  assert.match(prompt, new RegExp(`Art style: ${DEFAULT_STYLES.Anime}`));
});

test('an edited style wording is used', () => {
  const styles = { ...DEFAULT_STYLES, Anime: 'my custom anime wording' };
  const prompt = buildPrompt({ ...base, styles, selection: { style: ['Anime'] } });
  assert.match(prompt, /Art style: my custom anime wording/);
});

test('the twist text is included and trimmed', () => {
  const prompt = buildPrompt({ ...base, twist: '  on a moving train  ' });
  assert.match(prompt, /Extra details: on a moving train\n/);
});

test('the copyright guardrail is always the last line, even with a custom template', () => {
  const prompt = buildPrompt({ ...base, template: 'Just draw a hero. {origin}' });
  assert.ok(prompt.endsWith(GUARDRAIL));
});
