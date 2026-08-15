# Test case best practices — enforced by /qa-case

Every generated case MUST satisfy every rule below. Cases that fail the checklist do not go into the output.

## Structure

- **Atomic** — tests ONE behavior. If the title contains "and", split into two cases.
- **Independent** — no dependency on the order or state left by another case. Preconditions must be explicit and self-contained.
- **Deterministic** — no "sometimes", "usually", "might". Same input → same expected output.
- **Traceable** — unique ID with feature prefix (e.g. `SEARCH-03`), 2-digit zero-padded, never reused across runs.

## Steps

- Numbered, imperative ("Click X", "Type Y in Z field") on a single line for the spreadsheet cell
- Reference concrete UI elements by visible label or URL — no CSS/XPath in the case text
- No implementation details ("call API...", "trigger the reducer") — user-visible actions only
- No verification inside steps — verification lives in "Expected Result"
- No skipped context: if the case needs a logged-in user, that goes in Preconditions, not step 1

## Expected result

- ONE observable outcome per case (or a tightly coupled cluster like "toast appears with text X AND URL changes to /Y")
- Concrete and checkable: "Login button becomes disabled" — NOT "form should behave correctly"
- Describes what the user sees, not internal state

## Test data

- Explicit values when they drive the outcome (`email: qa+dupe@example.com`, `quantity: -1`, `password: 7chars!`)
- Mark equivalence classes when any value in the class works: `<any valid email>`, `<random 33-char string>`, `<any P1 category>`
- Never leave data implicit if it determines pass/fail
- **For text-search inputs**: cover Polish diacritics with case-insensitivity (`łódź` → `Łódź`) **AND diacritic-stripped variant if spec allows** (`lodz` → `Łódź` — częsty PL UX pattern, użytkownicy piszą bez ogonków na klawiaturze angielskiej / mobile; wymaga explicit backend normalization typu Postgres `unaccent` / Elasticsearch `asciifolding`; potwierdź w spec czy produkt to obiecuje zanim uznasz brak dopasowania za bug) and real-world special chars from the actual dataset (`"quoted names"`, `Filia; XYZ`, `AGH im. St. Staszica`). **Bundle them into one edge case, not one case per character.**
- **URL params as attack surface**: for any URL-driven state (search, filter, pagination), include at least one case with a value injected directly in the URL — script tags (`?search=<script>alert(1)</script>`), invalid types (`?limit=abc`, `?offset=-1`), null bytes, extreme lengths. Backend must sanitize / reject gracefully — no crash, no reflected XSS, no leaked stack trace. Can be bundled with another edge case.

## Coverage — for every feature, aim to cover

- **Positive** — happy path with valid data (at least 1 case)
- **Negative** — invalid data, missing required fields, wrong types, wrong permissions (at least 2 cases)
- **Edge** — boundary values (0, max, max+1, empty, unicode/emoji, whitespace, very long input) (at least 1 case). For search/filter inputs: 1–2 edges bundling several conditions (e.g. diacritics + case + special chars in one query) beat 5–8 cases each testing one condition
- **State** — logged-in vs logged-out, different roles — only if relevant to the feature
- **UI** — responsive breakpoint, keyboard navigation — only if in scope. For responsive: pick **2–3 representative breakpoints** (mobile ~375px, tablet ~768px, desktop ≥1280px) — 1 case per breakpoint that exercises core layout + interaction. **Do not enumerate feature × device matrix** (5 features × 4 devices = 20 case rozdmuchanie).

If a category is excluded by anti-scope, skip it silently. If a category is in scope but has no meaningful case, note it in the Brief.

> **Legal note (gov / regulated sites):** for Polish `.gov.pl` sites, **WCAG 2.2 AA** is a legal requirement (Ustawa o dostępności cyfrowej). For other jurisdictions check local law (EU EAA 2025, US ADA, UK PSBAR). If accessibility is in scope, include at least one a11y case per major feature (keyboard-only path, ARIA labels, `aria-live` for dynamic content). If out of scope for this run, state explicitly in Brief that a11y is covered by a separate dedicated run.

### Manual WCAG 2.2 AA checks (Playwright can't verify these)

When a11y is in scope, Playwright covers DOM/ARIA/keyboard programmatically (see INST-10/11 pattern). The following require human eyes, real screen reader, or DevTools — do them manually alongside automated cases:

**Perceivable**
- **Contrast** (1.4.3 / 1.4.11) — text ≥ 4.5:1, UI components ≥ 3:1. Tool: axe DevTools / Chrome DevTools contrast checker
- **Reflow at 320px** (1.4.10) — resize window to 320×256, verify no horizontal scroll and no lost content
- **Text resize 200%** (1.4.4) — browser zoom to 200%, verify no clipped text
- **Info by color only** (1.4.1) — grayscale the page (DevTools → Rendering → Emulate vision deficiencies), check state/meaning still visible

**Operable**
- **Keyboard-only path** (2.1.1) — unplug mouse, Tab through and complete a full flow (search + filter + open result) using only keyboard
- **No keyboard trap** (2.1.2) — for every combobox / accordion / modal: Tab in AND Tab out
- **Focus visible** (2.4.7) — every focused element has a clearly visible outline / ring
- **Focus order matches visual order** (2.4.3) — Tab order follows layout top-to-bottom, left-to-right
- **Target size ≥ 24×24 CSS px** (2.5.8 — new in WCAG 2.2) — small icon buttons (close, remove filter chip) must not be smaller

**Understandable**
- **Form errors clear** (3.3.1) — invalid input shows specific text error near the field, not just red border
- **Consistent help** (3.2.6 — new in WCAG 2.2) — help/support links in the same relative location across pages
- **Redundant entry avoided** (3.3.7 — new in WCAG 2.2) — app doesn't ask for the same info twice in the same session

**Real assistive tech smoke**
- **Screen reader** — VoiceOver (macOS `⌘F5`) or NVDA (Windows), navigate the search flow: every action produces meaningful audio (button labels announced, filter changes announced via `aria-live` region)

A full WCAG 2.2 AA audit is a separate exercise (dedicated run + tools like axe-core / Lighthouse / Accessibility Insights). This checklist is the minimum manual coverage that automation cannot replace.

## Priorities inside the run

- Inherit the feature's priority for happy path cases
- Negative/edge cases: usually one step lower (P1 feature → P2 negatives) unless the negative case covers a security or data-loss risk (then match feature priority)

## Anti-patterns — never produce these

- "Verify that the page works" — untestable, no observable outcome
- Multi-assertion bundle: "click, verify A, click, verify B" — split
- Preconditions that lie: "user is on homepage" when the steps don't guarantee it
- Steps that assume UI state left by a previous case
- Cases that only make sense if run in a specific order
- IDs reused from a previous run
- "Should not crash" as the sole expected result — describe what SHOULD happen instead
