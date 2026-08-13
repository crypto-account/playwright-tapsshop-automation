# QA run — Wyszukiwarka instytucji — 2026-08-13

## Brief
- **URL:** https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=0
- **Feature:** wyszukiwarka instytucji
- **User story:** Jako użytkownik chcę wyszukać instytucję certyfikującą po nazwie / miejscowości / województwie, aby znaleźć podmiot wydający interesującą mnie kwalifikację.
- **Priorytet:** P1
- **Anti-scope:** wersja mobilna, integracje z zewnętrznymi rejestrami, wydajność/load, dostępność WCAG (osobny run), profile poszczególnych instytucji.

## Test cases

Paste the block below into a spreadsheet — tabs = columns.

```tsv
ID	Suite	Title	Priority	Type	Preconditions	Steps	Expected Result	Test Data
INST-01	Wyszukiwarka instytucji	Wyszukiwanie po pełnej nazwie instytucji zwraca dopasowanie	P1	positive	Użytkownik jest na stronie wyszukiwarki, cookie banner zaakceptowany, brak aktywnych filtrów	1) Otwórz /wyszukiwarka-instytucji/?limit=20&offset=0 2) W pole "Wyszukaj po nazwie lub fragmencie nazwy" wpisz pełną nazwę 3) Kliknij ikonę wyszukiwania obok pola	Lista wyników zawiera co najmniej jeden wiersz, a nazwa w pierwszej kolumnie tabeli zawiera podany ciąg (dokładne dopasowanie lub podciąg)	nazwa: "Akademia Bialska im. Jana Pawła II"
INST-02	Wyszukiwarka instytucji	Wyszukiwanie po fragmencie nazwy zawęża listę wyników	P1	positive	Użytkownik jest na stronie wyszukiwarki, cookie banner zaakceptowany, brak aktywnych filtrów	1) Otwórz /wyszukiwarka-instytucji/?limit=20&offset=0 2) W pole wyszukiwania wpisz fragment "Akademia" 3) Kliknij ikonę wyszukiwania	Licznik "Znaleziono" pokazuje wartość mniejszą niż 2605 (dane bazowe) i większą od 0	fragment: "Akademia"
INST-03	Wyszukiwarka instytucji	Filtr "Instytucja certyfikująca (IC)" ogranicza wyniki	P1	positive	Użytkownik jest na stronie wyszukiwarki, cookie banner zaakceptowany, brak aktywnych filtrów	1) Otwórz /wyszukiwarka-instytucji/?limit=20&offset=0 2) W sekcji "Filtry" → "Zadania w ZSK" kliknij checkbox "Instytucja certyfikująca (IC)"	URL zawiera parametr roles=1, licznik "Znaleziono" pokazuje wartość mniejszą niż 2605, tabela renderuje maksymalnie 20 wierszy pasujących do filtra	-
INST-04	Wyszukiwarka instytucji	Pomiń filtry przywraca pełną listę wyników	P2	positive	Użytkownik ma zaznaczony przynajmniej jeden filtr, licznik jest mniejszy niż 2605	1) Zaznacz filtr "Instytucja certyfikująca (IC)" 2) Kliknij przycisk "Pomiń filtry" nad sekcją "Filtry"	Wszystkie chipy "Aktywne filtry" znikają, licznik "Znaleziono" wraca do wartości 2605, URL nie zawiera parametrów filtrujących	-
INST-05	Wyszukiwarka instytucji	Sortowanie po kolumnie "Nazwa" zmienia kierunek	P2	positive	Użytkownik jest na stronie wyszukiwarki, brak aktywnych filtrów, kolumna "Nazwa" w domyślnym porządku	1) Zapamiętaj nazwę pierwszego wiersza 2) Kliknij nagłówek "Nazwa" 3) Ponownie kliknij nagłówek "Nazwa"	Po każdym kliknięciu pierwsza pozycja w tabeli zmienia się (rosnąco ↔ malejąco); wskaźnik sortowania w nagłówku jest widoczny	-
INST-06	Wyszukiwarka instytucji	Paginacja przechodzi na drugą stronę wyników	P1	positive	Użytkownik jest na pierwszej stronie, wynik "1–20 z 2605", przycisk "Go to next page" aktywny	1) Kliknij przycisk "Go to next page" pod tabelą	Wskaźnik paginacji zmienia się na "21–40 z 2605", URL zawiera offset=20, pierwszy wiersz tabeli to 21 pozycja w kolejności	-
INST-07	Wyszukiwarka instytucji	Zmiana "Wierszy na stronie" na 50 ładuje 50 wierszy	P2	positive	Użytkownik jest na pierwszej stronie z domyślnym limit=20	1) Otwórz combobox "Wierszy na stronie" 2) Wybierz opcję "50"	Tabela zawiera 50 wierszy, wskaźnik paginacji pokazuje "1–50 z 2605", URL zawiera limit=50	wartość: 50
INST-08	Wyszukiwarka instytucji	Wyszukiwanie po ciągu bez dopasowań pokazuje pusty stan	P2	negative	Użytkownik jest na stronie wyszukiwarki, brak aktywnych filtrów	1) W pole wyszukiwania wpisz ciąg gwarantujący brak wyników 2) Kliknij ikonę wyszukiwania	Licznik "Znaleziono" pokazuje 0, tabela nie zawiera żadnych wierszy z danymi, widoczny jest komunikat o braku wyników LUB pusta tabela z zerową paginacją	nazwa: "zzzxxxqqq-nonexistent-institution-12345"
INST-09	Wyszukiwarka instytucji	Wyszukiwanie 120-znakowym ciągiem z unicode nie zawiesza strony	P3	edge	Użytkownik jest na stronie wyszukiwarki, brak aktywnych filtrów	1) W pole wyszukiwania wpisz 120-znakowy ciąg z polskimi znakami i emoji 2) Kliknij ikonę wyszukiwania	Strona nie zawiesza się, licznik "Znaleziono" pokazuje wartość liczbową (0 lub więcej), brak błędu 500/timeout, konsola bez uncaught exception	nazwa: "ĄĆĘŁŃÓŚŹŻąćęłńóśźż🎓📚 lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore"
INST-10	Wyszukiwarka instytucji	Wyszukiwanie samymi spacjami traktowane jak zapytanie puste	P3	edge	Użytkownik jest na stronie wyszukiwarki, brak aktywnych filtrów, licznik pokazuje 2605	1) W pole wyszukiwania wpisz trzy znaki spacji "   " 2) Kliknij ikonę wyszukiwania	Licznik "Znaleziono" pozostaje 2605 (spacje trimmed przed zapytaniem) LUB pole jest walidowane i wyszukiwanie nie jest wysyłane	nazwa: "   "
```

