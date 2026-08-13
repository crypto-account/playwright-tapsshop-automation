# QA run — Wyszukiwarka instytucji — 2026-08-13 (run 4)

## Brief
- **URL:** https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=0
- **Feature:** Wyszukiwarka instytucji
- **User story:** Jako użytkownik chcę wyszukać instytucję certyfikującą po nazwie / miejscowości / województwie, aby znaleźć podmiot wydający interesującą mnie kwalifikację.
- **Priorytet:** P1
- **Anti-scope:** wersja mobilna, integracje z zewnętrznymi rejestrami, wydajność/load, dostępność WCAG (osobny run), profile poszczególnych instytucji.
- **Focus runu:** case'y zaprojektowane wg zaktualizowanego best-practices — proporcjonalne coverage (4 core happy-path + 2 negative + 2 bundled edges), bez enumeracji per-rule.

## Test cases

```tsv
ID	Tytuł	Priorytet	Warunki wstępne	Dane testowe	Kroki	Oczekiwany rezultat	Wynik	ID buga	Notatki
INST-01	Wyszukiwanie po nazwie instytucji zwraca dopasowanie	P1 · Krytyczny	Użytkownik jest na stronie wyszukiwarki, cookie banner zaakceptowany, brak aktywnych filtrów	nazwa: "Akademia Bialska"	1) Otwórz https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=0 2) W pole "Wyszukaj po nazwie lub fragmencie nazwy" wpisz "Akademia Bialska" 3) Kliknij ikonę wyszukiwania	Lista wyników zawiera co najmniej jeden wiersz, pierwszy wiersz zawiera nazwę pasującą do zapytania, licznik "Znaleziono" pokazuje wartość > 0	PASS	-	-
INST-02	Filtr "Instytucja certyfikująca (IC)" zawęża listę wyników	P1 · Krytyczny	Użytkownik jest na stronie wyszukiwarki z pełną listą 2605 instytucji, brak aktywnych filtrów	-	1) Otwórz https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=0 2) W sekcji "Filtry" → "Zadania w ZSK" zaznacz checkbox "Instytucja certyfikująca (IC)"	URL zawiera parametr roles=1, licznik "Znaleziono" pokazuje wartość mniejszą niż 2605	PASS	-	-
INST-03	Paginacja przechodzi na następną stronę wyników	P1 · Krytyczny	Użytkownik jest na pierwszej stronie z licznikiem "1-20 z 2605"	-	1) Otwórz https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=0 2) Kliknij przycisk "Go to next page" pod tabelą	Paginator pokazuje "21-40 z 2605", URL zawiera offset=20, pierwsza kolumna wiersza (indeks) pokazuje 21	PASS	-	-
INST-04	Sortowanie kolumny "Nazwa" zmienia kolejność wyników	P2 · Wysoki	Użytkownik jest na pierwszej stronie w domyślnym sort ascending ("Dobre Imprezy" jako pierwszy)	-	1) Otwórz https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=0 2) Kliknij nagłówek kolumny "Nazwa"	URL zawiera sort=-name, pierwszy wiersz to nazwa z końca alfabetu ("Związek ZDZ..." lub podobna)	PASS	-	-
INST-05	Wyszukiwanie ciągu bez dopasowań pokazuje empty state	P2 · Wysoki	Użytkownik jest na stronie wyszukiwarki, brak aktywnych filtrów	nazwa: "xyzq-nonexistent"	1) Otwórz https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=0 2) W pole wyszukiwania wpisz ciąg gwarantujący brak dopasowań 3) Kliknij ikonę wyszukiwania	Licznik "Znaleziono" pokazuje 0, tabela zawiera jeden wiersz z tekstem "Brak danych", brak console errors	PASS	-	-
INST-06	Nieprawidłowa wartość filtra w URL nie crashuje aplikacji	P2 · Wysoki	Użytkownik nawiguje bezpośrednio z zewnętrznego linku	URL: https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=0&roles=999	1) Otwórz podany URL bezpośrednio (roles=999 nie odpowiada żadnemu istniejącemu filtrowi)	Strona renderuje się poprawnie, empty state ("Brak danych"), licznik 0, brak crash / infinite loader / JS error	PASS	-	-
INST-07	Wyszukiwanie z polskimi diakrytykami, cudzysłowem i mieszaną wielkością liter w jednym query	P3 · Niski	Użytkownik jest na stronie wyszukiwarki, brak aktywnych filtrów	nazwa: `"akademia" Łódź` — łączy: (a) cudzysłowy specjalne w URL, (b) lowercase "akademia", (c) polskie diakrytyki Ł/ó/ź	1) Otwórz https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=20&offset=0&search=%22akademia%22+%C5%81%C3%B3d%C5%BA	Backend obsługuje wszystkie warunki naraz: znajduje wyniki (> 0), pierwsze wiersze zawierają "Akademia" i "Łodzi" (case-insensitive match z diacritics + niełamiące cudzysłowy)	PASS	-	Bundled edge case per zaktualizowane best-practices (Test data): grupujemy diakrytyki + case + special chars w jednym case zamiast enumerować osobno
INST-08	Paginacja przy dużym limit i głębokim offset renderuje poprawną stronę	P3 · Niski	Użytkownik nawiguje z linku do konkretnej pozycji w liście	URL: https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/?limit=100&offset=2500 (limit i offset zmieniane naraz, offset bliski końca 2605-rekordowej bazy)	1) Otwórz podany URL bezpośrednio	Tabela zawiera 100 wierszy (lub mniej jeśli koniec bazy), paginator pokazuje spójny zakres ("2501-2600 z 2605"), indeksy wierszy zaczynają się od 2501	PASS	-	Bundled edge case per zaktualizowane best-practices (Coverage → Edge): jeden case bundlujący dwa boundary conditions (large limit + deep offset) zamiast dwóch osobnych
```

