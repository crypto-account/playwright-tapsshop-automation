# QA run — Wyszukiwarka instytucji — 2026-08-13 (run 3)

## Brief
- **URL:** https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=0
- **Feature:** Wyszukiwarka instytucji
- **User story:** Jako użytkownik chcę wyszukać instytucję certyfikującą po nazwie / miejscowości / województwie, aby znaleźć podmiot wydający interesującą mnie kwalifikację.
- **Priorytet:** P1
- **Anti-scope:** wersja mobilna, integracje z zewnętrznymi rejestrami, wydajność/load, dostępność WCAG (osobny run), profile poszczególnych instytucji.
- **Focus tego runu:** case'y zaprojektowane pod nowe reguły z rozszerzonego `best-practices.md` (URL as state, Polish text, special chars, pagination boundaries, empty vs no-results, export consistency).

## Test cases

```tsv
ID	Tytuł	Priorytet	Warunki wstępne	Dane testowe	Kroki	Oczekiwany rezultat	Wynik	ID buga	Notatki
INST-01	Deep-link z filtrem i paginacją restoruje pełny widok	P1 · Krytyczny	Użytkownik nigdy wcześniej nie wchodził na tę stronę w bieżącej sesji, cookie banner zaakceptowany	URL: https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=20&search=Akademia	1) Otwórz podany URL bezpośrednio w nowej karcie	Search input pokazuje wartość "Akademia", licznik "Znaleziono" pokazuje 571, paginator pokazuje "21-40 z 571", pierwszy wiersz ma indeks 21	PASS	-	-
INST-02	Wyszukiwanie małą literą z polskimi znakami znajduje wielką	P2 · Wysoki	Użytkownik jest na stronie wyszukiwarki, brak aktywnych filtrów	search: "łódź" (lowercase z polskimi diakrytykami)	1) Otwórz https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=0&search=%C5%82%C3%B3d%C5%BA	Licznik "Znaleziono" pokazuje > 0, każdy widoczny wiersz zawiera nazwę z "Łódź" lub "Łodzi" (case-insensitive match z zachowaniem diacritics)	PASS	-	-
INST-03	Deep-link do posortowanego widoku (?sort=-name) restoruje sort desc	P1 · Krytyczny	Użytkownik nigdy wcześniej nie wchodził na tę stronę w bieżącej sesji	URL: https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=0&sort=-name	1) Otwórz podany URL bezpośrednio w nowej karcie	Pierwszy wiersz tabeli to nazwa zaczynająca się od Z/Ż/Ź (koniec alfabetu), wskaźnik sortowania w nagłówku "Nazwa" pokazuje malejąco	FAIL	-	URL param sort=-name jest ignorowany przy początkowym load — apka renderuje default sort ascending. Sort desc działa TYLKO po ręcznym kliknięciu nagłówka. Deep-linking do posortowanego widoku nie działa (bug URL-state)
INST-04	Sort desc zwraca polskie nazwy w kolejności polskiego alfabetu (Ż > Z > Y…)	P3 · Niski	Sort desc jest aktywny (po kliknięciu nagłówka Nazwa)	-	1) Otwórz https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=0 2) Kliknij nagłówek kolumny "Nazwa" żeby przełączyć sort na desc	Pierwsze wiersze zawierają nazwy zaczynające się od Ż/Ź (jeśli takie istnieją w bazie), przed nazwami na Z	BLOCKED	-	Baza (2605 wpisów) nie zawiera nazw zaczynających się od Ż ani Ź — sprawdzone przez search po fragmencie "Ż" (21 wyników, żaden nie startuje z Ż). Nie da się zweryfikować polskiego sort-u bez danych. Rekomendacja: zapytaj backend team czy taki edge-case jest brany pod uwagę
INST-05	Wyszukiwanie fragmentu z cudzysłowem nie łamie zapytania	P1 · Krytyczny	Użytkownik jest na stronie wyszukiwarki, brak aktywnych filtrów	search: "Dobre Imprezy" (z cudzysłowami)	1) Otwórz https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=0&search=%22Dobre+Imprezy%22	Licznik "Znaleziono" pokazuje 1, jedyny wiersz to "Dobre Imprezy" Andrzej Prusisz, brak console errors, brak crash	PASS	-	-
INST-06	Wyszukiwanie fragmentu ze średnikiem nie łamie zapytania	P1 · Krytyczny	Użytkownik jest na stronie wyszukiwarki, brak aktywnych filtrów	search: "; Filia" (ze średnikiem)	1) Otwórz https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=0&search=%3B+Filia	Licznik "Znaleziono" pokazuje > 0, każdy widoczny wiersz zawiera średnik w nazwie, brak console errors, brak crash	PASS	-	-
INST-07	Pagination boundary: offset >> total pokazuje empty state	P2 · Wysoki	Użytkownik jest na stronie wyszukiwarki, brak aktywnych filtrów	URL: https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=99999	1) Otwórz podany URL bezpośrednio	Strona nie crashuje, tabela renderuje "Brak danych", paginator pokazuje sensowne wartości (np. "0 z 2605" lub redirect na ostatnią stronę)	FAIL	-	Empty state jest pokazany poprawnie ("Brak danych"), URL auto-klamped z 99999 do 99980. ALE paginator wyświetla nonsensowną wartość: "99981-2605 z 2605" (start > end). Bug UX/wyświetlania — powinno pokazywać "Ostatnia strona" lub redirect. Screenshot: RUN3-INST-07.png
INST-08	Zmiana limit przy głębokim offset zachowuje pozycję	P2 · Wysoki	Użytkownik jest na stronie wyszukiwarki, brak aktywnych filtrów	URL: https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=50&offset=200	1) Otwórz podany URL bezpośrednio	Tabela pokazuje 50 wierszy zaczynając od indeksu 201, paginator pokazuje "201-250 z 2605", combobox rows-per-page pokazuje "50"	PASS	-	-
INST-09	Excel export zawiera te same rekordy co widok filtrowany	P1 · Krytyczny	Widok filtrowany search=Akademia daje 571 wyników wg licznika "Znaleziono"	search: "Akademia"	1) Otwórz https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=0&search=Akademia 2) Kliknij przycisk "Pobierz listę instytucji w pliku Excel" 3) Otwórz pobrany plik lista_instytucji.xlsx	Plik Excel zawiera 571 wierszy danych (odpowiadając licznikowi w widoku), każdy wiersz ma "Akademia" w nazwie	FAIL	-	Rozjazd danych: widok pokazuje 571 wyników, plik zawiera 466 wierszy. Wszystkie 466 mają "Akademia" w nazwie (100%), ale 105 rekordów widocznych w wyszukiwarce nie trafiło do exportu. Naruszenie zasady best-practices: "Exported content matches the currently filtered view". Evidence: qa-runs/screenshots/RUN3-INST-09-export.xlsx
INST-10	Browser Back cofnie widok do poprzedniego URL-state	P2 · Wysoki	Użytkownik jest na stronie wyszukiwarki, brak aktywnych filtrów	-	1) Otwórz https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=0 2) Zmień URL na ?limit=20&offset=0&search=Akademia (nowa nawigacja) 3) Kliknij Back w przeglądarce	URL wraca do stanu bez search=Akademia, search input jest pusty, licznik pokazuje 2605	PASS	-	-
```

