---
name: qa-case
description: Generate test cases + execute them live via Playwright MCP + emit a styled XLSX report. Use when the user wants to author + run + report on a specific feature in one pass.
---

Author test cases for ONE feature, execute them immediately in a real browser, and produce a styled Excel workbook + human-readable markdown + raw TSVs.

## Output

Four files in `qa-runs/`, all sharing the base slug `<feature-slug>-<YYYY-MM-DD>`:

1. `<slug>.xlsx` — **the primary deliverable for the spreadsheet consumer**. Two sheets: `Test cases` and `Execution report`. Styled header (deep-blue #305496 bar, white bold, frozen row 1), wrap-text on long cells, zebra striping, color-coded Priority / Type / Status / Severity columns, thin gray borders, sensible column widths. Opens natively in Excel and Google Sheets — no import wizard needed.
2. `<slug>.md` — the human-readable deliverable. Brief + both TSV blocks inline for editor / preview reading (single-line steps).
3. `<slug>-cases.tsv` — raw TSV (multi-line quoted per RFC 4180). Kept for diff-ability in git and for users who prefer to import into Google Sheets via `File → Import`.
4. `<slug>-report.tsv` — raw TSV of the execution report. Same rationale.

The `.xlsx`, `.md`, and both `.tsv` files carry the same rows — three presentations of the same data.

## Steps

### 1. Collect minimum inputs — ONE message, five questions

Ask the user, then stop:
- **URL** of the page under test
- **Feature name** (short — will be slugified for the filename)
- **User story** — 1–2 sentences ("As a X, I want Y so that Z")
- **Priority** — P1 / P2 / P3
- **Anti-scope** — what NOT to test (1–2 sentences)

Do not ask follow-ups after this. If something is ambiguous mid-run, mark the affected case `BLOCKED` in the report with the reason.

### 2. Load the checklist

Read `.claude/skills/qa-case/best-practices.md`. Every generated case must satisfy every rule in that file. Do not paraphrase it in the output — just enforce it.

### 3. Brief exploration (minimal)

- `mcp__playwright__browser_navigate` to the URL
- ONE `mcp__playwright__browser_snapshot` to see the real DOM (real labels, real buttons)
- If the feature spans a modal or second view, one more snapshot after opening it. That's the cap.

Goal: locate real element names so cases don't invent selectors. Do not deep-crawl.

### 4. Generate test cases (TSV)

Produce **4–15 cases**, dobrane pod złożoność ficzera:
- 4 to floor pokrywający minimum coverage (1 positive + 2 negative + 1 edge z `best-practices.md`); niższa liczba oznacza brak jakiejś kategorii
- 15 to ceiling — jeśli potrzebujesz więcej, ficzer jest prawdopodobnie zbyt szeroki i powinien być podzielony na osobne runy
- Dla prostych ficzerów (formularz kontaktowy, toast) celuj w 4–6; dla ficzerów typu wyszukiwarka / filtr celuj w 8–10; dla złożonych flow (multi-step wizard) do 15
- Nie dodawaj case'ów tylko żeby dojść do 10 — jeśli 5 solidnych case'ów pokrywa temat, zostaw 5

Distribute across **positive / negative / edge** per the checklist. Respect anti-scope.

**Dwa tryby wykonania case'ów:**
- **Automated** (domyślne) — Playwright MCP wykonuje kroki, Wynik = `PASS`/`FAIL`/`BLOCKED`. Kroki opisują akcje przeglądarki (nawigacja, klik, wpisywanie).
- **Manual** — case przeznaczony do wykonania przez człowieka (Playwright nie potrafi zweryfikować). Wynik = `NOT RUN` przy generowaniu. Kroki opisują procedurę dla testera z konkretnym narzędziem (axe DevTools, VoiceOver ⌘F5, resize window do 320px, keyboard-only). Notatki muszą zawierać: „Wymaga manualnej weryfikacji przez testera" + estymatę czasu (np. „~30 min").

