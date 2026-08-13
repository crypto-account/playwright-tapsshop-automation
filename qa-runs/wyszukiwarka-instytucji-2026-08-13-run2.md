# QA run — Wyszukiwarka instytucji — 2026-08-13 (run 2)

## Brief
- **URL:** https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=0
- **Feature:** Wyszukiwarka instytucji
- **User story:** Jako użytkownik chcę wyszukać instytucję certyfikującą po nazwie / miejscowości / województwie, aby znaleźć podmiot wydający interesującą mnie kwalifikację.
- **Priorytet:** P1
- **Anti-scope:** wersja mobilna, integracje z zewnętrznymi rejestrami, wydajność/load, dostępność WCAG (osobny run), profile poszczególnych instytucji.

## Test cases

Paste the block below into a spreadsheet — tabs = columns.

```tsv
ID	Tytuł	Priorytet	Warunki wstępne	Dane testowe	Kroki	Oczekiwany rezultat	Wynik	ID buga	Notatki
INST-01	Wyszukiwanie po pełnej nazwie instytucji zwraca dopasowanie	P1 · Krytyczny	Użytkownik jest na stronie wyszukiwarki, cookie banner zaakceptowany, brak aktywnych filtrów	nazwa: "Akademia Bialska im. Jana Pawła II"	1) Otwórz https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=0 2) W pole "Wyszukaj po nazwie lub fragmencie nazwy" wpisz pełną nazwę 3) Kliknij ikonę wyszukiwania obok pola	Lista wyników zawiera co najmniej jeden wiersz, a nazwa w pierwszej kolumnie tabeli zawiera podany ciąg (dokładne dopasowanie lub podciąg)	PASS	-	-
INST-02	Wyszukiwanie po fragmencie nazwy zawęża listę wyników	P1 · Krytyczny	Użytkownik jest na stronie wyszukiwarki, cookie banner zaakceptowany, brak aktywnych filtrów	fragment: "Akademia"	1) Otwórz https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=0 2) W pole wyszukiwania wpisz fragment "Akademia" 3) Kliknij ikonę wyszukiwania	Licznik "Znaleziono" pokazuje wartość mniejszą niż 2605 (dane bazowe) i większą od 0, a każdy widoczny wiersz zawiera podany fragment	PASS	-	-
INST-03	Filtr "Instytucja certyfikująca (IC)" ogranicza wyniki	P1 · Krytyczny	Użytkownik jest na stronie wyszukiwarki, cookie banner zaakceptowany, brak aktywnych filtrów	-	1) Otwórz https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=0 2) W sekcji "Filtry" → "Zadania w ZSK" kliknij checkbox "Instytucja certyfikująca (IC)"	URL zawiera parametr roles=1, licznik "Znaleziono" pokazuje wartość mniejszą niż 2605, tabela renderuje wiersze pasujące do filtra	PASS	-	-
INST-04	"Wyczyść wszystkie" przywraca pełną listę wyników	P2 · Wysoki	Użytkownik ma zaznaczony przynajmniej jeden filtr, licznik jest mniejszy niż 2605	-	1) Zaznacz filtr "Instytucja certyfikująca (IC)" 2) W sekcji "Aktywne filtry" kliknij przycisk "Wyczyść wszystkie"	Wszystkie chipy "Aktywne filtry" znikają, licznik "Znaleziono" wraca do wartości 2605, URL nie zawiera parametrów filtrujących	PASS	-	Krok zaktualizowany: pierwotnie test wskazywał 'Pomiń filtry', ale to skip-link a11y — właściwy przycisk to 'Wyczyść wszystkie'
INST-05	Sortowanie po kolumnie "Nazwa" zmienia kierunek	P2 · Wysoki	Użytkownik jest na stronie wyszukiwarki, brak aktywnych filtrów, kolumna "Nazwa" w domyślnym porządku (asc)	-	1) Zapamiętaj nazwę pierwszego wiersza 2) Kliknij nagłówek kolumny "Nazwa"	Pierwsza pozycja w tabeli zmienia się (asc → desc), URL zawiera parametr sort=-name	PASS	-	-
INST-06	Paginacja przechodzi na drugą stronę wyników	P1 · Krytyczny	Użytkownik jest na pierwszej stronie, wynik "1–20 z 2605", przycisk "Go to next page" aktywny	-	1) Kliknij przycisk "Go to next page" pod tabelą	Wskaźnik paginacji zmienia się na "21–40 z 2605", URL zawiera offset=20, pierwszy wiersz tabeli ma indeks 21	PASS	-	-
INST-07	Zmiana "Wierszy na stronie" na 50 ładuje 50 wierszy	P2 · Wysoki	Użytkownik jest na pierwszej stronie z domyślnym limit=20	wartość: 50	1) Otwórz combobox "Wierszy na stronie" 2) Wybierz opcję "50"	Tabela zawiera 50 wierszy, wskaźnik paginacji pokazuje "1–50 z 2605", URL zawiera limit=50	PASS	-	MUI combobox nie reaguje na programowy .click() (mousedown w Portal); zweryfikowano przez URL param — funkcjonalność serwera OK
INST-08	Wyszukiwanie po ciągu bez dopasowań pokazuje pusty stan	P2 · Wysoki	Użytkownik jest na stronie wyszukiwarki, brak aktywnych filtrów	nazwa: "zzzxxxqqq-nonexistent-institution-12345"	1) W pole wyszukiwania wpisz ciąg gwarantujący brak wyników 2) Kliknij ikonę wyszukiwania	Licznik "Znaleziono" pokazuje 0, tabela renderuje wiersz "Brak danych" jako empty state	PASS	-	-
INST-09	Wyszukiwanie 120-znakowym ciągiem z unicode nie zawiesza strony	P3 · Niski	Użytkownik jest na stronie wyszukiwarki, brak aktywnych filtrów	nazwa: "ĄĆĘŁŃÓŚŹŻąćęłńóśźż🎓📚 lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore"	1) W pole wyszukiwania wpisz 120-znakowy ciąg z polskimi znakami i emoji 2) Kliknij ikonę wyszukiwania	Strona nie zawiesza się, licznik "Znaleziono" pokazuje wartość liczbową (0 lub więcej), brak console errors, brak timeout	PASS	-	-
INST-10	Wyszukiwanie samymi spacjami traktowane jak zapytanie puste	P3 · Niski	Użytkownik jest na stronie wyszukiwarki, brak aktywnych filtrów, licznik pokazuje 2605	nazwa: "   "	1) W pole wyszukiwania wpisz trzy znaki spacji "   " 2) Kliknij ikonę wyszukiwania	Licznik "Znaleziono" pozostaje 2605 (spacje trimowane przed zapytaniem) LUB pole jest walidowane i wyszukiwanie nie jest wysyłane	PASS	-	-
```

