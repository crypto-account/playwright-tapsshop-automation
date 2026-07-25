# Playwright E2E Automation — TapsShop

[![Playwright Tests](https://github.com/crypto-account/playwright-tapsshop-automation/actions/workflows/playwright.yml/badge.svg)](https://github.com/crypto-account/playwright-tapsshop-automation/actions/workflows/playwright.yml)
[![Playwright](https://img.shields.io/badge/Playwright-1.59-45ba4b?logo=playwright)](https://playwright.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

End-to-end test automation for **[tapsshop.pl](https://tapsshop.pl/)** — a WooCommerce test shop — using **Playwright + JavaScript** with the **Page Object Pattern**.

## Stack

- **Playwright** `^1.59` — cross-browser E2E test framework
- **Node.js** — LTS
- **JavaScript** (CommonJS)
- **Page Object Pattern** — `pages/`
- **CI:** GitHub Actions (matrix chromium/firefox/webkit, cache, HTML report on GH Pages, Slack notifications)
- **CI (optional):** Jenkins (Docker-based pipeline — see `Jenkinsfile`)

## Project layout

```
.
├── pages/                              # Page Object classes
│   ├── TapsShopHomePage.js
│   └── TapsShopShopPage.js
├── tests/                              # Playwright specs
│   ├── homepage/                       # TS-01 Strona Główna
│   ├── catalog/                        # TS-02 Katalog Produktów
│   ├── seed.spec.ts                    # placeholder for Playwright MCP agents
│   └── tapsshop-test-plan.md           # full test plan (10 suites, 46 test cases)
├── playwright.config.js
├── package.json
└── .github/workflows/playwright.yml    # CI pipeline
```

## Test coverage

Currently implemented: **6 tests** across 2 suites.

| Suite | Test cases | Focus |
|---|---|---|
| **TS-01** Strona Główna | TC-01-01 … TC-01-05 | Homepage load, banner, navigation, cart counter, product link |
| **TS-02** Katalog Produktów | TC-02-01 | Product listing on shop page |

Full 46-scenario test plan documented in [`tests/tapsshop-test-plan.md`](tests/tapsshop-test-plan.md).

### Test tagging strategy

Tests are tagged to run different subsets at different CI stages:

| Tag | Purpose | Count | Typical duration |
|---|---|---|---|
| `@smoke` | Critical happy path — blocks PR merge | 4 | ~2-3 min |
| `@regression` | Full suite — runs on main / nightly | 6 | ~5-7 min |

**Tagged tests:**
- `@smoke @regression`: TC-01-01, TC-01-03, TC-01-04, TC-02-01 (homepage, nav, cart, listing)
- `@regression`: TC-01-02, TC-01-05 (banner dismiss, product link)

## Running locally

```bash
# install
npm ci
npx playwright install --with-deps

# run all tests (headless, all browsers)
npm test

# run by tag
npm run test:smoke           # @smoke — critical path only, chromium
npm run test:regression      # @regression — full suite, all browsers

# run in headed mode with UI
npm run test:headed
npm run test:ui

# run specific suite
npm run test:homepage
npm run test:catalog

# open HTML report
npm run report
```

## CI/CD

### GitHub Actions — trigger matrix

Different suites run on different triggers — following mature CI/CD practice:

| Trigger | What runs | Browsers | Blocking? | Rationale |
|---|---|---|---|---|
| **Pull Request** | `@smoke` only | chromium | ✅ Yes | Fast (~3 min) gate before merge |
| **Push to `main`** | Full suite | chromium + firefox + webkit | ✅ Yes | Full verification after merge |
| **Nightly cron (02:00 UTC)** | Full suite | chromium + firefox + webkit | ⏰ Scheduled | Catches regressions overnight |
| **Manual dispatch** | Configurable (grep input) | chromium + firefox + webkit | 🤖 Manual | Debug / re-run on demand |

**What the pipeline does:**
- **Matrix strategy** — parallel jobs for chromium/firefox/webkit (except PR)
- **Caching** — `npm ci` cache + Playwright browsers cache (per version)
- **Concurrency control** — `cancel-in-progress` avoids duplicate runs on rapid pushes
- **HTML report** — uploaded as artifact per browser (14-day retention)
- **GitHub Pages** — chromium report auto-published on `main` push → live link
- **Slack notification** — status + trigger type + links to run

**GitHub Pages URL for latest report:**
> https://crypto-account.github.io/playwright-tapsshop-automation/

### Jenkins (see `Jenkinsfile`)

Local Docker-based demo pipeline showcasing:
- Declarative pipeline
- Docker-based Playwright execution
- HTML Publisher plugin for reports
- Slack notification via credentials

Run locally:
```bash
docker-compose up -d
# open http://localhost:8080
```

## Conventions

- **Page Object Pattern** — each page = one class in `pages/`, locators in constructor, methods per action
- **File naming** — tests: `tests/<suite>/tc-XX-YY-<slug>.spec.js`
- **Locators** — role-based first (`getByRole`, `getByLabel`, `getByText`) → CSS → XPath as last resort
- **Assertions** — web-first (`await expect(locator).toXxx()`) with auto-waiting

## Test plan document

Detailed scenarios (46 test cases across 10 suites) are documented in [`tests/tapsshop-test-plan.md`](tests/tapsshop-test-plan.md), including:
- Homepage, catalog, search, product details
- Cart operations, checkout flow
- User account (login, register, forgot password)
- Info pages, form validations, responsive/UI

Generated using AI-assisted exploration (Playwright MCP + Claude Code).

## Utilities

### Chat load generator — `scripts/chat-loadgen.js`

Standalone browser-side script for load-testing a Matrix/PhoneHQ-style chat composer. Sends N messages via the app's normal send path (composer input + send button), mixing plain text, real photos (Picsum) or generated JPEG noise, real MP4 videos, and PDF files — all fetched from public CORS-friendly CDNs.

**Setup:** open the chat page, DevTools console (⌥⌘J / F12), paste the contents of `scripts/chat-loadgen.js`, press Enter. You should see `[chatLoad] ready`.

**Basic examples:**

```js
// 20 text messages
await chatLoad.sendLoop({ count: 20, prefix: 'NG' })

// 50 messages, real photo (Picsum) every 5th
await chatLoad.sendLoop({ count: 50, imageEvery: 5, prefix: 'NG' })

// Full mix: image every 5, PDF file every 10, MP4 video every 15
await chatLoad.sendLoop({ count: 30, imageEvery: 5, fileEvery: 10, videoEvery: 15, prefix: 'NG' })

// Use locally generated noise images instead of Picsum
await chatLoad.sendLoop({ count: 20, imageEvery: 5, imageSource: 'noise', prefix: 'NG' })

// Continue numbering from where you left off
await chatLoad.sendLoop({ count: 20, startIndex: 51, prefix: 'NG' })
```

**Two-user live test** (send/receive between accounts):
1. Open the chat in a second browser profile / incognito window
2. Log in as the other user
3. Paste the script there, run with a different `prefix` (e.g. `'MH'`)

**Attachment pools** (all CORS-friendly, cached per tab after first fetch):
- **Video** — friday.mp4 (503 KB) → flower.mp4 (1.1 MB) → BigBuckBunny.mp4 (5.4 MB), H.264 + audio, rotated
- **File** — tracemonkey PDF (992 KB) → helloworld PDF (1 KB), rotated
- **Image** — Picsum.photos (real random photos, ~200–700 KB each) OR locally generated noise JPEG

**Precedence** when an iteration matches multiple thresholds: `video > file > image`.

**Options** (full list in the script header):

| Option | Default | Purpose |
|---|---|---|
| `count` | — (required) | Total messages to send |
| `imageEvery` | `0` | Send image every Nth message (`0` = never) |
| `fileEvery` | `0` | Send file every Nth message; overrides image on collision |
| `videoEvery` | `0` | Send video every Nth message; overrides image + file |
| `imageSource` | `'picsum'` | `'picsum'` = real photos, `'noise'` = local canvas noise |
| `prefix` | `'MSG'` | Message label prefix, e.g. `'NG'` → `NG-01: ...` |
| `startIndex` | `1` | Number to start counting from |
| `delayMs` | `200` | Pause between sends |
| `words` | built-in list | Custom word pool for random text |
| `imageOptions` | `{width:1600,height:1200,quality:0.85}` | JPEG size/quality (used only for `imageSource:'noise'`) |
| `videoUrl` | — | Override pool with a specific URL |
| `fileUrl` | — | Override pool with a specific URL |

Returns `{ sent, failed, images, files, videos, first, last, results }`.

> Note: this utility targets a specific composer (`#mention-text-input` + Lucide send icon). Selectors are Matrix/PhoneHQ-specific and won't work on other chat apps without adaptation.

## License

ISC
