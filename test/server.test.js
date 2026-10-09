import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { GUARDRAIL } from '../public/js/config.js';

// Starts the app on a random port with a fake OpenAI fetch, so no network is needed.
async function withServer(fakeFetch, run) {
  const app = createApp({ fetchImpl: fakeFetch });
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await run(base);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

const post = (base, body) => fetch(`${base}/api/generate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const okResponse = (b64 = 'QUJD') => new Response(JSON.stringify({ data: [{ b64_json: b64 }] }), { status: 200 });

test('serves the app page', async () => {
  await withServer(async () => okResponse(), async (base) => {
    const res = await fetch(`${base}/`);
    assert.equal(res.status, 200);
    assert.match(await res.text(), /Superhero Maker/);
  });
});

test('generate returns the image as a data URL and calls OpenAI correctly', async () => {
  let seen;
  const fake = async (url, init) => {
    seen = { url, init, body: JSON.parse(init.body) };
    return okResponse('QUJD');
  };
  await withServer(fake, async (base) => {
    const res = await post(base, { apiKey: ' sk-test ', model: 'gpt-image-2.5-flare', quality: 'high', prompt: 'a hero' });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { image: 'data:image/png;base64,QUJD' });
  });
  assert.equal(seen.url, 'https://api.openai.com/v1/images/generations');
  assert.equal(seen.init.headers.Authorization, 'Bearer sk-test');
  assert.equal(seen.body.model, 'gpt-image-2.5-flare');
  assert.equal(seen.body.size, '1024x1024');
  assert.equal(seen.body.quality, 'high');
  assert.equal(seen.body.n, 1);
});

test('the server adds the copyright guardrail if the prompt lacks it', async () => {
  let sent;
  const fake = async (url, init) => {
    sent = JSON.parse(init.body).prompt;
    return okResponse();
  };
  await withServer(fake, async (base) => {
    await post(base, { apiKey: 'k', model: 'm', prompt: 'a hero' });
    await post(base, { apiKey: 'k', model: 'm', prompt: `a hero\n\n${GUARDRAIL}` });
  });
  assert.equal(sent.split(GUARDRAIL).length - 1, 1, 'guardrail appears exactly once');
});

test('OpenAI errors pass through with their own status and message', async () => {
  const fake = async () => new Response(
    JSON.stringify({ error: { message: 'Incorrect API key provided: sk-bad.', type: 'invalid_request_error' } }),
    { status: 401 },
  );
  await withServer(fake, async (base) => {
    const res = await post(base, { apiKey: 'sk-bad', model: 'm', prompt: 'p' });
    assert.equal(res.status, 401);
    assert.deepEqual(await res.json(), { error: { status: 401, message: 'Incorrect API key provided: sk-bad.' } });
  });
});

test('a network failure is reported as a 502', async () => {
  const fake = async () => { throw new Error('getaddrinfo ENOTFOUND api.openai.com'); };
  await withServer(fake, async (base) => {
    const res = await post(base, { apiKey: 'k', model: 'm', prompt: 'p' });
    assert.equal(res.status, 502);
    const body = await res.json();
    assert.match(body.error.message, /ENOTFOUND/);
  });
});

test('missing fields are rejected before calling OpenAI', async () => {
  let called = false;
  const fake = async () => { called = true; return okResponse(); };
  await withServer(fake, async (base) => {
    const res = await post(base, { model: 'm' });
    assert.equal(res.status, 400);
    assert.match((await res.json()).error.message, /API key.*prompt/);
  });
  assert.equal(called, false);
});
