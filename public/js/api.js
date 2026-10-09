// Talks to our own backend. The backend forwards the request to OpenAI.
// Resolves to { image } on success, or { error: { status, message } } with OpenAI's own message.
export async function generate({ apiKey, model, quality, prompt }) {
  let response;
  try {
    response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, model, quality, prompt }),
    });
  } catch (err) {
    return { error: { status: 0, message: `Could not reach the Superhero Maker server: ${err.message}` } };
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    // body stays null
  }

  if (response.ok && body && body.image) return { image: body.image };
  if (body && body.error) return { error: body.error };
  return { error: { status: response.status, message: `Unexpected response from the server (HTTP ${response.status}).` } };
}