**Kiedy generować manual cases:**
- **A11y in scope (WCAG)** — **tylko manual, brak automated**. OBOWIĄZKOWO 3 bundled manual cases dla Perceivable / Operable / Understandable+AT (pełna referencja: `best-practices.md` sekcja „Manual WCAG 2.2 AA checks"). Automated Playwright a11y checks (accessible names przez DOM query, aria-live inspection itd.) NIE są generowane jako osobne cases — dają false confidence przy niepełnym pokryciu real WCAG audytu. Real a11y jest zawsze manualny (screen reader, kontrast, keyboard, focus behavior).
  - **Priorytet WCAG cases: ZAWSZE `P1 · Krytyczny`** — dostępność to compliance/legal risk, nie „nice to have". Dla portali `.gov.pl` (i innych regulowanych — banking, healthcare) to wymóg prawny (Ustawa o dostępności cyfrowej / EU EAA / ADA). Nawet jeśli feature jest P2, a11y cases dostają P1 — niedostępna funkcja to skarga do rzecznika + potencjalna kara finansowa, niezależnie od wagi biznesowej samej funkcji.
- **Responsive (mobile/tablet/desktop)** — dla portali publicznych / e-commerce / consumer-facing sites **ZAWSZE required**, niezależnie od tego czy user story wspomina o mobile. Ponad 60% polskiego web traffic to mobile — feature niedziałający na 375px = feature niedziałający dla ~60% users. Generuj **2 automated cases**: mobile 375px + tablet 768px (desktop ≥1280px jest pokryty baseline przez pozostałe cases w default viewport). Każdy case testuje że core flow (search + filter + interakcja) działa bez horizontal overflow, kluczowe elementy widoczne. Playwright `browser_resize(w,h)` + `browser_navigate` + assert `scrollWidth ≤ innerWidth`. **Priorytet responsive cases: dziedziczy z feature** (P1 feature → P1 responsive). Dla wewnętrznych admin tooli / desktop-only apps — pomiń (uwaga: musi być explicit w anti-scope, inaczej domyślnie generowane).
- **Contrast/visual regression** — jeden manual case z axe DevTools lub Percy/Chromatic
- **Performance perception** (feel, not metrics) — manual, real user
- **Cross-browser sanity** — manual quick check w Firefox + Safari jeśli produkt ma niestandardowe features

Manual cases NIE liczą się do case-count budget (4-15) — dochodzą jako uzupełnienie automated. Cały skill preferuje automated, manual to explicit exception dla rzeczy niemożliwych do zautomatyzowania.

Columns (tab-separated, in this exact order):

```
ID	Tytuł	Priorytet	Warunki wstępne	Dane testowe	Kroki	Oczekiwany rezultat	Wynik	ID buga	Notatki
```

**Kolumny definicyjne (1–7)** — opisują test:
- `ID` = `<FEATURE-PREFIX>-<NN>` (np. `LOGIN-01`), 2-cyfrowe zero-padded
- `Tytuł` — **zwięzły opis w języku produktu** (jeśli produkt polski → polski tytuł), **6–10 słów**, format: **czynność + obiekt + oczekiwany efekt**. MUSI sygnalizować intent (positive/negative/edge) przez samo sformułowanie.
  - **Zbyt lakoniczne (unikaj):** `"Otwarcie profilu"`, `"Filtr IC"`, `"XSS"` — mówią WHAT bez EFFECT
  - **Zbyt techniczne (unikaj):** `"Kliknięcie nazwy instytucji w tabeli otwiera stronę profilu z pełnymi danymi kontaktowymi (nazwa, NIP, adres)"` — szczegóły należą do Kroków/Oczekiwany rezultat, nie do tytułu
  - **Właściwe (rób tak):** `"Kliknięcie w instytucję otwiera stronę z jej danymi"`, `"Filtr instytucji certyfikującej (IC) zawęża listę wyników"`, `"Złośliwy kod w parametrze URL nie zostaje wykonany"`
  - **Bez English jargonu w tytule** — nie „AND", „sanitized", „end-to-end", „empty state", „XSS" (używaj: „łączy warunki", „nie zostaje wykonany", „pełny przepływ", „brak wyników", „złośliwy kod"). Techniczne akronimy tolerowane tylko gdy to nazwa własna funkcji produktu (IC, WCAG, PZZJ)
  - **Bez konkretnych metryk** w tytule (`4.5:1`, `24×24 CSS px`, `?limit=99999`) — te idą do Kroków / Oczekiwany rezultat / Test Data
