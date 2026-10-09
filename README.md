# Superhero Maker

Build a superhero from a few choices, then forge an image of it with OpenAI's image models.
A learning project for demonstrating coding harnesses.

## How it works

1. You pick options on four screens (Who, Costume, Power, World).
2. The Forge screen adds a free-text twist and shows the exact prompt.
3. The browser sends the prompt, model and API key to this app's backend (`POST /api/generate`).
4. The backend forwards the request to OpenAI and returns the image, or OpenAI's error message unchanged.

The API key is typed into Settings and stored as plain text in the browser's localStorage. The backend does not store or log it.

## Requirements

- Node.js 22 or newer (24 LTS recommended)

## Run it

```bash
npm install
npm start
```

Open http://127.0.0.1:3000.

| Variable | Default | Meaning |
|---|---|---|
| `PORT` | `3000` | Port to listen on |
| `HOST` | `127.0.0.1` | Address to bind to |

## Test it

```bash
npm test
```

The tests use Node's built-in test runner and a fake OpenAI, so they need no network and no API key.

## Settings

- **API key:** your OpenAI key.
- **Image model:** a hard-coded list (`gpt-image-2.5-sunburst`, `gpt-image-2.5-flare`, `gpt-image-2`) plus a custom model ID. Edit the list in `public/js/config.js`.
- **Quality:** the options depend on the selected model. Images are always 1024 × 1024.
- **Prompt:** edit the master template and the wording for each art style. The copyright guardrail is always appended and cannot be removed.

## Project layout

```
server.js          starts the server
src/app.js         Express app and the /api/generate route
src/openai.js      the call to OpenAI's image endpoint
public/            the browser app (HTML, CSS, plain JavaScript modules)
  js/config.js     options, models, default prompt and style wording
  js/prompt.js     builds the final prompt
  js/app.js        the five screens
  js/settings.js   the Settings drawer and saved settings
  js/api.js        calls the backend
test/              Node test runner tests
```
