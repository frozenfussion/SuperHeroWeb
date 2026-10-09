# SuperHeroWeb demo deployment

Owner: Faysal Aziz <faysalabdulaziz@gmail.com>
Prepared: 2026-10-09
Goal: Get the existing demo running at https://superhero.faysalaziz.com with the smallest dependable setup.

## Target

| Item | Value |
| --- | --- |
| Repository | https://github.com/frozenfussion/SuperHeroWeb |
| Reviewed default branch | claude/focused-ptolemy-qabbvq |
| Droplet | DigitalOcean; hostname superhero; x86-64 |
| OS | Ubuntu 24.04.5 LTS |
| Runtime user | aziz (existing non-root sudo user) |
| Project directory | /home/aziz/projects/superhero |
| Public hostname | superhero.faysalaziz.com |
| Expected IPv4 | 152.42.188.203 |
| App listener | 127.0.0.1:3000 |
| App service | superhero.service |
| Reverse proxy | Caddy, with automatic HTTPS |

The hostname and IP come from Aziz's supplied DNS screenshot. Verify live DNS on the Droplet; screenshot evidence does not establish propagation.

## Verified repository behavior

- Node.js ES modules and Express 5; package.json requires Node >=22. Prefer Node 24 LTS.
- Start command: npm start (node server.js). There is no compilation or frontend build step.
- package-lock.json is present. Install the locked runtime dependencies with npm ci --omit=dev, as aziz.
- server.js already accepts HOST and PORT and defaults to 127.0.0.1:3000.
- Express serves public/ and provides GET /api/health, returning {"ok":true}.
- POST /api/generate forwards image-generation requests to OpenAI. Missing required fields produce HTTP 400.
- The browser calls /api/generate on the same origin. Proxy the entire site to Express, including /api/*.
- The user enters an OpenAI API key in Settings. The existing app stores it in browser localStorage and passes it to the backend; no server-side API key or .env file is required.
- The backend allows up to five minutes for image generation. Do not introduce a shorter proxy timeout.
- The app has no database, server-side image storage, migrations, bundler, or required background worker.

## Deployment procedure

1. Work only in /home/aziz/projects/superhero. Check the current directory before changing anything.
   - If it is not a Git checkout and is empty, clone the repository directly into it with gh repo clone frozenfussion/SuperHeroWeb .
   - Do not create an additional SuperHeroWeb subfolder.
   - If it contains an existing checkout, verify its origin and preserve local changes. If it contains unrelated files, stop and report them instead of deleting or overwriting them.
   - Use the repository's actual default branch; do not assume main exists.
2. Read this file, README.md, package.json, server.js, and src/app.js in the checkout.
3. Check Node/npm, Caddy, port availability, and current Caddy configuration. Reuse compatible installed software.
   - If Node is missing or incompatible, install Node 24 LTS using a maintained installation source and verify node --version and npm --version.
   - Determine the actual absolute Node executable path. systemd must not depend on an interactive shell, .bashrc, or a version-manager activation command.
   - Install Caddy from its official stable Ubuntu package repository if absent.
   - Refresh apt indexes only when needed for a newly added repository; do not perform a full OS upgrade.
4. Run npm ci --omit=dev as aziz in the project directory. Do not invent a build command or run npm audit fix.
5. Create /etc/systemd/system/superhero.service with these requirements:
   - User=aziz
   - WorkingDirectory=/home/aziz/projects/superhero
   - Environment=NODE_ENV=production
   - Environment=HOST=127.0.0.1
   - Environment=PORT=3000
   - ExecStart=<the verified absolute Node executable> /home/aziz/projects/superhero/server.js
   - Restart=on-failure and RestartSec=3
   - Start after network.target and enable under multi-user.target.
   - Use the standard journal for logs. Enable and start the service so it survives SSH logout and is configured to start at boot.
6. Back up an existing Caddyfile before editing it. Preserve any unrelated site blocks. Add this site block to /etc/caddy/Caddyfile:

   ~~~caddyfile
   # Let Caddy obtain and renew the certificate for this demo hostname.
   superhero.faysalaziz.com {
       # Send both browser assets and API calls to the existing Express app.
       reverse_proxy 127.0.0.1:3000
   }
   ~~~

   Validate the Caddy configuration, then reload its running service. Enable Caddy at boot.
7. Confirm the A record resolves to the expected IPv4 and check for an incompatible AAAA record if HTTPS issuance fails.
   - Caddy needs inbound TCP 80 and 443.
   - If UFW is active, add the required web rules while preserving SSH access. Do not enable, reset, or disable a firewall unnecessarily.
   - Keep port 3000 bound to loopback; do not expose it publicly.
   - If a DigitalOcean Cloud Firewall blocks access, report the exact required rules for Aziz to apply. Do not claim success while HTTPS is blocked.

## Minimum verification

Perform these checks once; investigate further only if something fails.

- superhero and caddy services are active and enabled. Check the app's journal for startup failures.
- http://127.0.0.1:3000/api/health and https://superhero.faysalaziz.com/api/health both return HTTP 200 and {"ok":true}.
- HTTPS uses a valid publicly trusted certificate; verify without curl -k. HTTP redirects to HTTPS.
- The public homepage, /css/app.css, and /js/app.js load successfully through Caddy.
- POST an empty JSON object to the public /api/generate endpoint. It must return HTTP 400 with the existing missing-field message, not 404 or 502. This check requires no API key and incurs no image-generation charge.
- If browser tooling is already available, quickly check the Who, Costume, Power, World, and Forge screens, Back/Next navigation, Settings, and prompt preview. Do not install a browser test framework for this task.
- A real generated image requires a valid user-supplied API key and access to the selected model. If no key is available, state that real generation remains for Aziz's browser check; do not pretend it was tested or ask for a key in chat.

## Scope and completion

This is a demo deployment. Keep the existing UI, prompt behavior, model options, API-key workflow, and guardrail. Fix only concrete blockers that prevent the requested deployment from working.

Do not add Docker, PM2, a database, login, CI/CD, staging, monitoring, a new test suite, load testing, deployment frameworks, or unrelated refactors. Skip the existing unit-test suite for this deployment; use the minimum live checks above. Do not reboot the Droplet.

Use sudo for package installation and system service/configuration changes only. If sudo needs interactive input, give Aziz the exact blocked command and continue whatever work is independent of it.

Record brief actual deployment results and start/stop/restart/log commands in DEPLOYMENT_NOTES.md after deployment. Never include credentials. If a local Git commit is needed, use repository-local identity Faysal Aziz <faysalabdulaziz@gmail.com>; do not change global Git identity or push additional deployment edits unless requested.

Finish with the working URL, service status, essential management commands, and any unverified browser or real-generation check. Stop once these acceptance checks pass.