- `Priorytet` = `P1 · Krytyczny` | `P2 · Wysoki` | `P3 · Niski` (kod + middot + polska etykieta; kod z przodu żeby Excel sort działał po wadze)
- `Warunki wstępne` = stan startowy, który musi być spełniony (Given)
- `Dane testowe` = konkretne wartości lub klasy równoważnościowe (`<dowolny poprawny email>`) — PRZED Krokami, bo dane wchodzą w kroki (When). **Dla wyszukiwania/filtrów na realnych zbiorach danych:** lista wartości oddzielonych przecinkami, format: `nazwa: "X", "Y", "Z", "W"` — **pierwsza wartość = ta użyta w Krokach** (deterministyczna weryfikacja przez Playwright), pozostałe 3-5 to alternatywy z domeny do sprawdzenia przez testera (największe miasta, popularne instytucje, różne kategorie). Zero etykiet typu „Primary:" — konwencja implicit, first-value-wins. To daje pokrycie klas równoważnościowych (stolica vs małe miasto, uczelnia publiczna vs fundacja, popularna vs egzotyczna nazwa) bez enumeracji osobnych case'ów. **Dla edge/injection case'ów:** payload primary + 2-3 warianty ataku (SQLi, path traversal, template injection) tym samym formatem.
- `Kroki` = numerowane kroki, imperatywne, deterministyczne, bez weryfikacji. **URL-e zawsze pełne** (`https://...`), nie relatywne ścieżki — pełny URL jest natychmiast czytelny i renderer XLSX potrafi go stylować (niebieski + podkreślenie). Format zależy od typu pliku — patrz krok 6.
- `Oczekiwany rezultat` = JEDEN obserwowalny efekt (Then)

Uwaga: `Type` (positive/negative/edge) NIE jest kolumną — dyscyplina coverage'u siedzi w `best-practices.md` i jest egzekwowana przy generowaniu. Intent testu komunikuje `Tytuł`.

**Kolumny wynikowe (8–10)** — wypełniane w trakcie / po egzekucji (krok 5):
- `Wynik` = `PASS` | `FAIL` | `BLOCKED` | `NOT RUN`. Przy pierwszym wygenerowaniu (przed krokiem 5) domyślnie `NOT RUN`. Po egzekucji lustro `Status` z zakładki execution report — obie wartości muszą się zgadzać.
- `ID buga` = referencja do ticketu przy `FAIL` (np. `ZSK-123`, `JIRA-4567`), zwykły tekst. `-` gdy PASS lub jeszcze bez ticketu.
- `Notatki` = krótka uwaga testera (workaround, follow-up TODO, quirk środowiska). `-` gdy brak.

Feature name / suite is NOT a per-row column — it belongs to the whole run and lives in the XLSX title bar (step 6d) and the `## Brief` section of the `.md`. Do not repeat it per row.

### 5. Execute each case

**Manual cases (kroki wymagają narzędzia typu axe DevTools, screen reader, keyboard-only, resize window, physical device):**
- NIE wykonuj przez Playwright — pozostaw Wynik = `NOT RUN`
- W execution report wpisz: Status = `NOT RUN`, Rzeczywisty rezultat = „Wymaga wykonania manualnego przez testera (patrz Kroki w cases sheet)", Waga/Screenshot/Reprodukcja = `-`
- Detekcja: jeśli kroki zawierają którekolwiek z `axe DevTools`, `VoiceOver`, `NVDA`, `unplug mouse`, `keyboard-only`, `Cmd+F5`, `Rendering emulate`, `axe-core`, `Lighthouse` — to jest manual case

**Automated cases (domyślne — Playwright MCP):**
For each automated case, replay the steps via Playwright MCP tools (`browser_click`, `browser_type`, `browser_fill_form`, `browser_snapshot`, etc.). Execution report sheet columns (Polish headers):
- **Status**: `PASS` | `FAIL` | `BLOCKED`
- **Rzeczywisty rezultat**: what you actually observed (one line)
- **Waga** (only if FAIL): `Critical` (blocks core flow) | `High` (major functional break) | `Medium` (workaround exists) | `Low` (cosmetic)
- **Zrzut ekranu** (only if FAIL): call `mcp__playwright__browser_take_screenshot`, save under `qa-runs/screenshots/<ID>.png`
- **Reprodukcja** (only if FAIL): same numbered format as `Kroki`; format depends on output file — see step 6

Report sheet header order (TSV row 1):
```
ID	Status	Rzeczywisty rezultat	Waga	Zrzut ekranu	Reprodukcja
```

Reset state between cases where possible (fresh navigation, clear inputs) — cases must be independent.

After executing each case, update the outcome columns in the **cases sheet** as well:
- `Wynik` — same value as `Status` in the execution report
- `ID buga` — filed ticket ID for FAILs, `-` otherwise
- `Notatki` — short observation if any, `-` otherwise

`Wynik` in the cases sheet must always agree with `Status` in the report sheet. If you change one, change the other.

### 6. Write the files

Create parent dir if missing: `mkdir -p qa-runs/screenshots`.

Write all four files with the same base slug `<feature-slug>-<YYYY-MM-DD>`.

The two `.tsv` files and the `.md` carry the SAME data but use two different formats — each optimized for its consumer. Format rules:

