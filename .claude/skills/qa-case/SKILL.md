---
name: qa-case
description: Generate test cases + execute them live via Playwright MCP + emit a styled XLSX report. Use when the user wants to author + run + report on a specific feature in one pass.
---

Twórz test casey dla JEDNEGO ficzera (może pokrywać 1–N powiązanych user stories na tym samym URL / ekranie), egzekwuj je od razu w prawdziwej przeglądarce i produkuj stylowany Excel + human-readable markdown + raw TSV-ki.

## Output

Pliki w `qa-runs/`, dzielą base slug `<feature-slug>-<YYYY-MM-DD>`:

1. `<slug>.xlsx` — **primary deliverable dla arkusza**. Zakładki: `Test cases` + **N zakładek per-bug** (jeśli są FAIL cases — każdy bug jako osobna zakładka w układzie vertykalnym, label | value; tab color = kolor Ważności: czerwony Krytyczna, pomarańcz Wysoka, żółty Średnia, szary Niska). **Zakładka „Execution report" NIE jest tworzona** — redundantna (Wynik + ID buga są w Test cases, pełny detail FAIL jest w bug tabs). Stylowany header (ciemnoniebieski #305496, biały bold, freeze row 1), wrap-text na długich cellkach, zebra striping, color-coded Priorytet / Wynik / Waga, cienkie szare bordery.
2. `<slug>.md` — human-readable. Brief + oba TSV bloki inline, single-line steps.
3. `<slug>-cases.tsv` — raw TSV (multi-line quoted per RFC 4180). Do git diff i importu do Sheets przez `File → Import`.
4. `<slug>-report.tsv` — raw TSV execution report (aggregated data source dla git diff / backup / regeneracji; **NIE renderuje się jako zakładka XLSX** — patrz pkt 1). Zawiera wszystkie rows z Rzeczywisty rezultat / Waga / Reprodukcja per case, ale w XLSX ta informacja jest lepiej pokazana w per-bug tabs (dla FAIL) i Test cases (dla PASS).
5. `<slug>-bugs.tsv` (opcjonalnie, tylko przy FAIL) — bug tracker TSV (aggregated, jeden plik z N wierszami, do git diff / import do Sheets). W XLSX renderuje się jako **N zakładek per-bug** (nie jedna zbiorcza) w układzie vertykalnym.
6. `bugs/<BUG-ID>.md` (opcjonalnie, tylko przy FAIL) — per-bug markdown (jeden plik / bug), standalone kopiowalny do Jira / GitHub. Katalog `qa-runs/bugs/`.

Pliki 3-4 mają te same wiersze co zakładki 1-2 w XLSX. Bug tracker (5+6) generowane w kroku 5.5 z FAIL rows.

## Kroki

### 1. Zbierz minimum inputów — KASKADOWO, jedno pytanie na raz

Zadawaj pytania **po kolei**, każde w osobnej wiadomości. Poczekaj na odpowiedź, potem następne. Kolejność:

