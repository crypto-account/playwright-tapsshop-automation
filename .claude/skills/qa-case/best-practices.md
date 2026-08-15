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
- **UI-driven, not URL-driven**: Kroki opisują akcje w interfejsie (wpisanie frazy w pole, klik przycisku, zaznaczenie checkboxa), nie skróty przez URL query params. Krok 1 = zawsze `Otwórz <base-URL>` **bez query params**; kolejne kroki symulują co user rzeczywiście robi w UI (typing, clicking, selecting). Case ma być manualnie odtwarzalny przez testera bez ręcznego konstruowania URL-i. Wyjątki dozwolone:
  1. **URL to przedmiot testu** — deep-link scenario, param injection, XSS w URL: URL z parametrami idzie do Kroków, w Notatki dopisz „URL jest przedmiotem testu"
  2. **Setup shortcut do trudnego stanu** — np. „paginate do ostatniej strony" = ~130 kliknięć: URL shortcut OK POD WARUNKIEM że sama interakcja jest przetestowana w innym case; w Notatkach: „URL jako skrót do stanu; interakcja pokryta w INST-XX"

## Expected result

- ONE observable outcome per case (or a tightly coupled cluster like "toast appears with text X AND URL changes to /Y")
- Concrete and checkable: "Login button becomes disabled" — NOT "form should behave correctly"
- Describes what the user sees, not internal state

## Test data

- Explicit values when they drive the outcome (`email: qa+dupe@example.com`, `quantity: -1`, `password: 7chars!`)
- Mark equivalence classes when any value in the class works: `<any valid email>`, `<random 33-char string>`, `<any P1 category>`
- Never leave data implicit if it determines pass/fail
### Text-search inputs — consolidated edge checklist

Every text-search input MUST have coverage for the 8 patterns below. **Bundle into 1–2 edge cases, not one case per pattern** (equivalence-class discipline — see Coverage → Edge). Cross-cutting note: patterns 5 and 8 apply to filters and pagination too, not just search.

1. **Puste zapytanie** — `?search=` or empty input; expected: full unfiltered list OR explicit rejection with clear message
2. **Fraza bez wyników** — nonsense string (`nieistniejaca_xyz123`); expected: empty state with clear message („Brak danych"), counter = 0
3. **Polskie diakrytyki + case-insensitivity** — `łódź` = `ŁÓDŹ` (same count); optional diacritic-stripped `lodz` → `Łódź` **only if spec promises normalization** (Postgres `unaccent` / Elasticsearch `asciifolding` — częsty PL UX pattern dla użytkowników bez polskiej klawiatury / mobile; potwierdź w spec zanim uznasz brak dopasowania za bug)
4. **Znaki specjalne z realnego datasetu** — `"quoted"`, `Filia; XYZ`, `AGH im. St. Staszica`; always pick from actual data, don't fabricate
5. **Bardzo długi ciąg** — 500+ chars random; expected: no crash, graceful truncation OR „no match"
6. **Spacje wiodące/końcowe** — `"  Vistula  "`; expected: trim → same result as `"Vistula"`
7. **Różna wielkość liter** — `vistula` = `VISTULA` = `Vistula` (same count)
8. **URL param injection** — `?search=<script>alert(1)</script>`, `?limit=abc`, `?offset=-1`, null bytes, extreme lengths; expected: sanitized / graceful rejection, no reflected XSS, no stack trace, no crash. **Applies to filters and pagination too**

**Recommended bundling**: 1 case łączy patterns 3+4+6+7 (natural input variance) + 1 case łączy patterns 5+8 (attack surface). Patterns 1, 2 usually as separate negative cases with dedicated empty-state assertions.

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
