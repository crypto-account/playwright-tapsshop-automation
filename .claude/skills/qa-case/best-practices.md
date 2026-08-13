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
- **For text-search inputs**: cover Polish diacritics + case-insensitivity (`łódź` → `Łódź`) and real-world special chars from the actual dataset (`"quoted names"`, `Filia; XYZ`, `AGH im. St. Staszica`). **Bundle them into one edge case, not one case per character.**

## Coverage — for every feature, aim to cover

- **Positive** — happy path with valid data (at least 1 case)
- **Negative** — invalid data, missing required fields, wrong types, wrong permissions (at least 2 cases)
- **Edge** — boundary values (0, max, max+1, empty, unicode/emoji, whitespace, very long input) (at least 1 case). For search/filter inputs: 1–2 edges bundling several conditions (e.g. diacritics + case + special chars in one query) beat 5–8 cases each testing one condition
- **State** — logged-in vs logged-out, different roles — only if relevant to the feature
- **UI** — responsive breakpoint, keyboard navigation — only if in scope

If a category is excluded by anti-scope, skip it silently. If a category is in scope but has no meaningful case, note it in the Brief.

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
