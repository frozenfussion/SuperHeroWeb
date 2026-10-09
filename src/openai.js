// Calls OpenAI's image generation endpoint and reports errors exactly as OpenAI sent them.
import { GUARDRAIL } from '../public/js/config.js';

export const IMAGES_URL = 'https://api.openai.com/v1/images/generations';
const REQUEST_TIMEOUT_MS = 5 * 60 * 1000; // image generation can be slow

// Turns an error response from OpenAI into a readable message, keeping OpenAI's own words.
function messageFromBody(text, status) {
  try {
    const json = JSON.parse(text);
    if (json && json.error && json.error.message) return json.error.message;
  } catch {
    // not JSON, fall through
  }
  return text.trim() || `OpenAI returned HTTP ${status} with no message.`;
}

export async function generateImage({ apiKey, model, prompt, quality, fetchImpl = fetch }) {
  // Safety net: the guardrail is guaranteed even if a client skipped it.
  const finalPrompt = prompt.includes(GUARDRAIL) ? prompt : `${prompt}\n\n${GUARDRAIL}`;

  let response;
  try {
    response = await fetchImpl(IMAGES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt: finalPrompt,
        n: 1,
        size: '1024x1024',
        quality: quality || 'auto',
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    return { ok: false, status: 502, message: `Could not reach OpenAI: ${err.message}` };
  }

  const text = await response.text();
  if (!response.ok) {
    return { ok: false, status: response.status, message: messageFromBody(text, response.status) };
  }

  let item;
  try {
    item = JSON.parse(text).data[0];
  } catch {
    return { ok: false, status: 502, message: `OpenAI sent a response this app could not read: ${text.slice(0, 300)}` };
  }
  if (item && item.b64_json) return { ok: true, image: `data:image/png;base64,${item.b64_json}` };
  if (item && item.url) return { ok: true, image: item.url };
  return { ok: false, status: 502, message: 'OpenAI answered without an image.' };
}
