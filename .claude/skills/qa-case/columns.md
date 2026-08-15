# Konwencje kolumn — wywoływane z SKILL.md krok 4

Szczegółowe reguły dla dwóch kolumn, które wymagają więcej miejsca niż inline w SKILL.md.

## Tytuł

**Zwięzły opis w języku produktu** (jeśli produkt polski → polski tytuł), **6–10 słów**, format: **czynność + obiekt + oczekiwany efekt**. MUSI sygnalizować intent (positive/negative/edge) przez samo sformułowanie.

### Unikaj

- **Zbyt lakoniczne**: `"Otwarcie profilu"`, `"Filtr IC"`, `"XSS"` — mówią WHAT bez EFFECT
- **Zbyt techniczne**: `"Kliknięcie nazwy instytucji w tabeli otwiera stronę profilu z pełnymi danymi kontaktowymi (nazwa, NIP, adres)"` — szczegóły należą do Kroków / Oczekiwany rezultat, nie do tytułu
- **English jargon**: nie „sanitized", „end-to-end", „empty state", „XSS", „keyboard-only", „focus visible", „target size", „screen reader", „assistive tech (AT)", „debounce", „viewport", „scrollWidth/clientWidth", „responsive breakpoint". Używaj: „nie zostaje wykonany", „pełny przepływ", „brak wyników", „złośliwy kod", „obsługa z klawiatury", „widoczny fokus", „rozmiar celu", „czytnik ekranu", „technologie wspomagające", „opóźnienie odświeżenia listy" LUB „poczekaj aż lista sama się odświeży", „rozmiar okna przeglądarki", „poziomy pasek przewijania", „rozmiar okna". Techniczne akronimy tolerowane tylko gdy to nazwa własna funkcji produktu (IC, WCAG, PZZJ, ARIA, NIP) LUB gdy komunikują logikę filtrów precyzyjniej niż PL opis: **AND / OR w nawiasie** dozwolone dla cases łączących filtry, np. „…pokazuje tylko wspólne wyniki (logika AND)" / „…pokazuje sumę wyników (logika OR)"
- **WCAG kategorie zawsze po polsku** (używaj zrozumiałych synonimów, nie oficjalnych kalek): Perceivable → **czytelność treści** (nie „postrzegalność" — mniej zrozumiałe dla nie-a11y-specjalistów), Operable → **możliwość obsługi** / **obsługa z klawiatury**, Understandable → **zrozumiałość**, Robust → **solidność**. Prefiks tytułu WCAG cases: „Dostępność WCAG 2.2 AA — <kategoria PL>"
- **Opisuj CORE, nie mechanikę**: tytuł ma mówić CO ma się dziać z punktu widzenia użytkownika / systemu, nie JAK to uruchomić. „Kliknięcie Pobierz pobiera plik X" (mechanika) → „Użytkownik pobiera bieżącą listę w formacie Excel" (core). „Klik nagłówka X przełącza sortowanie" (mechanika) → „Ponowne kliknięcie nagłówka X odwraca kierunek sortowania" (core z intencją). Testy nagłówkowe UI (np. sortowanie, filtrowanie) mogą zawierać element interakcji, ale muszą też komunikować EFEKT
- **Konkretne metryki**: `4.5:1`, `24×24 CSS px`, `?limit=99999` — te idą do Kroków / Oczekiwany rezultat / Dane testowe

### Rób tak

- `"Kliknięcie w instytucję otwiera stronę z jej danymi"`
- `"Filtr instytucji certyfikującej (IC) zawęża listę wyników"`
- `"Złośliwy kod w parametrze URL nie zostaje wykonany"`

## Dane testowe

Konkretne wartości lub klasy równoważnościowe (`<dowolny poprawny email>`). PRZED Krokami, bo dane wchodzą w kroki (When).

### Dla wyszukiwania / filtrów na realnych zbiorach danych

**Explicit label** — wartość deterministyczna (używana w Krokach) oddzielona od alternatyw exploratory:

```
<nazwa> używana w krokach: "X"; alternatywy do exploratory: "Y", "Z", "W"
```

Kroki referencują wartość zdaniem: „W pole wyszukiwania wpisz frazę **z Dane testowe** (""X"")". Tester widzi którą wartość zreplikować bez skoku wzroku (wartość in-line), a alternatywy są jasno oznaczone jako do rozszerzonego testowania (największe miasta, popularne instytucje, różne kategorie).

To daje pokrycie klas równoważnościowych (stolica vs małe miasto, uczelnia publiczna vs fundacja, popularna vs egzotyczna nazwa) bez enumeracji osobnych case'ów i bez łamania atomicity (case testuje jedną wartość deterministycznie; alternatywy = manualne rozszerzenie).

### Dla edge / injection case'ów

Payload primary + 2-3 warianty ataku (SQLi, path traversal, template injection) w tym samym formacie.

## Notatki

Krótka uwaga testera. `-` gdy brak.

### Zasady

- **Self-explanatory** — czytelne dla testera bez developerskiego kontekstu. Notatka nie może wymagać znajomości technicznych skrótów żeby zrozumieć problem.
- **Bez jargon**: nie „follow-up ticket", „edge case", „regression risk", „tech debt", „PR-worthy". Używaj: „osobny ticket do zgłoszenia później", „przypadek brzegowy", „ryzyko regresji", „dług techniczny", „wart osobnego PR-a".
- **Jeśli notujesz uwagę poboczną** (side observation poza scope tego case'a): wyjaśnij (a) co konkretnie zaobserwowałeś, (b) dlaczego to problem, (c) że nie wpływa na wynik tego case'a. Wzór: „Uwaga poza scope tego testu: `<obserwacja>` (`<konsekwencja>`). Nie wpływa na wynik tego case'a — warto zgłosić osobnym ticketem `<sugerowana akcja>`".
- **Techniczne obserwacje z automation** (np. „scrollWidth=360, clientWidth=360") przetłumacz na user-visible: „Zaobserwowano brak paska przewijania poziomego na 375×812". Techniczne pomiary zostawiaj w kodzie testu / logach, nie w Notatkach dla ludzi.
