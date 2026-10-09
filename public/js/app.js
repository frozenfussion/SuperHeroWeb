// Superhero Maker: five-screen builder, hero sheet, forge screen and settings drawer.
import { STEPS, SECTIONS } from './config.js';
import { buildPrompt } from './prompt.js';
import { generate } from './api.js';
import { loadSettings, effectiveModel, mountDrawer } from './settings.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const rand = (n) => Math.floor(Math.random() * n);
const shuffle = (a) => {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const LAST = STEPS.length - 1;
const state = { step: 0, sel: {}, twist: '', gen: 'idle', err: null, image: null };
const settings = loadSettings();

const currentPrompt = () => buildPrompt({ template: settings.template, selection: state.sel, twist: state.twist, styles: settings.styles });

/* ---------- rendering ---------- */
function renderStepper() {
  $('#steps').innerHTML = STEPS.map((st, i) => {
    const cls = `step${i === state.step ? ' on' : ''}${i < state.step ? ' done' : ''}`;
    return `<button type="button" class="${cls}" data-go="${i}"${i === state.step ? ' aria-current="step"' : ''}><span class="n">${i + 1}</span><span class="l">${esc(st.label)}</span></button>`;
  }).join('');
}

function chipHTML(section, opt) {
  const dot = opt.c ? `<i class="dot" data-c="${esc(opt.c)}"></i>` : '';
  return `<button type="button" class="chip" data-k="${section.key}" data-v="${esc(opt.n)}" aria-pressed="false"><span>${dot}${esc(opt.n)}</span></button>`;
}

function sectionHTML(s) {
  const tag = `${s.mode === 'single' ? 'pick one' : 'pick any'}${s.optional ? ' · optional' : ''}${s.hint ? ` · ${s.hint.toLowerCase()}` : ''}`;
  const search = s.search
    ? `<input type="text" class="search" id="q-${s.key}" placeholder="Search ${s.opts.length} powers" aria-label="Search powers" autocomplete="off">`
    : '';
  return `<section class="sec"><div class="sec-h"><h3>${esc(s.label)}</h3><span class="tag">${esc(tag)}</span><span class="count" data-count="${s.key}"></span><span class="rule"></span></div>${search}`
    + `<div class="chips" role="group" aria-label="${esc(s.label)}">${s.opts.map((o) => chipHTML(s, o)).join('')}</div></section>`;
}

function titleHTML() {
  const st = STEPS[state.step];
  const label = state.step === LAST ? 'Surprise the whole hero' : 'Surprise me';
  return `<div class="ttl"><span class="num">0${state.step + 1}</span><div><h2>${esc(st.title)}</h2><p>${esc(st.sub)}</p></div><button type="button" class="btn sm" id="surprise">${label}</button></div>`;
}

function metaHTML() {
  const model = effectiveModel(settings) || '(type a model ID in Settings)';
  const keyOk = settings.apiKey.trim().length > 0;
  return `<div class="runmeta"><span>Model <b>${esc(model)}</b></span><span>Size <b>1024 × 1024</b></span><span>Quality <b>${esc(settings.quality)}</b></span><span>API key <b class="${keyOk ? '' : 'warn'}">${keyOk ? 'set' : 'not set'}</b></span></div>`;
}

function forgeHTML() {
  const head = titleHTML();
  if (state.gen === 'loading') {
    return `${head}<div class="forging" role="status" aria-label="Generating image"><b>Forging<i>…</i></b></div>`;
  }
  if (state.gen === 'done') {
    return `${head}<div class="result"><div class="frame"><img id="resultImg" alt="Your generated superhero" src="${esc(state.image)}"></div>`
      + `<div class="acts"><button type="button" class="btn primary" id="dl">Download image</button><button type="button" class="btn" id="tweak">Tweak this hero</button><button type="button" class="btn" id="fresh">New hero</button>`
      + `<p>Tweak keeps every choice and returns to the prompt. New hero starts again from screen 1.</p>${metaHTML()}</div></div>`;
  }
  const err = state.gen === 'error' && state.err
    ? `<div class="err" role="alert"><h3>Generation failed${state.err.status ? ` · HTTP ${esc(state.err.status)}` : ''}</h3><pre>${esc(state.err.message)}</pre></div>`
    : '';
  return `${head}${err}`
    + `<section class="panel"><div class="sec-h"><h3>Your twist</h3><span class="tag">optional · free text</span><span class="rule"></span></div>`
    + `<label class="f" for="twist">A location, an effect, a detail only you would think of</label>`
    + `<textarea id="twist" placeholder="Example: standing on a moving train, golden sparks trailing from the hands"></textarea></section>`
    + `<section class="panel"><div class="sec-h"><h3>Prompt preview</h3><span class="tag">exactly what is sent</span><span class="rule"></span></div><pre class="prompt" id="promptOut"></pre>${metaHTML()}</section>`;
}

function renderScreen() {
  const el = $('#screen');
  if (state.step === LAST) {
    el.innerHTML = forgeHTML();
    const tw = $('#twist');
    if (tw) tw.value = state.twist;
    const po = $('#promptOut');
    if (po) po.textContent = currentPrompt();
  } else {
    el.innerHTML = titleHTML() + STEPS[state.step].sections.map(sectionHTML).join('');
  }
  paint();
}

// Sync chip highlights, swatch colors and counters with the state.
function paint() {
  for (const b of $$('.chip[data-k]')) {
    const on = (state.sel[b.dataset.k] || []).includes(b.dataset.v);
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  for (const d of $$('.dot[data-c]')) d.style.setProperty('--c', d.dataset.c);
  for (const el of $$('[data-count]')) {
    const n = (state.sel[el.dataset.count] || []).length;
    el.textContent = n > 1 ? `${n} chosen` : '';
  }
}

function renderSheet() {
  let set = 0;
  let total = 0;
  let rows = STEPS.slice(0, LAST).map((st, i) => `<div class="srow-h">${esc(st.label)}</div>`
    + st.sections.map((s) => {
      const v = state.sel[s.key] || [];
      total++;
      if (v.length) set++;
      return `<button type="button" class="srow" data-go="${i}"><span class="sk">${esc(s.label)}</span><span class="sv${v.length ? '' : ' empty'}">${v.length ? esc(v.join(', ')) : '—'}</span></button>`;
    }).join('')).join('');
  const tw = state.twist.trim();
  rows += `<div class="srow-h">Forge</div><button type="button" class="srow" data-go="${LAST}"><span class="sk">Twist</span><span class="sv${tw ? '' : ' empty'}">${tw ? esc(tw) : '—'}</span></button>`;
  const open = $('#sheet').classList.contains('open');
  $('#sheet').innerHTML = `<div class="sheet-box"><button type="button" class="sheet-toggle" id="sheetToggle" aria-expanded="${open}"><span class="t">Hero sheet</span><span class="c">${set} / ${total} set</span>`
    + `<svg class="chev" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6l5 5 5-5"/></svg></button><div class="sheet-body">${rows}</div></div>`;
}

function renderDock() {
  const last = state.step === LAST;
  document.body.classList.toggle('is-done', state.gen === 'done' && last);
  $('#back').disabled = state.step === 0;
  $('#dockMid').textContent = `Step ${state.step + 1} of ${STEPS.length} · ${STEPS[state.step].label}`;
  const next = $('#next');
  if (last) {
    next.textContent = state.gen === 'loading' ? 'Forging…' : 'Generate hero';
    next.disabled = state.gen === 'loading';
  } else {
    next.textContent = `Next: ${STEPS[state.step + 1].label}`;
    next.disabled = false;
  }
}

function renderAll() {
  renderStepper();
  renderScreen();
  renderSheet();
  renderDock();
}

function go(n) {
  if (n < 0 || n > LAST) return;
  if (state.gen !== 'loading') state.gen = 'idle';
  state.step = n;
  renderAll();
  window.scrollTo(0, 0);
}

/* ---------- choices ---------- */
function toggle(key, value) {
  const sec = SECTIONS[key];
  let cur = state.sel[key] || [];
  if (sec.mode === 'single') {
    cur = cur[0] === value ? [] : [value];
  } else if (cur.includes(value)) {
    cur = cur.filter((x) => x !== value);
  } else {
    cur = [...cur, value];
    if (sec.exclusive) cur = value === sec.exclusive ? [value] : cur.filter((x) => x !== sec.exclusive);
  }
  state.sel[key] = cur;
}

function surpriseStep(step) {
  for (const s of step.sections) {
    const names = s.opts.map((o) => o.n);
    if (s.mode === 'single') {
      state.sel[s.key] = [pick(names)];
      continue;
    }
    if (s.optional && Math.random() < 0.5) {
      state.sel[s.key] = [];
      continue;
    }
    const pool = names.filter((n) => n !== s.exclusive);
    const count = s.key === 'powers' ? 2 + rand(3) : 1 + rand(3);
    state.sel[s.key] = shuffle(pool).slice(0, count);
  }
}

function surprise() {
  if (state.step === LAST) {
    STEPS.slice(0, LAST).forEach(surpriseStep);
    toast('A brand new hero has been rolled');
  } else {
    surpriseStep(STEPS[state.step]);
  }
  paint();
  renderSheet();
  const po = $('#promptOut');
  if (po) po.textContent = currentPrompt();
}

/* ---------- generation ---------- */
async function forge() {
  if (state.gen === 'loading') return;
  const model = effectiveModel(settings);
  state.err = null;

  if (!settings.apiKey.trim()) {
    state.gen = 'error';
    state.err = { status: 0, message: 'No API key is set. Open Settings (gear icon, top right), paste your OpenAI API key, and try again.' };
    renderAll();
    return;
  }
  if (!model) {
    state.gen = 'error';
    state.err = { status: 0, message: 'No model is selected. Open Settings and choose a model, or type a custom model ID.' };
    renderAll();
    return;
  }

  state.gen = 'loading';
  renderAll();
  window.scrollTo(0, 0);

  const result = await generate({ apiKey: settings.apiKey.trim(), model, quality: settings.quality, prompt: currentPrompt() });
  if (result.image) {
    state.image = result.image;
    state.gen = 'done';
  } else {
    state.err = result.error;
    state.gen = 'error';
  }
  renderAll();
  window.scrollTo(0, 0);
}

function download() {
  const a = document.createElement('a');
  a.href = state.image;
  a.download = `superhero-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ---------- toast ---------- */
let toastTimer;
function toast(message) {
  const t = $('#toast');
  t.textContent = message;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------- settings drawer ---------- */
let drawer = null;
let lastFocus = null;
function openDrawer() {
  lastFocus = document.activeElement;
  if (!drawer) {
    drawer = mountDrawer($('#drawerIn'), settings, {
      onChange() {
        const po = $('#promptOut');
        if (po) po.textContent = currentPrompt();
      },
      onClose: closeDrawer,
      onReset() {
        toast('Prompt reset to default');
      },
    });
  } else {
    drawer.sync();
  }
  $('#drawer').hidden = false;
  document.body.style.overflow = 'hidden';
  $('#closeSettings').focus();
}
function closeDrawer() {
  $('#drawer').hidden = true;
  document.body.style.overflow = '';
  // Refresh the model, quality and key status shown on the forge screen.
  if (state.step === LAST && state.gen !== 'done' && state.gen !== 'loading') renderScreen();
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}
$('#scrim').addEventListener('click', closeDrawer);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !$('#drawer').hidden) closeDrawer();
});

/* ---------- events ---------- */
document.addEventListener('click', (e) => {
  const t = e.target;
  const chip = t.closest('.chip[data-k]');
  if (chip) {
    toggle(chip.dataset.k, chip.dataset.v);
    paint();
    renderSheet();
    return;
  }
  const goBtn = t.closest('[data-go]');
  if (goBtn) return go(parseInt(goBtn.dataset.go, 10));
  if (t.closest('#sheetToggle') && window.matchMedia('(max-width:960px)').matches) {
    const sheet = $('#sheet');
    sheet.classList.toggle('open');
    $('#sheetToggle').setAttribute('aria-expanded', sheet.classList.contains('open'));
    return;
  }
  if (t.closest('#surprise')) return surprise();
  if (t.closest('#back')) return go(state.step - 1);
  if (t.closest('#next')) return state.step === LAST ? forge() : go(state.step + 1);
  if (t.closest('#dl')) return download();
  if (t.closest('#tweak')) {
    state.gen = 'idle';
    renderAll();
    window.scrollTo(0, 0);
    return;
  }
  if (t.closest('#fresh')) {
    state.sel = {};
    state.twist = '';
    state.gen = 'idle';
    state.step = 0;
    renderAll();
    window.scrollTo(0, 0);
    return;
  }
  if (t.closest('#openSettings')) openDrawer();
});

document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.id === 'twist') {
    state.twist = t.value;
    renderSheet();
    const po = $('#promptOut');
    if (po) po.textContent = currentPrompt();
  } else if (t.id === 'q-powers') {
    const q = t.value.trim().toLowerCase();
    for (const c of $$('.chip[data-k="powers"]')) c.hidden = Boolean(q) && !c.dataset.v.toLowerCase().includes(q);
  }
});

renderAll();