## Execution report

```tsv
ID	Status	Rzeczywisty rezultat	Waga	Zrzut ekranu	Reprodukcja
INST-01	PASS	Znaleziono: 2 dla search "Akademia Bialska". Pierwszy wiersz: "Akademia Bialska im. Jana Pawła II", drugi z filią w Radzyniu Podlaskim	-	-	-
INST-02	PASS	Kliknięcie IC → URL updated do ?roles=1, Znaleziono: 579 (spadek z 2605 → subset IC)	-	-	-
INST-03	PASS	Klik Next page → URL offset=20, paginator "21-40 z 2605", pierwszy indeks wiersza = 21	-	-	-
INST-04	PASS	Klik nagłówka Nazwa → URL sort=-name, pierwszy wiersz zmienia się z "Dobre Imprezy Andrzej Prusisz" (asc default) na "Związek ZDZ Oddział w Warszawie" (desc)	-	-	-
INST-05	PASS	Search "xyzq-nonexistent" → licznik Znaleziono: 0, tabela renderuje jeden wiersz z tekstem "Brak danych" (poprawny empty state), brak console errors	-	-	-
INST-06	PASS	Bezpośrednia nawigacja do ?roles=999 → strona renderuje się bez crash, licznik 0, empty state "Brak danych", brak JS errors. Aplikacja gracefully handles nieprawidłowy filter ID	-	-	-
INST-07	PASS	Bundled query "akademia" Łódź → Znaleziono: 45, first 3 wyniki to Akademia Humanistyczno-Ekonomiczna w Łodzi + filie. Backend obsłużył jednocześnie: cudzysłowy w URL, case-insensitive dla "akademia", diakrytyki w "Łódź"	-	-	-
INST-08	PASS	URL ?limit=100&offset=2500 → 100 wierszy, paginator "2501-2600 z 2605", pierwszy indeks 2501, ostatni 2600. Nawigacja do głębokiego offset z dużym limit działa poprawnie	-	-	-
```
