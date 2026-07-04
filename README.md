# Playwright E2E Automation — TapsShop

[![Playwright Tests](https://github.com/crypto-account/playwright-tapsshop-automation/actions/workflows/playwright.yml/badge.svg)](https://github.com/crypto-account/playwright-tapsshop-automation/actions/workflows/playwright.yml)
[![Playwright](https://img.shields.io/badge/Playwright-1.59-45ba4b?logo=playwright)](https://playwright.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

End-to-end test automation for **[tapsshop.pl](https://tapsshop.pl/)** — a WooCommerce test shop — using **Playwright + JavaScript** with the **Page Object Pattern**. Includes matrix cross-browser CI, tag-based test selection, nightly regression, and GitHub Pages report publishing.

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

## License

ISC
