import { createApp } from './src/app.js';

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '127.0.0.1';

createApp().listen(port, host, () => {
  console.log(`Superhero Maker running at http://${host}:${port}`);
});
