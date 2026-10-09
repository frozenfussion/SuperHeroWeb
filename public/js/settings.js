// Settings: stored in this browser's localStorage as plain text (a learning build).
import { MODELS, CUSTOM_MODEL, DEFAULT_MODEL, DEFAULT_TEMPLATE, DEFAULT_STYLES, GUARDRAIL, SECTIONS, qualityOptions } from './config.js';

const STORAGE_KEY = 'superhero-maker-settings';

function defaults() {
  return {
    apiKey: '',
    model: DEFAULT_MODEL,
    customModel: '',
    quality: 'auto',
    template: DEFAULT_TEMPLATE,
    styles: structuredClone(DEFAULT_STYLES),
  };
}

export function loadSettings() {
  const s = defaults();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && typeof saved === 'object') {
      for (const k of ['apiKey', 'model', 'customModel', 'quality', 'template']) {
        if (typeof saved[k] === 'string') s[k] = saved[k];
      }
      if (saved.styles && typeof saved.styles === 'object') Object.assign(s.styles, saved.styles);
    }
  } catch {
    // storage unavailable or corrupted: use defaults
  }
  const known = MODELS.some((m) => m.id === s.model) || s.model === CUSTOM_MODEL;
  if (!known) s.model = DEFAULT_MODEL;
  if (!qualityOptions(s.model).includes(s.quality)) s.quality = 'auto';
  return s;
}

export function saveSettings(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore: settings just won't persist
  }
}

export function effectiveModel(s) {
  return s.model === CUSTOM_MODEL ? s.customModel.trim() : s.model;
}

const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Builds the drawer markup, then wires it to the settings object.
export function mountDrawer(root, settings, { onChange, onClose, onReset }) {
  const modelOpts = MODELS.map((m) => `<option value="${m.id}">${esc(m.label)} · ${esc(m.id)}</option>`).join('')
    + `<option value="${CUSTOM_MODEL}">Custom model ID…</option>`;
  const placeholders = Object.keys(SECTIONS).concat(['twist'])
    .map((k) => `<button type="button" data-ins="{${k}}">{${k}}</button>`).join('');
  const styleOpts = Object.keys(DEFAULT_STYLES).map((n) => `<option>${esc(n)}</option>`).join('');

  root.innerHTML = `
    <div class="drawer-h"><h2 id="setTitle">Settings</h2>
      <button type="button" class="icon-btn" id="closeSettings" aria-label="Close settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square"><path d="M5 5l14 14M19 5 5 19"/></svg></button></div>
    <h3>Connection</h3>
    <div class="field"><label class="f" for="apiKey">OpenAI API key</label>
      <input type="text" id="apiKey" placeholder="sk-…" autocomplete="off" spellcheck="false">
      <p class="note">Stored as plain text in this browser. Fine for learning, not for production.</p></div>
    <div class="field"><label class="f" for="model">Image model</label><select id="model">${modelOpts}</select></div>
    <div class="field" id="customWrap" hidden><label class="f" for="customModel">Custom model ID</label>
      <input type="text" id="customModel" placeholder="Type the exact model ID" autocomplete="off" spellcheck="false"></div>
    <div class="row2">
      <div class="field"><label class="f" for="quality">Quality</label><select id="quality"></select></div>
      <div class="field"><label class="f">Size</label><div class="static">1024 × 1024 · square</div></div>
    </div>
    <h3>Prompt</h3>
    <div class="field"><label class="f" for="tpl">Master template</label>
      <textarea id="tpl" style="min-height:300px" spellcheck="false"></textarea>
      <p class="note">One line per detail. A line is left out when its choice is empty. Tap a placeholder to insert it.</p>
      <div class="ph">${placeholders}</div></div>
    <div class="field"><label class="f" for="styleSel">Art style wording</label>
      <select id="styleSel" style="margin-bottom:10px">${styleOpts}</select>
      <textarea id="styleTxt" spellcheck="false" style="min-height:90px"></textarea>
      <p class="note">This text replaces <code>{style}</code> in the template when that style is chosen.</p></div>
    <div class="lock"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
      <div><b>Copyright guardrail · always on</b><p>${esc(GUARDRAIL)}</p></div></div>
    <div class="field" style="margin-top:18px"><button type="button" class="btn" id="resetPrompt">Reset prompt to default</button></div>`;

  const $ = (sel) => root.querySelector(sel);

  function fillQuality() {
    const opts = qualityOptions(settings.model);
    if (!opts.includes(settings.quality)) settings.quality = 'auto';
    $('#quality').innerHTML = opts.map((q) => `<option>${q}</option>`).join('');
    $('#quality').value = settings.quality;
  }
  function sync() {
    $('#apiKey').value = settings.apiKey;
    $('#model').value = settings.model;
    $('#customWrap').hidden = settings.model !== CUSTOM_MODEL;
    $('#customModel').value = settings.customModel;
    fillQuality();
    $('#tpl').value = settings.template;
    $('#styleTxt').value = settings.styles[$('#styleSel').value] || '';
  }
  const changed = () => { saveSettings(settings); onChange(); };

  root.addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest('#closeSettings')) return onClose();
    const ins = t.closest('[data-ins]');
    if (ins) {
      const ta = $('#tpl');
      const start = ta.selectionStart ?? ta.value.length;
      const end = ta.selectionEnd ?? start;
      ta.value = ta.value.slice(0, start) + ins.dataset.ins + ta.value.slice(end);
      settings.template = ta.value;
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + ins.dataset.ins.length;
      return changed();
    }
    if (t.closest('#resetPrompt')) {
      settings.template = DEFAULT_TEMPLATE;
      settings.styles = structuredClone(DEFAULT_STYLES);
      sync();
      changed();
      onReset();
    }
  });
  root.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'apiKey') settings.apiKey = t.value;
    else if (t.id === 'customModel') settings.customModel = t.value;
    else if (t.id === 'tpl') settings.template = t.value;
    else if (t.id === 'styleTxt') settings.styles[$('#styleSel').value] = t.value;
    else return;
    changed();
  });
  root.addEventListener('change', (e) => {
    const t = e.target;
    if (t.id === 'model') {
      settings.model = t.value;
      $('#customWrap').hidden = t.value !== CUSTOM_MODEL;
      fillQuality();
    } else if (t.id === 'quality') settings.quality = t.value;
    else if (t.id === 'styleSel') { $('#styleTxt').value = settings.styles[t.value] || ''; return; }
    else return;
    changed();
  });

  sync();
  return { sync };
}
