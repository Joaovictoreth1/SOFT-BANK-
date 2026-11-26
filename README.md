# Soft Bank

Site demonstrativo de uma empresa fictícia de maquininhas de cartão e conta digital.

Soft Bank is a Brazilian Portuguese landing page, not a financial service. It has
no backend, database, authentication, payments, or ordering. The primary call to
action lands on an explanation; unavailable account, app-store, and social links
cannot be activated.

## Architecture

- `src/index.html` is the single document. It includes the product, app demo,
  FAQ and order-information sections. Navigation uses in-page anchors.
- `src/styles/main.css` and `tailwind.config.js` define the responsive layout
  and visual theme. Fonts and the regular, bold and fill Phosphor icon weights
  are bundled locally. License notices ship at `/third-party-licenses.txt`.
  The page makes no requests to third-party hosts.
- `src/js/main.js` adds progressive visual effects, the quick navigation behavior,
  and an accessible single-open FAQ. It also respects system motion preferences.
- Vite emits static files in `dist/`, with content-hashed JavaScript, CSS and
  font assets. The icon and crawler instructions are copied from `src/public/`.
- `nginx.conf` serves the build with security headers, compression and caching.
  The production container has no Node.js runtime or credentials.

## Develop and verify

Use Node.js 24 LTS (Node.js 22.12+ is also supported), npm and, optionally, Make.
On Linux machines without Chromium system packages, substitute
`npx playwright install --with-deps chromium` for the browser install.

```sh
npm ci
npx playwright install chromium
npm run dev
```

| Command                                   | Purpose                                                                                                             |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                             | Serve source with Vite hot reload.                                                                                  |
| `npm run build`                           | Build production files in `dist/`.                                                                                  |
| `npm run preview`                         | Serve the built files locally with the production security headers.                                                 |
| `npm run lint` / `npm run lint:html`      | Check JavaScript and HTML.                                                                                          |
| `npm run typecheck`                       | Check application JavaScript in TypeScript strict mode.                                                             |
| `npm run format` / `npm run format:check` | Write or verify Prettier formatting.                                                                                |
| `npm test`                                | Exercise a fresh build in Playwright Chromium. Run the build first.                                                 |
| `npm run check`                           | Run lint, formatting, HTML validation, strict type checking, build, browser tests and the runtime dependency audit. |

`make install`, `make dev`, `make build`, `make lint`, `make test`,
`make check`, and `make docker` are shortcuts. No environment variables or
`.env` file are required. There are no API endpoints or migrations.

The browser suite checks desktop and mobile navigation, FAQ state and keyboard
interaction, reduced motion, the local fonts, CSP enforcement and serious or
critical axe violations. GitHub Actions runs the aggregate check, audits the
full dependency tree, and builds the container on every push and pull request.

## Deploy

```sh
docker compose up --build
curl -I http://localhost:8080/
```

The Compose service binds port 8080 to loopback, drops Linux capabilities and
runs with a read-only filesystem and a writable temporary directory. For
production, run it behind an HTTPS reverse proxy or ingress; expose the TLS port
at the proxy and redirect HTTP to HTTPS. Do not expose the internal HTTP listener
directly. Alternatively, serve `dist/` at the root of a static host and port the
header and caching rules from `nginx.conf` to the provider's configuration.

The CSP accepts only same-origin JavaScript, styles and fonts; only images can
use data URLs (for the built-in grain effect). It disables framing, forms and
base URL changes. Nginx also sets HSTS (enforced by browsers over HTTPS),
`nosniff`, a no-referrer policy and a restrictive permissions policy. HTML and
unhashed files revalidate; successful hashed asset responses cache for a year.
Missing files return 404, not a copy of the landing page.