1. **URL** strony
2. **Nazwa ficzera** (krótka, slugified do nazwy pliku)
3. **User stories** — 1–N stories w formacie „Jako X chcę Y, aby Z", każda w osobnej linii lub bullet. Wszystkie muszą dotyczyć tego samego ficzera + URL-a; jeśli któraś wymaga innego ekranu / trybu → split na osobny run. Bez limitu N w pytaniu, ale patrz cap 25 case'ów total w kroku 4.
4. **Priorytet** — P1 / P2 / P3 (globalny default; cases mogą go override'ować per-row wg checklisty)
5. **Anti-scope** — czego NIE testujemy (1–2 zdania, globalne dla całego runu)

Po każdym pytaniu tylko krótka forma prompt-u (jedno-dwa zdania). Bez dodatkowej rozmowy. Bez sugerowania defaultów — user ma sam odpowiedzieć.

Po zebraniu wszystkich 5 odpowiedzi przechodzisz do kroku 2. Jeśli coś ambiguous mid-run (po kroku 5), oznacz dotknięty case `BLOCKED` z powodem — nie wracaj do usera z dodatkowymi pytaniami.

### 2. Załaduj checklistę

Przeczytaj `.claude/skills/qa-case/best-practices.md`. Każdy generowany case musi spełniać każdą regułę w tym pliku.

### 3. Krótka eksploracja

- `mcp__playwright__browser_navigate` do URL
- ~1–2 `mcp__playwright__browser_snapshot` — więcej tylko gdy feature spans multiple views
- Cel: locate real element names, żeby cases nie zmyślały selektorów. Nie deep-crawl.

### 4. Wygeneruj test cases

**Ilość: 4–15 case'ów per story, twardy cap 25 total** dobrane pod złożoność ficzera:
- 4 per story = floor pokrywający minimum coverage (1 positive + 2 negative + 1 edge z best-practices.md); niższa liczba = brak jakiejś kategorii
- 15 per story = ceiling dla pojedynczej story
- 25 total = twardy cap **dla per-story cases** (INST-01…INST-N pokrywających user stories). Cross-cutting cases (a11y manual + responsive automated) to overhead na szczycie — analogicznie do manual, **nie liczą się do 25 cap**. Powyżej per-story 25 → split na osobne runy (per story lub per grupa stories)
- Proste ficzery (formularz kontaktowy, toast) → 4–6 per story; wyszukiwarki/filtry → 6–10 per story; złożone flow → do 15 per story
- Multi-story: preferuj **4–8 per story** żeby zmieścić się w 25 total przy 3+ stories; jeśli któraś story wymaga >8 i cap się pali → split runu
- Nie dodawaj żeby dojść do maksa — jeśli 5 solidnych pokrywa story, zostaw 5

**Rozłożenie**: positive / negative / edge zgodnie z checklistą, **osobno per story** (każda story dostaje własny mini-blok coverage — nie łącz np. positive S1 z negative S2 licząc że story pokryta). Uszanuj anti-scope. Cross-cutting cases (a11y manual, responsive) generuj RAZ dla całego runu, nie per story — testują ficzer jako całość.

**Kolumny (TSV, dokładna kolejność):**

```
ID	Tytuł	Priorytet	Warunki wstępne	Dane testowe	Kroki	Oczekiwany rezultat	Wynik	ID buga	Notatki
```

**Kolumny definicyjne (1–7) — opisują test:**

- `ID` = `<FEATURE-PREFIX>-<NN>` (np. `LOGIN-01`, `LOGIN-02`, …, `LOGIN-22`), 2-cyfrowe zero-padded, **numeracja sekwencyjna dla całego runu** — bez znaczników `S<N>` ani `XC` niezależnie od liczby stories. Kolejność wierszy = kolejność story w Brief, potem cross-cutting (a11y, responsive) na końcu; grupowanie sygnalizowane wyłącznie porządkiem, nie ID-kiem
- `Tytuł` — patrz `.claude/skills/qa-case/columns.md` sekcja Tytuł (6–10 słów, PL, format czynność+obiekt+efekt, bez English jargonu i konkretnych metryk)
- `Priorytet` = `P1 · Krytyczny` | `P2 · Wysoki` | `P3 · Niski` (kod z przodu żeby Excel sort działał po wadze)
- `Warunki wstępne` = stan startowy który musi być spełniony (Given)
- `Dane testowe` — patrz `.claude/skills/qa-case/columns.md` sekcja Dane testowe (dla wyszukiwarek/filtrów z alternatywami: explicit label „X używana w krokach: 'val'; alternatywy do testowania manualnego: 'val2', 'val3'"; Kroki wstawiają wartość INLINE, np. „wpisz frazę 'val'" — bez odwołania „z Dane testowe")
- `Kroki` = numerowane, imperatywne, deterministyczne, bez weryfikacji. **URL-e zawsze pełne** (`https://...`), nie relatywne ścieżki. **UI-driven, nie URL-driven** — krok 1 = otwórz base URL bez query params; kolejne kroki = akcje w UI (wpisywanie, klik, zaznaczenie), żeby tester mógł manualnie odtworzyć bez ręcznego konstruowania URL. URL z query params tylko gdy URL jest przedmiotem testu (injection/deep-link) lub jako setup shortcut z uzasadnieniem w Notatki. Pełna reguła + wyjątki: `best-practices.md` sekcja Steps → „UI-driven, not URL-driven". Format zależy od typu pliku — patrz krok 6.
- `Oczekiwany rezultat` = JEDEN obserwowalny efekt (Then)

`Type` (positive/negative/edge) NIE jest kolumną — dyscyplina coverage'u siedzi w best-practices, intent testu komunikuje `Tytuł`.

Feature name / suite NIE jest per-row column — żyje w Brief sekcji `.md`. Nie powtarzaj per wiersz.

**Kolumny wynikowe (8–10) — wypełniane w kroku 5:**

- `Wynik` = `PASS` | `FAIL` | `BLOCKED` | `NOT RUN`. Przy generowaniu domyślnie `NOT RUN`. Po egzekucji lustro `Status` z execution report.
- `ID buga` = referencja do ticketu przy FAIL (np. `ZSK-123`, `JIRA-4567`). `-` gdy PASS lub bez ticketu.
- `Notatki` = krótka uwaga testera. `-` gdy brak.

**Dwa tryby wykonania case'ów:**

- **Automated** (domyślne) — Playwright MCP wykonuje kroki, Wynik = PASS/FAIL/BLOCKED. Kroki opisują akcje przeglądarki (nawigacja, klik, wpisywanie).
- **Manual** — case dla człowieka (Playwright nie zweryfikuje). Wynik = `NOT RUN` przy generowaniu. Kroki opisują procedurę z konkretnym narzędziem (axe DevTools, VoiceOver ⌘F5, resize window, keyboard-only). Notatki muszą zawierać „Wymaga manualnej weryfikacji przez testera" + estymatę czasu (np. „~30 min").

**Specjalne kategorie do wygenerowania:**

- **A11y (WCAG in scope)** — **TYLKO manual, brak automated**. OBOWIĄZKOWO 3 bundled manual cases (Perceivable / Operable / Understandable+AT). Pełna referencja: best-practices.md sekcja „Manual WCAG 2.2 AA checks". Automated Playwright a11y checks NIE są generowane — dają false confidence przy niepełnym pokryciu real WCAG audytu. Real a11y jest zawsze manualny.
  - **Priorytet WCAG cases: ZAWSZE `P1 · Krytyczny`** — compliance/legal risk. Dla portali `.gov.pl` i innych regulowanych (banking, healthcare) to wymóg prawny (Ustawa o dostępności cyfrowej / EU EAA / ADA). Nawet gdy feature P2, a11y cases dostają P1.
- **Responsive (desktop/tablet/mobile)** — dla portali publicznych / e-commerce / consumer-facing sites **ZAWSZE required**, niezależnie od user story. >60% polskiego web traffic to mobile, ale desktop to nadal główny kanał dla portali gov/edu. Generuj **3 automated cases w kolejności desktop → tablet → mobile**:
  1. **Desktop bundled** — 3 breakpointy w 1 case: 1280×720 (małe laptopy, dolny próg), 1440×900 (MBP default), 1920×1080 (FHD monitor). Assertion per breakpoint: brak horizontal overflow + core UI (search/filtry/lista) widoczne.
  2. **Tablet** — 768×1024 (iPad portrait). Assertion: brak horizontal overflow + core flow działa.
  3. **Mobile** — 375×812 (iPhone base). Assertion: j.w.
  Playwright (implementation detail, NIE w Krokach): `browser_resize(w,h)` + `browser_navigate` + assert `scrollWidth ≤ clientWidth`. **Kroki muszą używać user-visible language** — „ustaw okno przeglądarki na 375×812 (DevTools → Toggle device toolbar)", „sprawdź czy nie ma poziomego paska przewijania na dole okna", „widoczne bez ucinania: X, Y, Z". NIE pisz w Krokach „porównaj document.documentElement.scrollWidth z clientWidth" — to jargon JS DOM API, manualny tester tego nie zrobi. **Priorytet dziedziczy z feature** (P1 feature → P1 responsive). Admin tools / desktop-only apps → pomiń mobile+tablet, zostaw tylko desktop bundled (musi być explicit w anti-scope, inaczej domyślnie generowane 3).

Manual cases NIE liczą się do case-count budget (4–15) — dochodzą jako uzupełnienie automated.

### 5. Wykonaj każdy case

**Manual cases** (kroki wymagają narzędzia typu axe DevTools, VoiceOver, NVDA, keyboard-only, resize window, physical device):

- NIE wykonuj przez Playwright — Wynik = `NOT RUN`
- W execution report: Status = `NOT RUN`, Rzeczywisty rezultat = „Wymaga wykonania manualnego przez testera (patrz Kroki w cases sheet)", Waga/Screenshot/Reprodukcja = `-`
- Detekcja: jeśli kroki zawierają któreś z `axe DevTools`, `VoiceOver`, `NVDA`, `unplug mouse`, `keyboard-only`, `Cmd+F5`, `Rendering emulate`, `axe-core`, `Lighthouse` — to jest manual case

**Automated cases** (domyślnie — Playwright MCP):

Odtwórz kroki przez MCP tools (`browser_click`, `browser_type`, `browser_fill_form`, `browser_snapshot` itd.). Do execution report:

- **Status**: `PASS` | `FAIL` | `BLOCKED`
- **Rzeczywisty rezultat**: co obserwowałeś (jedna linia)
- **Waga** (tylko FAIL): `Critical` (blokuje core flow) | `High` (poważny funkcjonalny błąd) | `Medium` (workaround istnieje) | `Low` (kosmetyka)
- **Zrzut ekranu** (tylko FAIL): `browser_take_screenshot`, zapisz pod `qa-runs/screenshots/<ID>.png`
- **Reprodukcja** (tylko FAIL): ten sam numerowany format co `Kroki`

Nagłówki report sheet:

```
ID	Status	Rzeczywisty rezultat	Waga	Zrzut ekranu	Reprodukcja
```

Resetuj stan między case'ami (fresh navigation, clear inputs) — cases muszą być niezależne.

Po wykonaniu każdego case update outcome columns w cases sheet:

- `Wynik` = ta sama wartość co `Status` w execution report
- `ID buga` = `<FEATURE-PREFIX>-BR-<NN>` dla FAIL (patrz krok 5.5 — sekwencyjnie w kolejności ID case'a), `-` inaczej
- `Notatki` = krótka uwaga, `-` inaczej

**`Wynik` w cases i `Status` w report MUSZĄ się zgadzać.** Jeśli zmieniasz jedno, zmień drugie.

### 5.5. Wygeneruj bug reporty (auto z FAIL rows)

Dla **każdego FAIL row** w execution report — bez pytania usera — generuj:

1. **Row w `qa-runs/<slug>-bugs.tsv`** (bug tracker, jeden plik / run). Kolumny (15, dokładna kolejność):
   ```
   ID	Tytuł	Priorytet	Ważność/dotkliwość	Powiązany scenariusz testowy	Data zgłoszenia	URL	Przeglądarka	System operacyjny	Rozdzielczość	Kroki reprodukcji	Oczekiwany rezultat	Rzeczywisty rezultat	Screenshot	Wpływ na użytkownika
   ```
   Zgrupowane w 4 sekcje w XLSX per-bug tab: **Metadane** (6) · **Środowisko** (4) · **Reprodukcja** (4) · **Analiza wpływu** (1).
   **Priorytet vs Ważność/dotkliwość**: Priorytet = biznesowa pilność (P1/P2/P3), Ważność/dotkliwość = techniczny impact (Krytyczna/Wysoka/Średnia/Niska — PL wartości). Dwie osi — bug może być Krytyczna severity + P3 priority (crash w edge case) lub odwrotnie (typo na demo dla CEO = P1 + Niska).

   **Środowisko — wersje wykryte automatycznie**: przed generacją bugów zapytaj Playwright MCP o browser wersję (`browser_evaluate({ function: '() => navigator.userAgent' })`) i sparsuj Chrome major. OS wersja: `sw_vers -productVersion` (macOS), `uname -r` (Linux), PowerShell (Windows). Formaty: `Chrome 151`, `macOS 15.7.4`. Nie hardkoduj „Chrome (latest)" ani generycznego „macOS" — każdy bug musi mieć konkretną wersję do reprodukcji.
2. **Plik `qa-runs/bugs/<BUG-ID>.md`** (per-bug markdown, standalone kopiowalny do Jira/GitHub).

Pełna referencja formatu, kolumn i markdown template: `.claude/skills/qa-case/bug-report.md`.

Kluczowe:
- **ID bugów sekwencyjne** — `<FEATURE-PREFIX>-BR-01`, `-02`, … w kolejności ID case'a rosnąco
- **9 z 10 kolumn to KOPIA danych** z cases sheet + execution report (bez re-generowania)
- **Jedyne nowe pole: „Wpływ na użytkownika"** — 1-2 zdania „kogo boli i jak często" (nie duplikuj w Notatki w cases sheet)
- Sortowanie bug tracker: Waga malejąco (Critical → Low), potem ID rosnąco
- Utwórz katalog: `mkdir -p qa-runs/bugs`

### 6. Zapisz pliki

Utwórz katalog jeśli brak: `mkdir -p qa-runs/screenshots`.

Zapisz wszystkie 4 pliki z tym samym base slug `<feature-slug>-<YYYY-MM-DD>`.

`.tsv` i `.md` mają te SAME dane w dwóch formatach, każdy zoptymalizowany pod swojego konsumenta:

| Field | `.tsv` (dla arkusza) | `.md` (dla człowieka) |
|---|---|---|
| `Kroki`, `Reprodukcja` | Multi-line w quoted cell: `"1) ...\n2) ...\n3) ..."` — real LF między krokami, internal `"` doubled jako `""` (RFC 4180). Renderuje jako multi-line cell w Sheets/Excel. | Single line, kroki połączone spacjami: `1) ... 2) ... 3) ...`. Bez outer quotes ani `""` doubling. |
| Inne cellki z `"` | Wrap w `"..."` + double internal quote. | Zostaw `"` as-is, bez wrap. |

**6a. `qa-runs/<slug>-cases.tsv`** — raw TSV, bez code fences, bez markdown. Header + jeden wiersz per case w formacie z tabeli.

**6b. `qa-runs/<slug>-report.tsv`** — raw TSV execution report. IDs matching `-cases.tsv`.

**6c. `qa-runs/<slug>.md`** — human-readable. `tsv` bloki wewnątrz używają `.md` formatu z tabeli (single-line steps, bez quote escaping). Struktura:

    # QA run — <Feature> — <YYYY-MM-DD>

    ## Brief
    - **URL:** <url>
    - **Feature:** <name>
    - **User stories:** przy 1 story — `<story>` inline. Przy N>1 — lista numerowana z `S<N>` label matching ID prefix:
      - S1: <story 1>
      - S2: <story 2>
      - ...
    - **Priorytet:** <P1|P2|P3>
    - **Anti-scope:** <co NIE testujemy>

    ## Test cases

    ```tsv
    (header + wiersze cases w formacie MD z tabeli powyżej)
    ```

    ## Execution report

    ```tsv
    (header + wiersze report w formacie MD)
    ```

**6d. `qa-runs/<slug>.xlsx`** — stylowany Excel workbook zbudowany z dwóch `.tsv` przez:

```bash
python3 scripts/qa-tsv-to-xlsx.py qa-runs/<slug>
```

Helper `scripts/qa-tsv-to-xlsx.py` jest **source of truth dla wyglądu** (kolory nagłówka, zebra striping, priorytet/wynik/waga color mapping, szerokości kolumn, freeze pane, wrap-text). NIE reimplementuj stylowania inline — zawsze wołaj helper. Jeśli layout się zmienia, zaktualizuj helper.

Wymaganie: `openpyxl` musi być zainstalowany (`python3 -c "import openpyxl"` musi przejść). Jeśli fail — `pip3 install openpyxl` i retry.

### 7. Odpowiedź do usera (krótko)

Jedna wiadomość, zawiera:

- Ścieżkę do `.xlsx` (primary spreadsheet deliverable)
- Ścieżkę do `.md` (human-readable)
- Podział counts: `A passed / B failed / C blocked / D not run (manual)` z N — jeśli są manual cases, wyróżnij osobno
- Lista failing IDs (jedna linia)
- Jeśli D > 0: przypomnienie do wykonania manualnego (1 zdanie z estymatą łącznego czasu)

Pomiń `.tsv` — istnieją dla diff-owania, user zwykle otwiera `.xlsx`.

Nic więcej. Bez podsumowania co zrobiłeś, bez recap-u case'ów.

## Zasady — NIE rób

- NIE zadawaj pytań po kroku 1
- NIE generuj case'ów poza user story ani w anti-scope
- NIE wymyślaj osobnego „bugs" konceptu — bugi to FAIL rows w execution report (match po ID). `-report.tsv` i `## Execution report` to te same dane
- NIE wymyślaj lokatorów — zawsze pracuj ze snapshot
- NIE pomijaj egzekucji „bo case wygląda oczywiście" — każdy automated case run
- NIE bundle'uj multiple assertions w jednym case (patrz best-practices.md)
