# Bug report — konwencja + template

Wywoływane z SKILL.md krok 5.5. Definiuje strukturę bug reportów generowanych **automatycznie z FAIL rows** w execution report.

## Kiedy generujesz

Dla **każdego FAIL row** w execution report (po egzekucji cases), automatycznie tworzysz:

1. **Row w `qa-runs/<slug>-bugs.tsv`** — bug tracker (jeden plik dla całego runu)
2. **Plik `qa-runs/bugs/<BUG-ID>.md`** — per-bug markdown (standalone, kopiowalny do Jira/GitHub)
3. Helper `scripts/qa-tsv-to-xlsx.py` **automatycznie doda N zakładek per-bug** do `<slug>.xlsx` (jedna zakładka na jeden bug row z `<slug>-bugs.tsv`), w układzie **vertykalnym** (label | value). Tab name = bug ID (`INST-BR-01`), tab color = kolor Wagi (czerwony Critical, pomarańcz High, żółty Medium, szary Low). Aggregated flat view zostaje w `-bugs.tsv` (do git diff / import do Sheets).

Nie zadawaj usera pytań o bug reporty — dane pochodzą w 100% z FAIL row + case row.

## ID bugów

Format: `<FEATURE-PREFIX>-BR-<NN>` (np. `INST-BR-01`, `INST-BR-02`), sekwencyjnie w kolejności występowania FAIL w execution report (po ID case'a rosnąco).

To samo ID musi być w kolumnie `ID buga` w cases sheet (dla powiązania).

## Bug tracker TSV — kolumny (15, dokładna kolejność)

```
ID	Tytuł	Priorytet	Ważność	Powiązany scenariusz testowy	Data zgłoszenia	URL	Przeglądarka	System operacyjny	Rozdzielczość	Kroki reprodukcji	Oczekiwany rezultat	Rzeczywisty rezultat	Screenshot	Wpływ na użytkownika
```

Kolumny są zgrupowane w 4 sekcje w XLSX per-bug tab:
- **Metadane** (6): `ID`, `Tytuł`, `Priorytet`, `Ważność`, `Powiązany scenariusz testowy`, `Data zgłoszenia`
- **Środowisko** (4): `URL`, `Przeglądarka`, `System operacyjny`, `Rozdzielczość`
- **Reprodukcja** (4): `Kroki reprodukcji`, `Oczekiwany rezultat`, `Rzeczywisty rezultat`, `Screenshot`
- **Analiza wpływu** (1, merged): `Wpływ na użytkownika`

Konwencje:

- **ID** = `<PREFIX>-BR-<NN>` — sekwencyjnie
- **Tytuł** — z case'a (bez zmian; ten sam tytuł co Tytuł w cases sheet dla powiązanego case'a) LUB przepisany żeby fokus na buga („X nie działa gdy Y" zamiast „X działa gdy Y" które opisywało intent testu)
- **Priorytet** (biznesowa pilność naprawy) = `P1 · Krytyczny` | `P2 · Wysoki` | `P3 · Niski`. Ustalasz na podstawie kombinacji Ważność + wpływ na użytkownika + częstość występowania. Wzór: „Ważność Critical + wielu użytkowników trafia" → P1; „Medium + workaround istnieje" → P2; „Low + edge case rzadko trafiany" → P3.
- **Ważność** (techniczny impact / severity) = `Critical` | `High` | `Medium` | `Low` (kopia z execution report → kolumna Waga). Opisuje JAK ZŁE jest samo w sobie zachowanie (blokuje flow? psuje UX? kosmetyka?), oddzielnie od BIZNESOWEJ URGENCY (Priorytet).
- **Priorytet vs Ważność — czemu 2 kolumny**: bug może być Critical severity (crash) ale Low priority (dotyczy 0.01% userów na wygasłej wersji Firefox). Odwrotnie: Low severity (typo) ale P1 priority (na demo dla CEO jutro). Rozdzielenie pozwala trackować obie osi.
- **Powiązany scenariusz testowy** = ID case'a który wykrył buga (np. `INST-07`)
- **Data zgłoszenia** = data run-u w formacie `YYYY-MM-DD`
- **URL** = base URL testowanej strony (bez query params)
- **Przeglądarka** = domyślnie `Chrome (latest)` (bez explicit wersji chyba że wersja ma znaczenie dla buga)
- **System operacyjny** = `macOS` | `Linux` | `Windows` (system Playwright MCP hostuje)
- **Rozdzielczość** = viewport testowy, domyślnie `1440×900`; dla mobile/tablet bugów — odpowiedni rozmiar
- **Kroki reprodukcji** — **kopia z kolumny „Kroki" w cases sheet** (nie z „Reprodukcja" w report!). Case's Kroki są UI-driven i self-contained; Reprodukcja w execution report to redundancja i często może być stale. Jeśli FAIL wymaga DODATKOWEGO setup poza tym co jest w case Kroki (np. „przed krokiem 1 wyczyść localStorage"), dopisz to jako prefiks — ale bazą są case Kroki verbatim. Też updateuj kolumnę „Reprodukcja" w execution report do tego samego contentu (spójność między report i bug tracker).
- **Oczekiwany rezultat** — kopia z kolumny „Oczekiwany rezultat" w cases sheet
- **Rzeczywisty rezultat** — kopia z kolumny „Rzeczywisty rezultat" w execution report
- **Screenshot** — ścieżka do `qa-runs/screenshots/<CASE-ID>.png` (ta sama co w execution report)
- **Wpływ na użytkownika** — **jedyne pole które GENERUJESZ świeżo** (nie ma w case). Krótkie 1-2 zdaniowe wyjaśnienie „kogo to boli i jak często". Wzór: „`<Kto>` `<jak często>` traci `<co>` — `<konsekwencja biznesowa>`". Np. „Użytkownicy piszący na klawiaturze EN / mobile bez ogonków tracą 83 z 84 wyników — nie znajdują szukanej instytucji, myślą że jej nie ma w bazie".

## Per-bug markdown template (`qa-runs/bugs/<BUG-ID>.md`)

```markdown
# <BUG-ID> — <Tytuł>

**Priorytet:** <P1 · Krytyczny | P2 · Wysoki | P3 · Niski> · **Ważność:** <Critical|High|Medium|Low> · **Powiązany scenariusz testowy:** <CASE-ID> · **Data zgłoszenia:** <YYYY-MM-DD>

## Środowisko
- **URL:** <url>
- **Przeglądarka:** <Chrome (latest)>
- **OS:** <macOS/Linux/Windows>
- **Viewport:** <1440×900>

## Kroki reprodukcji
1. <krok 1>
2. <krok 2>
...

## Oczekiwany rezultat
<expected>

## Rzeczywisty rezultat
<actual>

![Dowód](../screenshots/<CASE-ID>.png)

## Wpływ na użytkownika
<jedno-dwa zdania: kogo boli, jak często, konsekwencja>
```

**Zasady dla markdowna:**

- Kroki reprodukcji jako lista numerowana (każdy krok w osobnej linii) — nie single-line jak w cases MD
- Screenshot link relatywny: `../screenshots/<CASE-ID>.png` (bo bug .md siedzi w `qa-runs/bugs/`)
- Bez emoji w treści (chyba że explicit request usera)
- Same reguły PL/no-jargon co dla test cases (patrz `columns.md`)

## Kolejność w bug tracker

Sortowane po **Priorytet** rosnąco (P1 → P3), potem po **Ważność** malejąco (Critical → Low), potem po ID buga rosnąco. Najpilniejsze do naprawy na górze — pierwsze widoczne w Excelu.
