import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateImage } from './openai.js';

const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

// fetchImpl is injectable so the tests can run without calling OpenAI.
export function createApp({ fetchImpl = fetch } = {}) {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.use(express.static(publicDir));

  app.get('/api/health', (req, res) => res.json({ ok: true }));

  app.post('/api/generate', async (req, res) => {
    const { apiKey, model, prompt, quality } = req.body || {};
    const missing = [];
    if (!apiKey || !String(apiKey).trim()) missing.push('API key');
    if (!model || !String(model).trim()) missing.push('model');
    if (!prompt || !String(prompt).trim()) missing.push('prompt');
    if (missing.length) {
      return res.status(400).json({ error: { status: 400, message: `Missing: ${missing.join(', ')}.` } });
    }

    const result = await generateImage({
      apiKey: String(apiKey).trim(),
      model: String(model).trim(),
      prompt: String(prompt),
      quality,
      fetchImpl,
    });

    if (!result.ok) {
      return res.status(result.status).json({ error: { status: result.status, message: result.message } });
    }
    res.json({ image: result.image });
  });

  return app;
}