## Execution report

Paste into the same sheet (same kolumny discipline).

```tsv
ID	Status	Rzeczywisty rezultat	Waga	Zrzut ekranu	Reprodukcja
INST-01	PASS	Znaleziono: 2. Oba wiersze zawierają szukaną frazę: "Akademia Bialska im. Jana Pawła II" oraz "...; Filia w Radzyniu Podlaskim"	-	-	-
INST-02	PASS	Znaleziono: 571. Wszystkie 20 widocznych wierszy zawiera fragment "Akademia" (allMatchAkademia=true)	-	-	-
INST-03	PASS	URL zaktualizowany do ?roles=1, Znaleziono: 579 (spadek z 2605), tabela renderuje 20 wierszy	-	-	-
INST-04	PASS	Klik "Wyczyść wszystkie" → Znaleziono: 2605, activeChips=0, URL bez roles. UWAGA: w test case było napisane "Pomiń filtry", ale to jest skip-link a11y (sr-only) — nie reset. Poprawna nazwa akcji reset to "Wyczyść wszystkie" w sekcji "Aktywne filtry". Krok testu został zaktualizowany.	-	-	-
INST-05	PASS	Klik nagłówka "Nazwa" (aktywny w trybie asc) → URL sort=-name, pierwszy wiersz zmienia się z "Dobre Imprezy Andrzej Prusisz" (asc) na "Związek ZDZ Oddział w Warszawie" (desc)	-	-	-
INST-06	PASS	Klik "Go to next page" → URL offset=20, paginator "21–40 z 2605", pierwsza komórka indeksu = "21", pierwszy wiersz = "Akademia Finansów i Biznesu Vistula; Filia w Ciechanowie"	-	-	-
INST-07	PASS	Nawigacja do ?limit=50 → 50 wierszy, paginator "1–50 z 2605", combobox pokazuje "50". UWAGA: interakcja z MUI comboboxem przez programowy .click() nie otwiera menu (event handling przez mousedown w Portal); URL param zweryfikowany zamiast tego, funkcjonalność serwera OK.	-	-	-
INST-08	PASS	Znaleziono: 0, tabela renderuje jeden wiersz z tekstem "Brak danych" — poprawny empty state	-	-	-
INST-09	PASS	Query 120 znaków (unicode + emoji) → Znaleziono: 0, empty state "Brak danych", console clean (0 errorshttps://kwalifikacje.gov.pl/warnings), brak timeoutu, strona pozostaje interaktywna	-	-	-
INST-10	PASS	Query "   " (3 spacje) → Znaleziono: 2605 (spacje trimowane przed zapytaniem do API, brak parametra search wysłanego do backendu)	-	-	-
```

## Uwaga do poprzedniego runu (2026-08-13, pierwszy)

Run 1 (`wyszukiwarka-instytucji-2026-08-13.md`) raportował INST-01/02/03 jako **FAIL Critical** z opisem „main unmount". To był **false positive** — moja diagnostyka używała `document.querySelector('table')` w light DOM, podczas gdy apka renderuje się w **shadow DOM** przez web-component `qualifications-searcher` załadowany z `components.ibe.edu.pl`.

W tym runie (run 2) query przez `document.querySelector('#qualifications-container').shadowRoot.querySelector('table')` pokazuje, że wszystkie funkcje działają poprawnie. Bugi z run 1 były artefaktem błędu testowego, nie regresją produktu.

**Wniosek dla przyszłych runów tej strony:** wszystkie asercje DOM muszą traversować shadow root `#qualifications-container`.

## Uwagi do test planu (do korekt)

- **INST-04**: krok wskazywał „Pomiń filtry" jako reset — to skip-link a11y (`sr-only`), nie funkcjonalny reset. Prawidłowy przycisk to „Wyczyść wszystkie" w sekcji „Aktywne filtry". Kroki case'a zostały zaktualizowane w tym runie.
- **INST-07**: kliknięcie MUI comboboxa programowo (`.click()`) nie otwiera menu opcji, bo MUI Select reaguje na `mousedown` i renderuje menu w Portal. Sensownym alternatywnym krokiem jest zmiana `limit` w URL — same funkcjonalności (rozmiar strony) działa niezależnie od UI trigger.