## Execution report

```tsv
ID	Status	Rzeczywisty rezultat	Waga	Zrzut ekranu	Reprodukcja
INST-01	PASS	Znaleziono: 571, paginator: "21-40 z 571", search input: "Akademia", pierwszy indeks wiersza: 21 — deep-link poprawnie restoruje wszystkie 3 parametry (search+offset+limit)	-	-	-
INST-02	PASS	Znaleziono: 84 dla search "łódź" (lowercase). Pierwsze wiersze: "Akademia Humanistyczno-Ekonomiczna w Łodzi" i podobne — case-insensitive z zachowaniem diacritics działa	-	-	-
INST-03	FAIL	Bezpośrednia nawigacja do URL z sort=-name nie stosuje sortowania desc. Pierwsze wiersze to "Dobre Imprezy", "Edu Leo", "FUNDACJA", "4Edu" — czyli default ascending order. Sort desc działa tylko po ręcznym kliknięciu nagłówka "Nazwa" (weryfikowane w INST-05 run2, gdzie pierwszy wiersz po klik desc to "Związek ZDZ Oddział w Warszawie")	Medium	screenshots/RUN3-INST-03.png	1) Otwórz nową kartę 2) Wklej https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=0&sort=-name 3) Obserwuj: sort nie jest zaaplikowany
INST-04	BLOCKED	Nie można zweryfikować polskiego porządku sortowania — baza 2605 wpisów nie zawiera nazw zaczynających się od Ż ani Ź. Search po fragmencie "Ż" znalazł 21 rekordów, wszystkie zawierają Ż w środku nazwy (np. "...Wydział w Żywcu"), żaden nie startuje z Ż	-	-	-
INST-05	PASS	Znaleziono: 1 dla search "\"Dobre Imprezy\"" (z cudzysłowami). Wynik: "Dobre Imprezy" Andrzej Prusisz. Brak console errors, backend prawidłowo obsługuje cudzysłowy w query string	-	-	-
INST-06	PASS	Znaleziono: 204 dla search "; Filia" (ze średnikiem). Wszystkie 20 widocznych wierszy zawiera średnik w nazwie. Backend prawidłowo obsługuje ; w query, nie łamie zapytania jako separator parametrów	-	-	-
INST-07	FAIL	URL auto-klamped z offset=99999 do offset=99980 (99999 - 19). Tabela pokazuje "Brak danych" (empty state OK). ALE paginator wyświetla "99981-2605 z 2605" — start (99981) > end (2605), logicznie niepoprawne. Powinno pokazywać ostatnią prawidłową stronę (2601-2605 z 2605) lub wyraźnie zakomunikować "strona nie istnieje"	Minor	screenshots/RUN3-INST-07.png	1) Otwórz https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=99999 2) Obserwuj paginator na dole tabeli
INST-08	PASS	URL ?limit=50&offset=200 pokazuje 50 wierszy, paginator: "201-250 z 2605", pierwsza kolumna indeksu: 201, combobox: 50 — zmiana limit nie teleportuje offset na 0	-	-	-
INST-09	FAIL	Klik "Pobierz listę instytucji w pliku Excel" na filtrowanym widoku (search=Akademia) pobrał plik lista_instytucji.xlsx zawierający 466 wierszy danych. Widok wskazywał 571 wyników. Rozjazd: 105 rekordów widocznych w wyszukiwarce (~18%) nie trafiło do exportu. Wszystkie 466 wierszy w pliku zawierają "Akademia" (filter zaaplikowany), więc export ISTNIEJE ale jest niekompletny. Naruszenie best-practices: "Exported content matches the filtered view"	Medium	screenshots/RUN3-INST-09-export.xlsx	1) Otwórz https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=0&search=Akademia 2) Zweryfikuj licznik = 571 3) Kliknij ikonę pobierania Excel 4) Otwórz pobrany plik i policz wiersze — będzie 466, nie 571
INST-10	PASS	Nawigacja: baseline → search=Akademia → Back → wróciło do baseline (URL bez search, znaleziono 2605, search input pusty). Historia URL zachowuje state	-	-	-
```

## Wnioski z runu

**3 realne bugi znalezione dzięki nowym regułom w best-practices.md** — poprzednie 2 runy tych case'ów nie miały i te bugi by nie były wykryte:

1. **INST-03 (URL as state)** — deep-link `?sort=-name` NIE stosuje sortu przy load. Naruszenie zasady „URL is state" — dzielenie się URL-em z posortowaną listą nie działa dla drugiego użytkownika.
2. **INST-07 (Pagination boundary)** — paginator wyświetla nonsensowną wartość „99981-2605 z 2605" przy offset >> total. Empty state OK, ale numeric display bug.
3. **INST-09 (Export consistency)** — pobrany Excel zawiera 466 z 571 wyników widoku. Ubytek ~18% rekordów niezauważalny bez explicit weryfikacji.

**1 BLOCKED** (INST-04) — polski sort nie da się zweryfikować bez testowych danych zawierających Ż/Ź. To ograniczenie bazy testowej, nie bug produktu.

**6 PASS** — case-insensitive Polish search działa, cudzysłowy/średniki w query nie łamią backend-u, limit-change nie teleportuje offset, Back navigation zachowuje historię, deep-link search+paginacja OK.