| Field | `.tsv` (spreadsheet import) | `.md` (human reading) |
|---|---|---|
| `Steps`, `Repro` | Multi-line inside a quoted cell: `"1) ...\n2) ...\n3) ..."` — real LF between steps, internal `"` doubled as `""` (RFC 4180). Renders as multi-line cell in Sheets/Excel. | Single line, all steps joined with spaces: `1) ... 2) ... 3) ...`. No outer quotes, no `""` doubling — the field never contains a raw newline, so no wrapping needed. |
| Other cells containing `"` | Wrap in `"..."` and double the internal quote. | Leave `"` as-is, no wrapping. |

**6a. `qa-runs/<slug>-cases.tsv`** — raw TSV, no code fences, no markdown. First line is the header, then one row per case. Use the `.tsv` format from the table above.

**6b. `qa-runs/<slug>-report.tsv`** — raw TSV, no code fences, no markdown. First line is the header, then one row per case (matching IDs from `-cases.tsv`). Use the `.tsv` format from the table above.

**6c. `qa-runs/<slug>.md`** — the human-readable deliverable. The `tsv` blocks inside use the `.md` format from the table above (single-line steps, no quote escaping) so the file stays readable in an editor / markdown preview. Structure:

    # QA run — <Feature> — <YYYY-MM-DD>

    ## Brief
    - **URL:** <url>
    - **Feature:** <name>
    - **User story:** <story>
    - **Priority:** <P1|P2|P3>
    - **Anti-scope:** <what we did NOT test>

    ## Test cases

    Paste the block below into a spreadsheet — tabs = columns.

    ```tsv
    ID	Title	Priority	Preconditions	Test Data	Steps	Expected Result	Result	Bug ID	Notes
    LOGIN-01	Successful login with valid credentials	P1 · Krytyczny	User is logged out	email: qa+ok@example.com, password: Test1234!	1) Open /login 2) Type valid email 3) Type valid password 4) Click "Zaloguj"	User is redirected to /dashboard and sees their name in the header	PASS	-	-
    LOGIN-02	Login button disabled with invalid email	P1 · Krytyczny	User is logged out	email: not-an-email	1) Open /login 2) Type invalid email 3) Blur field	Login button is disabled and error text "Nieprawidłowy email" appears below the field	FAIL	ZSK-4123	Regresja od buildu 1.42.0
    ...
    ```

    ## Execution report

    Paste into the same sheet (next tab, or below — same columns discipline).

    ```tsv
    ID	Status	Actual Result	Severity	Screenshot	Repro
    LOGIN-01	PASS	Redirected to /dashboard, header shows "QA Tester"	-	-	-
    LOGIN-02	FAIL	Login button stays disabled after typing valid email	High	screenshots/LOGIN-02.png	1) Open /login 2) Type qa+ok@example.com in email field — button remains disabled
    ...
    ```

**6d. `qa-runs/<slug>.xlsx`** — styled Excel workbook built from the two `.tsv` files by running:

```bash
python3 scripts/qa-tsv-to-xlsx.py qa-runs/<slug>
```

The helper `scripts/qa-tsv-to-xlsx.py` is the source of truth for the visual design (header colors, zebra striping, priority/type/status/severity color mapping, column widths, freeze pane, wrap-text). Do NOT reimplement the styling inline — always call the helper. If the file layout changes, update the helper, not the skill.

Requirement: `openpyxl` must be installed (`python3 -c "import openpyxl"` succeeds). If it fails, install with `pip3 install openpyxl` and retry.

### 7. Reply to the user (short)

One message. Include:
- Path to the `.xlsx` (the primary spreadsheet deliverable)
- Path to the `.md` (human-readable)
- Counts split: `A passed / B failed / C blocked / D not run (manual)` out of N — jeśli są manual cases, wyróżnij osobno
- List of failing IDs (just IDs, one line)
- Jeśli D > 0: przypomnienie do wykonania manualnego (jedno zdanie z estymatą łącznego czasu)

Omit `.tsv` paths from the reply — they exist for diff-ability but the user typically opens the `.xlsx`.

Nothing else. No summary of what you did, no recap of the cases.

## Rules — do NOT

- Do NOT ask questions after step 1
- Do NOT generate cases outside the user story or inside the anti-scope
- Do NOT invent a separate "bugs" concept — bugs are just FAIL rows in the execution report (matched by ID). The `-report.tsv` and the `## Execution report` block are the same data.
- Do NOT invent locators; always work from the snapshot
- Do NOT skip execution "because the case looks obvious" — every case runs
- Do NOT bundle multiple assertions into one case (see best-practices.md)