## Execution report

Paste into the same sheet (same kolumny discipline).

```tsv
ID	Status	Actual Result	Severity	Screenshot	Repro
INST-01	FAIL	Po kliknięciu przycisku wyszukiwania cała sekcja <main> (nagłówek, filtry, tabela wyników, paginacja) znika i nie odzyskuje się nawet po 8s czekania. URL zaktualizowany o ?search=..., ale brak jakichkolwiek treści merytorycznych	Critical	screenshots/INST-01.png	1) Otwórz /wyszukiwarka-instytucji/?limit=20&offset=0 2) Wpisz "Akademia Bialska im. Jana Pawła II" 3) Kliknij ikonę Szukaj obok pola — <main> unmount, brak wyników, brak komunikatu o błędzie
INST-02	FAIL	Identyczne zachowanie jak INST-01 — kliknięcie ikony wyszukiwania z fragmentem "Akademia" powoduje unmount sekcji <main>. Bezpośrednia nawigacja do URL z ?search=Akademia zwraca ten sam pusty stan (bug jest po stronie klienta, ale reprodukuje się też przez URL param)	Critical	screenshots/INST-02.png	1) Otwórz /wyszukiwarka-instytucji/?limit=20&offset=0&search=Akademia — <main> pusty, tabela nie renderuje się nigdy
INST-03	FAIL	Kliknięcie checkboxa "Instytucja certyfikująca (IC)" powoduje aktualizację URL do ...&roles=1, ale <main> unmount i nie odzyskuje się. Brak licznika "Znaleziono", brak tabeli, brak komunikatu o błędzie. W konsoli brak uncaught exception	Critical	screenshots/INST-03.png	1) Otwórz /wyszukiwarka-instytucji/?limit=20&offset=0 2) Kliknij checkbox "Instytucja certyfikująca (IC)" — <main> unmount
INST-04	BLOCKED	Test wymaga wcześniej zastosowanego filtra. Zastosowanie filtra (INST-03) wywala widok wyników — nie można doprowadzić do stanu wyjściowego, w którym reset ma się wykonać	-	-	Zablokowane przez bug INST-03
INST-05	BLOCKED	Po serii interakcji strona nawet dla czystego URL bez query params ładuje się z pustym <main> (mainInnerLen=0). Prawdopodobnie stan klienta jest trwale uszkodzony — możliwy wpływ cache/service-worker/storage; pełen restart kontekstu przeglądarki nie wystarczył	-	screenshots/INST-BLANK-STATE.png	Po INST-01…INST-03 sekwencji, ponowna nawigacja do bazowego URL nie renderuje treści; wymaga dalszego debug (Application storage / SW / stan Redux)
INST-06	BLOCKED	Jw. — nie można kliknąć "next page" na pustym widoku	-	-	Zablokowane przez trwale uszkodzony stan klienta (patrz INST-05)
INST-07	BLOCKED	Jw. — combobox "Wierszy na stronie" nie renderuje się	-	-	Zablokowane przez trwale uszkodzony stan klienta
INST-08	BLOCKED	Test bezpośrednio pokrywany przez tę samą ścieżkę co INST-01/02 (search) — nie może zostać wykonany, dopóki INST-01 nie zostanie naprawiony	-	-	Zablokowane przez bug INST-01/INST-02
INST-09	BLOCKED	Jw. — pokrywa search flow	-	-	Zablokowane przez bug INST-01/INST-02
INST-10	BLOCKED	Jw. — pokrywa search flow	-	-	Zablokowane przez bug INST-01/INST-02
```

## Notatka techniczna dla dev-team

Wszystkie trzy FAIL-e (INST-01, INST-02, INST-03) mają wspólny root cause: **każda zmiana query params (`search=`, `roles=`) unmountuje sekcję `<main>` i nie remountuje jej ponownie**. Test bezpośrednio wchodząc na URL z parametrem (`?search=Akademia`) reprodukuje bug — to nie jest problem samego przycisku, tylko renderowania wyników na podstawie stanu URL.

Do debugu:
- Console log jest czysty (0 errors/warnings) — bug nie propaguje wyjątku
- Baseline (bez params) działa
- Bug ma efekt sticky — po jego wystąpieniu nawet powrót do bazowego URL nie odzyskuje widoku (możliwy uszkodzony state w Redux/context)

Rekomendacja: sprawdzić w React DevTools boundary Error Boundary owijający sekcję wyników — prawdopodobnie łapie wyjątek cicho i renderuje null.
