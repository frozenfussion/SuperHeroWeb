// Turns the hero choices plus the editable template into the final prompt.
// No DOM access here, so the server tests can import it too.
import { GUARDRAIL } from './config.js';

// selection: { sectionKey: [values] }, twist: string, styles: { styleName: wording }
export function valueFor(key, { selection, twist, styles }) {
  if (key === 'twist') return (twist || '').trim();
  const values = selection[key] || [];
  if (key === 'style') return values.length ? (styles[values[0]] || values[0]) : '';
  return values.join(', ');
}

export function buildPrompt({ template, selection, twist, styles }) {
  const ctx = { selection, twist, styles };
  const lines = [];
  for (const line of template.split('\n')) {
    const keys = [...line.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
    if (keys.length === 0) {
      lines.push(line);
      continue;
    }
    if (keys.every((k) => !valueFor(k, ctx))) continue; // nothing chosen: drop the line
    lines.push(line.replace(/\{(\w+)\}/g, (_, k) => valueFor(k, ctx)));
  }
  // The copyright guardrail is always present and cannot be edited away.
  lines.push('', GUARDRAIL);
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
