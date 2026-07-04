# FT TEST SHOP v.2.1.7 — Kompleksowy Plan Testów E-Commerce

## Application Overview

FT TEST SHOP v.2.1.7 (https://tapsshop.pl/) to testowy sklep e-commerce zbudowany na platformie WooCommerce (WordPress). Sklep oferuje odzież i akcesoria (koszulki, bluzy, czapki, okulary, paski itp.) w jednej kategorii "Clothing" zawierającej 11 produktów. Strona dostępna jest w języku polskim, ceny wyrażone są w euro (EUR). Sklep posiada: stronę główną z sekcjami produktów (Nowe, Ulubione, Bestsellery), katalog produktów z sortowaniem i paginacją, karty produktów (proste i zmienne), koszyk, formularz zamówienia/checkout, panel konta użytkownika (logowanie, rejestracja, reset hasła), wyszukiwarkę oraz stronę 404. Na stronie widoczne są ostrzeżenia PHP (float-string) — jest to znany defekt środowiska testowego.

## Test Scenarios

### 1. TS-01: Strona Główna

**Seed:** `https://tapsshop.pl/`

#### 1.1. TC-01-01: Załadowanie strony głównej i weryfikacja podstawowych sekcji

**File:** `tests/homepage/tc-01-01-homepage-load.spec.ts`

**Steps:**
  1. Otwórz przeglądarkę i przejdź do https://tapsshop.pl/
    - expect: Strona ładuje się poprawnie z kodem HTTP 200
    - expect: Tytuł strony zawiera 'FT TEST SHOP v. 2.1.7'
    - expect: Logo sklepu jest widoczne w nagłówku
  2. Sprawdź widoczność banera informacyjnego 'Testowy sklep do testowania' na górze strony
    - expect: Baner z tekstem 'Testowy sklep do testowania' jest widoczny
    - expect: Przycisk 'Odrzuć' jest dostępny w banerze
  3. Sprawdź widoczność głównego menu nawigacji
    - expect: Menu zawiera linki: Strona główna, Koszyk, Moje konto, Zamówienie, Sklep, Oh no!
    - expect: Wszystkie linki nawigacyjne są klikalne
  4. Sprawdź sekcję 'Kupuj wg kategorii' na stronie głównej
    - expect: Sekcja 'Kupuj wg kategorii' jest widoczna
    - expect: Widoczna jest kategoria 'Clothing (11)' z obrazkiem i linkiem
  5. Sprawdź sekcję 'Nowe' na stronie głównej
    - expect: Sekcja 'Nowe' jest widoczna
    - expect: Wyświetla listę produktów z obrazkami, nazwami i cenami
    - expect: Produkty posiadają przyciski 'Dodaj do koszyka' lub 'Dowiedz się więcej'
  6. Sprawdź sekcję 'Ulubione' na stronie głównej
    - expect: Sekcja 'Ulubione' jest widoczna i zawiera produkty
  7. Sprawdź sekcję 'Bestsellery' na stronie głównej
    - expect: Sekcja 'Bestsellery' jest widoczna i zawiera produkty
  8. Sprawdź stopkę strony
    - expect: Stopka zawiera tekst z prawami autorskimi '© FT TEST SHOP v. 2.1.7 2026'
    - expect: Widoczny jest link do WooCommerce

#### 1.2. TC-01-02: Odrzucenie banera informacyjnego

**File:** `tests/homepage/tc-01-02-banner-dismiss.spec.ts`

**Steps:**
  1. Otwórz stronę główną https://tapsshop.pl/
    - expect: Baner 'Testowy sklep do testowania' jest widoczny na górze strony
  2. Kliknij przycisk 'Odrzuć' w banerze
    - expect: Baner znika ze strony
    - expect: Pozostała treść strony jest nadal w pełni widoczna i dostępna

#### 1.3. TC-01-03: Nawigacja z menu do poszczególnych sekcji

**File:** `tests/homepage/tc-01-03-navigation-links.spec.ts`

**Steps:**
  1. Otwórz stronę główną https://tapsshop.pl/
    - expect: Strona główna jest załadowana
  2. Kliknij link 'Sklep' w menu nawigacji
    - expect: Zostaje przekierowany na stronę https://tapsshop.pl/sklep/
    - expect: Tytuł strony zawiera 'Sklep'
  3. Kliknij logo lub link 'Strona główna' w menu nawigacji
    - expect: Zostaje przekierowany z powrotem na stronę główną https://tapsshop.pl/
  4. Kliknij link 'Koszyk' w menu nawigacji
    - expect: Zostaje przekierowany na stronę https://tapsshop.pl/koszyk/
    - expect: Tytuł strony zawiera 'Koszyk'
  5. Kliknij link 'Moje konto' w menu nawigacji
    - expect: Zostaje przekierowany na stronę https://tapsshop.pl/moje-konto/
    - expect: Wyświetlane są formularze logowania i rejestracji

#### 1.4. TC-01-04: Wyświetlanie licznika koszyka w nagłówku

**File:** `tests/homepage/tc-01-04-cart-counter-header.spec.ts`

**Steps:**
  1. Otwórz stronę główną https://tapsshop.pl/ przy pustym koszyku
    - expect: Licznik koszyka w nagłówku pokazuje '€0,00 0 Produkt'
  2. Kliknij przycisk 'Dodaj do koszyka' przy produkcie Polo (€20,00) w sekcji 'Nowe'
    - expect: Licznik koszyka w nagłówku aktualizuje się do '€20,00 1 Produkt'
  3. Najedź kursorem na ikonę koszyka w nagłówku
    - expect: Pojawia się rozwijana lista z dodanym produktem
    - expect: Widoczna jest nazwa produktu, ilość i cena
    - expect: Dostępne są linki 'Zobacz koszyk' i 'Zamówienie'

#### 1.5. TC-01-05: Kliknięcie w produkt na stronie głównej przenosi do karty produktu

**File:** `tests/homepage/tc-01-05-product-link-from-homepage.spec.ts`

**Steps:**
  1. Otwórz stronę główną https://tapsshop.pl/
    - expect: Strona główna jest załadowana z listami produktów
  2. W sekcji 'Nowe' kliknij na obrazek lub nazwę produktu 'Beanie'
    - expect: Zostaje przekierowany na stronę https://tapsshop.pl/produkt/beanie/
    - expect: Strona produktu Beanie jest załadowana z poprawnymi danymi

### 2. TS-02: Katalog Produktów i Kategorie

**Seed:** `https://tapsshop.pl/sklep/`

#### 2.1. TC-02-01: Wyświetlenie listy produktów w sklepie

**File:** `tests/catalog/tc-02-01-shop-product-listing.spec.ts`

**Steps:**
  1. Przejdź na stronę https://tapsshop.pl/sklep/
    - expect: Strona 'Sklep' ładuje się poprawnie
    - expect: Widoczny jest nagłówek 'Sklep'
    - expect: Breadcrumb pokazuje 'Strona główna / Sklep'
  2. Sprawdź licznik wyświetlanych wyników
    - expect: Widoczny jest status 'Wyświetlanie 1–8 z 11 wyników'
  3. Sprawdź, czy na pierwszej stronie wyświetla się 8 produktów
    - expect: Na liście widocznych jest dokładnie 8 produktów
    - expect: Każdy produkt posiada: obrazek, nazwę, cenę i przycisk akcji (Dodaj do koszyka lub Dowiedz się więcej)

#### 2.2. TC-02-02: Paginacja — przejście na drugą stronę katalogu

**File:** `tests/catalog/tc-02-02-pagination.spec.ts`

**Steps:**
  1. Przejdź na stronę https://tapsshop.pl/sklep/
    - expect: Widoczna jest nawigacja paginacji z linkami '1', '2' i strzałką '→'
  2. Kliknij link 'Strona 2' lub strzałkę '→' w paginacji
    - expect: Strona przeładowuje się i URL zmienia się na https://tapsshop.pl/sklep/page/2/
    - expect: Wyświetlane są pozostałe produkty (3 produkty, tj. 11 minus 8)
  3. Sprawdź, czy na drugiej stronie widoczna jest paginacja umożliwiająca powrót do strony 1
    - expect: Widoczny jest link do strony '1' lub strzałka wstecz '←'
  4. Kliknij link powrotu do strony 1
    - expect: URL wraca do https://tapsshop.pl/sklep/
    - expect: Ponownie wyświetlane jest 8 produktów

#### 2.3. TC-02-03: Sortowanie produktów — od najniższej ceny

**File:** `tests/catalog/tc-02-03-sorting-price-asc.spec.ts`

**Steps:**
  1. Przejdź na stronę https://tapsshop.pl/sklep/
    - expect: Domyślne sortowanie jest aktywne ('Domyślne sortowanie')
  2. Rozwiń dropdown 'Zamówienie w sklepie' i wybierz opcję 'Sortuj po cenie od najniższej'
    - expect: Strona przeładowuje się lub lista aktualizuje się
    - expect: Produkty są posortowane rosnąco według ceny — produkt najtańszy (np. Cap €18,00 lub T-Shirt €18,00) jest pierwszy na liście

#### 2.4. TC-02-04: Sortowanie produktów — od najwyższej ceny

**File:** `tests/catalog/tc-02-04-sorting-price-desc.spec.ts`

**Steps:**
  1. Przejdź na stronę https://tapsshop.pl/sklep/
    - expect: Lista produktów jest załadowana
  2. Rozwiń dropdown 'Zamówienie w sklepie' i wybierz opcję 'Sortuj po cenie od najwyższej'
    - expect: Produkty są posortowane malejąco według ceny — produkt najdroższy (Sunglasses €90,00) jest pierwszy na liście

#### 2.5. TC-02-05: Sortowanie produktów — od najnowszych

**File:** `tests/catalog/tc-02-05-sorting-newest.spec.ts`

**Steps:**
  1. Przejdź na stronę https://tapsshop.pl/sklep/
    - expect: Lista produktów jest załadowana
  2. Rozwiń dropdown 'Zamówienie w sklepie' i wybierz opcję 'Sortuj od najnowszych'
    - expect: Kolejność produktów na liście zmienia się zgodnie z datą dodania
    - expect: Liczba wyświetlanych produktów pozostaje taka sama

#### 2.6. TC-02-06: Przeglądanie kategorii Clothing

**File:** `tests/catalog/tc-02-06-category-clothing.spec.ts`

**Steps:**
  1. Ze strony głównej kliknij na kategorię 'Clothing' w sekcji 'Kupuj wg kategorii'
    - expect: Zostaje przekierowany na https://tapsshop.pl/kategoria-produktu/clothing/
    - expect: Tytuł strony to 'Clothing'
    - expect: Breadcrumb pokazuje 'Strona główna / Clothing'
  2. Sprawdź liczbę wyświetlanych produktów w kategorii
    - expect: Status pokazuje 'Wyświetlanie 1–8 z 11 wyników'
    - expect: Widoczna jest paginacja z 2 stronami
  3. Sprawdź, czy dropdown sortowania jest dostępny na stronie kategorii
    - expect: Dropdown 'Zamówienie w sklepie' jest widoczny i funkcjonalny

### 3. TS-03: Wyszukiwarka

**Seed:** `https://tapsshop.pl/`

#### 3.1. TC-03-01: Wyszukiwanie produktu po pełnej nazwie — happy path

**File:** `tests/search/tc-03-01-search-full-name.spec.ts`

**Steps:**
  1. Otwórz stronę główną https://tapsshop.pl/
    - expect: Pole wyszukiwarki jest widoczne w nagłówku z etykietą 'Szukaj:'
  2. Kliknij w pole wyszukiwarki i wpisz frazę 'Beanie'
    - expect: Tekst 'Beanie' jest widoczny w polu wyszukiwarki
  3. Kliknij przycisk 'Szukaj' lub naciśnij Enter
    - expect: Zostaje przekierowany na stronę wyników wyszukiwania z URL zawierającym '?s=Beanie'
    - expect: Na stronie widoczny jest tytuł zawierający szukaną frazę
    - expect: Wyświetlony jest co najmniej jeden wynik — produkt 'Beanie'

#### 3.2. TC-03-02: Wyszukiwanie produktu po częściowej nazwie

**File:** `tests/search/tc-03-02-search-partial-name.spec.ts`

**Steps:**
  1. Otwórz stronę główną https://tapsshop.pl/ i kliknij w pole wyszukiwarki
    - expect: Pole wyszukiwarki jest aktywne
  2. Wpisz częściową frazę 'Hoodi' (bez końcówki 'e') i naciśnij Enter lub kliknij 'Szukaj'
    - expect: Wyświetlana jest strona wyników wyszukiwania
    - expect: Wyniki zawierają produkty z nazwy zawierające 'Hoodie' (np. Hoodie, Hoodie with Logo, Hoodie with Zipper)

#### 3.3. TC-03-03: Wyszukiwanie frazy nieistniejącej — brak wyników

**File:** `tests/search/tc-03-03-search-no-results.spec.ts`

**Steps:**
  1. Otwórz stronę główną https://tapsshop.pl/ i kliknij w pole wyszukiwarki
    - expect: Pole wyszukiwarki jest aktywne
  2. Wpisz frazę nieistniejącą np. 'xyznonexistent123' i naciśnij Enter lub kliknij 'Szukaj'
    - expect: Zostaje przekierowany na stronę wyników z URL zawierającym '?s=xyznonexistent123'
    - expect: Wyświetlany jest nagłówek 'Niczego nie znaleziono'
    - expect: Widoczny jest komunikat 'Brak wyników wyszukiwania. Proszę spróbować ponownie z innymi słowami.'
    - expect: Wyświetlane jest ponowne pole wyszukiwarki

#### 3.4. TC-03-04: Wyszukiwanie z pustym polem

**File:** `tests/search/tc-03-04-search-empty.spec.ts`

**Steps:**
  1. Otwórz stronę główną https://tapsshop.pl/
    - expect: Pole wyszukiwarki jest puste
  2. Upewnij się, że pole wyszukiwarki jest puste i kliknij przycisk 'Szukaj'
    - expect: Strona nie zgłasza błędu JS
    - expect: Użytkownik jest przekierowany na stronę wyników lub strona główna jest przeładowana — brak błędu 500

#### 3.5. TC-03-05: Wyszukiwanie małymi literami — weryfikacja case-insensitivity

**File:** `tests/search/tc-03-05-search-case-insensitive.spec.ts`

**Steps:**
  1. Otwórz stronę główną https://tapsshop.pl/ i kliknij w pole wyszukiwarki
    - expect: Pole wyszukiwarki jest aktywne
  2. Wpisz frazę 'beanie' (małymi literami) i naciśnij Enter
    - expect: Wyniki wyszukiwania zawierają produkt 'Beanie'
    - expect: Wyszukiwarka jest niewrażliwa na wielkość liter

### 4. TS-04: Karta Produktu

**Seed:** `https://tapsshop.pl/produkt/beanie/`

#### 4.1. TC-04-01: Wyświetlenie karty prostego produktu — Beanie

**File:** `tests/product/tc-04-01-simple-product-page.spec.ts`

**Steps:**
  1. Przejdź bezpośrednio na https://tapsshop.pl/produkt/beanie/
    - expect: Strona produktu ładuje się poprawnie
    - expect: Tytuł strony zawiera 'Beanie'
  2. Sprawdź wyświetlane informacje o produkcie
    - expect: Nagłówek h1 zawiera nazwę 'Beanie'
    - expect: Cena €20,00 jest widoczna
    - expect: Opis produktu jest wyświetlany w zakładce 'Opis'
    - expect: SKU produktu (woo-beanie) jest widoczny
    - expect: Kategoria 'Accessories' jest wyświetlana jako link
  3. Sprawdź galerię zdjęć produktu
    - expect: Główne zdjęcie produktu jest wyświetlane
    - expect: Dostępny jest przycisk pełnoekranowej galerii
    - expect: Miniaturki zdjęć są widoczne poniżej głównego zdjęcia
  4. Sprawdź formularz dodawania do koszyka
    - expect: Pole 'Ilość produktu' (spinbutton) jest widoczne z domyślną wartością '1'
    - expect: Przycisk 'Dodaj do koszyka' jest widoczny i aktywny
  5. Sprawdź breadcrumb (okruszki) na stronie produktu
    - expect: Breadcrumb pokazuje: Strona główna / Clothing / Accessories / Beanie

#### 4.2. TC-04-02: Zakładki na karcie produktu — Opis, Informacje dodatkowe, Opinie

**File:** `tests/product/tc-04-02-product-tabs.spec.ts`

**Steps:**
  1. Przejdź na https://tapsshop.pl/produkt/beanie/
    - expect: Strona produktu jest załadowana
  2. Sprawdź, czy zakładka 'Opis' jest domyślnie aktywna i widoczna jest treść opisu
    - expect: Zakładka 'Opis' jest zaznaczona (selected)
    - expect: Panel 'Opis' wyświetla treść opisową produktu
  3. Kliknij na zakładkę 'Informacje dodatkowe'
    - expect: Zakładka 'Informacje dodatkowe' staje się aktywna
    - expect: Panel z informacjami dodatkowymi jest wyświetlany
  4. Kliknij na zakładkę 'Opinie (0)'
    - expect: Zakładka 'Opinie' staje się aktywna
    - expect: Panel z opiniami jest wyświetlany (pusty lub z formularzem dodawania opinii)

#### 4.3. TC-04-03: Wyświetlenie karty produktu zmiennego (niedostępnego) — Hoodie

**File:** `tests/product/tc-04-03-variable-product-out-of-stock.spec.ts`

**Steps:**
  1. Przejdź na https://tapsshop.pl/produkt/hoodie/
    - expect: Strona produktu Hoodie ładuje się poprawnie
  2. Sprawdź status dostępności produktu
    - expect: Widoczna jest informacja 'Tego produktu nie ma na stanie i nie jest dostępny.'
    - expect: Brak przycisku 'Dodaj do koszyka'
    - expect: Na liście w sklepie przy tym produkcie widoczny jest przycisk 'Dowiedz się więcej' (nie 'Dodaj do koszyka')
  3. Sprawdź, czy wyświetlana jest galeria zdjęć z wieloma miniaturkami
    - expect: Widoczne są 4 miniaturki zdjęć produktu Hoodie
  4. Sprawdź sekcję 'Podobne produkty'
    - expect: Sekcja 'Podobne produkty' jest widoczna na dole strony
    - expect: Wyświetlone są powiązane produkty z kategorii Hoodies

#### 4.4. TC-04-04: Sekcja podobnych produktów na karcie produktu

**File:** `tests/product/tc-04-04-related-products.spec.ts`

**Steps:**
  1. Przejdź na https://tapsshop.pl/produkt/beanie/
    - expect: Strona produktu jest załadowana
  2. Przewiń stronę w dół do sekcji 'Podobne produkty'
    - expect: Sekcja 'Podobne produkty' jest widoczna
    - expect: Wyświetlone są co najmniej 1-3 powiązane produkty z podobnej kategorii (Accessories/Clothing)
  3. Kliknij na jeden z podobnych produktów
    - expect: Zostaje przekierowany na stronę klikniętego produktu

#### 4.5. TC-04-05: Galeria produktu — pełnoekranowy widok

**File:** `tests/product/tc-04-05-product-gallery-fullscreen.spec.ts`

**Steps:**
  1. Przejdź na https://tapsshop.pl/produkt/hoodie/ (produkt z wieloma zdjęciami)
    - expect: Strona produktu jest załadowana
    - expect: Widoczne są 4 miniaturki zdjęć
  2. Kliknij przycisk 'Wyświetl pełnoekranową galerię obrazków'
    - expect: Galeria otwiera się w trybie pełnoekranowym lub lightbox
    - expect: Zdjęcie produktu jest powiększone

### 5. TS-05: Koszyk

**Seed:** `https://tapsshop.pl/koszyk/`

#### 5.1. TC-05-01: Wyświetlenie pustego koszyka

**File:** `tests/cart/tc-05-01-empty-cart.spec.ts`

**Steps:**
  1. Przejdź bezpośrednio na https://tapsshop.pl/koszyk/ przy pustym koszyku (fresh state)
    - expect: Strona koszyka ładuje się poprawnie
    - expect: Widoczna jest informacja 'Twój koszyk aktualnie jest pusty.'
    - expect: Widoczny jest link 'Wróć do sklepu'
  2. Kliknij link 'Wróć do sklepu'
    - expect: Zostaje przekierowany na https://tapsshop.pl/sklep/

#### 5.2. TC-05-02: Dodanie prostego produktu do koszyka ze strony produktu

**File:** `tests/cart/tc-05-02-add-simple-product-to-cart.spec.ts`

**Steps:**
  1. Przejdź na https://tapsshop.pl/produkt/beanie/
    - expect: Strona produktu Beanie jest załadowana
  2. Upewnij się, że pole ilości zawiera wartość '1', a następnie kliknij przycisk 'Dodaj do koszyka'
    - expect: Pojawia się komunikat potwierdzający dodanie produktu (np. komunikat sukcesu lub aktualizacja licznika koszyka)
    - expect: Licznik koszyka w nagłówku aktualizuje się do '€20,00 1 Produkt'
  3. Przejdź na stronę koszyka https://tapsshop.pl/koszyk/
    - expect: W koszyku widoczny jest produkt 'Beanie' z ceną €20,00 i ilością 1
    - expect: Podsumowanie koszyka pokazuje: Kwota €20,00, Przesyłka Płaska Stawka €5,00, VAT €5,75, Łącznie €30,75

#### 5.3. TC-05-03: Dodanie produktu do koszyka z listy produktów (bez wchodzenia w kartę produktu)

**File:** `tests/cart/tc-05-03-add-product-from-listing.spec.ts`

**Steps:**
  1. Przejdź na https://tapsshop.pl/sklep/
    - expect: Lista produktów jest załadowana
  2. Znajdź produkt 'Cap' (€18,00) na liście i kliknij przycisk 'Dodaj do koszyka'
    - expect: Przycisk zmienia stan (np. zmiana tekstu lub animacja)
    - expect: Licznik koszyka w nagłówku aktualizuje się
  3. Przejdź na stronę https://tapsshop.pl/koszyk/ i sprawdź zawartość
    - expect: Produkt 'Cap' jest widoczny w koszyku z ceną €18,00

#### 5.4. TC-05-04: Zmiana ilości produktu w koszyku

**File:** `tests/cart/tc-05-04-change-quantity-in-cart.spec.ts`

**Steps:**
  1. Dodaj produkt Beanie do koszyka (przejdź na https://tapsshop.pl/produkt/beanie/?add-to-cart=46), następnie przejdź na https://tapsshop.pl/koszyk/
    - expect: Koszyk zawiera 1 szt. Beanie z łączną kwotą €20,00
  2. W kolumnie 'Ilość' przy produkcie Beanie zmień wartość w polu spinbutton z '1' na '3'
    - expect: Wartość w polu ilości zmienia się na 3
  3. Kliknij przycisk 'Zaktualizuj koszyk' (który staje się aktywny po zmianie ilości)
    - expect: Koszyk odświeża się
    - expect: Kolumna 'Kwota' przy produkcie Beanie zmienia się na €60,00
    - expect: Podsumowanie koszyka aktualizuje się: Kwota €60,00, łączna kwota wzrasta odpowiednio

#### 5.5. TC-05-05: Usunięcie produktu z koszyka przyciskiem X

**File:** `tests/cart/tc-05-05-remove-product-from-cart.spec.ts`

**Steps:**
  1. Dodaj produkt Belt do koszyka (przejdź na https://tapsshop.pl/produkt/belt/?add-to-cart=47), następnie przejdź na https://tapsshop.pl/koszyk/
    - expect: Koszyk zawiera produkt 'Belt'
  2. Kliknij przycisk 'Usuń Belt z koszyka' (× przy wierszu produktu)
    - expect: Produkt 'Belt' zostaje usunięty z koszyka
    - expect: Wyświetlany jest komunikat 'Twój koszyk aktualnie jest pusty.' lub koszyk jest zaktualizowany bez tego produktu

#### 5.6. TC-05-06: Użycie kodu kuponu w koszyku

**File:** `tests/cart/tc-05-06-coupon-code.spec.ts`

**Steps:**
  1. Dodaj produkt do koszyka i przejdź na https://tapsshop.pl/koszyk/
    - expect: Koszyk zawiera produkt i wyświetlone jest podsumowanie
    - expect: Widoczne jest pole 'Kupon:' z placeholder 'Kod kuponu' i przycisk 'Wykorzystaj kupon'
  2. Wpisz nieprawidłowy kod kuponu np. 'INVALID123' w polu 'Kupon:' i kliknij 'Wykorzystaj kupon'
    - expect: Pojawia się komunikat błędu informujący o nieważnym kodzie kuponu
    - expect: Cena w koszyku nie zmienia się

#### 5.7. TC-05-07: Przejście do checkout z koszyka

**File:** `tests/cart/tc-05-07-cart-to-checkout.spec.ts`

**Steps:**
  1. Dodaj produkt Polo do koszyka i przejdź na https://tapsshop.pl/koszyk/
    - expect: Koszyk zawiera produkt
    - expect: Widoczny jest przycisk 'Przejdź do płatności'
  2. Kliknij link 'Przejdź do płatności'
    - expect: Zostaje przekierowany na https://tapsshop.pl/zamowienie/
    - expect: Wyświetlany jest formularz zamówienia z danymi rozliczeniowymi

### 6. TS-06: Checkout — Proces Zamówienia

**Seed:** `https://tapsshop.pl/zamowienie/`

#### 6.1. TC-06-01: Wyświetlenie strony checkout z produktem w koszyku

**File:** `tests/checkout/tc-06-01-checkout-page-display.spec.ts`

**Steps:**
  1. Dodaj produkt Beanie do koszyka (przejdź na https://tapsshop.pl/produkt/beanie/?add-to-cart=46), następnie przejdź na https://tapsshop.pl/zamowienie/
    - expect: Strona zamówienia ładuje się poprawnie
    - expect: Tytuł strony zawiera 'Zamówienie'
    - expect: Breadcrumb pokazuje 'Strona główna / Zamówienie'
  2. Sprawdź, czy sekcja 'Dane rozliczeniowe' zawiera wszystkie wymagane pola
    - expect: Widoczne są pola: Imię (*), Nazwisko (*), Nazwa firmy (opcjonalne), Kraj/region (*), Ulica (*), Nr mieszkania (opcjonalne), Kod pocztowy (*), Miasto (*), Numer telefonu (*), Adres email (*)
  3. Sprawdź podsumowanie zamówienia po prawej stronie
    - expect: W tabeli 'Twoje zamówienie' widoczny jest produkt 'Beanie × 1' z kwotą €20,00
    - expect: Widoczna jest Przesyłka (Płaska Stawka €5,00), VAT €5,75 i Łącznie €30,75
  4. Sprawdź sekcję metody płatności
    - expect: Widoczna jest opcja 'Przelew bankowy' z opisem instrukcji płatności
    - expect: Widoczny jest przycisk 'Kupuję i płacę'

#### 6.2. TC-06-02: Przekierowanie do koszyka przy próbie wejścia na checkout z pustym koszykiem

**File:** `tests/checkout/tc-06-02-checkout-redirect-empty-cart.spec.ts`

**Steps:**
  1. Upewnij się, że koszyk jest pusty (fresh state), a następnie przejdź bezpośrednio na https://tapsshop.pl/zamowienie/
    - expect: Strona automatycznie przekierowuje na https://tapsshop.pl/koszyk/
    - expect: Wyświetlany jest komunikat 'Twój koszyk aktualnie jest pusty.'

#### 6.3. TC-06-03: Walidacja formularza checkout — puste pola wymagane

**File:** `tests/checkout/tc-06-03-checkout-validation-empty-fields.spec.ts`

**Steps:**
  1. Dodaj produkt do koszyka i przejdź na https://tapsshop.pl/zamowienie/
    - expect: Formularz zamówienia jest wyświetlony
  2. Nie wypełniaj żadnych pól formularza i kliknij przycisk 'Kupuję i płacę'
    - expect: Formularz nie jest wysłany
    - expect: Wyświetlane są komunikaty błędów przy polach wymaganych (oznaczonych gwiazdką *)
    - expect: Użytkownik jest informowany o brakujących danych

#### 6.4. TC-06-04: Walidacja formularza checkout — nieprawidłowy format email

**File:** `tests/checkout/tc-06-04-checkout-invalid-email.spec.ts`

**Steps:**
  1. Dodaj produkt do koszyka i przejdź na https://tapsshop.pl/zamowienie/
    - expect: Formularz zamówienia jest wyświetlony
  2. Wypełnij wszystkie pola wymagane poprawnymi danymi, ale w polu 'Adres email' wpisz wartość bez znaku @ np. 'nieprawidlowy-email'
    - expect: Dane do wypełnienia: Imię='Jan', Nazwisko='Kowalski', Ulica='Testowa 1', Kod pocztowy='00-001', Miasto='Warszawa', Telefon='500600700'
  3. Kliknij przycisk 'Kupuję i płacę'
    - expect: Formularz nie jest wysłany
    - expect: Wyświetlany jest komunikat błędu przy polu email (nieprawidłowy format adresu e-mail)

#### 6.5. TC-06-05: Opcja wysyłki na inny adres (checkbox)

**File:** `tests/checkout/tc-06-05-checkout-ship-to-different-address.spec.ts`

**Steps:**
  1. Dodaj produkt do koszyka i przejdź na https://tapsshop.pl/zamowienie/
    - expect: Formularz zamówienia jest wyświetlony
  2. Znajdź sekcję 'Wysłać na inny adres?' i sprawdź domyślny stan checkboxa
    - expect: Checkbox 'Wysłać na inny adres?' jest domyślnie odznaczony
  3. Kliknij checkbox 'Wysłać na inny adres?', aby go zaznaczyć
    - expect: Checkbox zmienia stan na zaznaczony
    - expect: Pojawia się dodatkowy formularz adresu dostawy z polami (Imię, Nazwisko, Firma, Kraj/region, Ulica, Kod pocztowy, Miasto)

#### 6.6. TC-06-06: Opcja 'Stworzyć konto?' na stronie checkout

**File:** `tests/checkout/tc-06-06-checkout-create-account.spec.ts`

**Steps:**
  1. Dodaj produkt do koszyka i przejdź na https://tapsshop.pl/zamowienie/
    - expect: Formularz zamówienia jest wyświetlony
  2. Znajdź checkbox 'Stworzyć konto?' pod formularzem danych rozliczeniowych i kliknij go
    - expect: Checkbox zmienia stan na zaznaczony
    - expect: Mogą pojawić się dodatkowe pola do ustawienia hasła dla nowego konta

#### 6.7. TC-06-07: Pole kodu kuponu na stronie checkout

**File:** `tests/checkout/tc-06-07-checkout-coupon.spec.ts`

**Steps:**
  1. Dodaj produkt do koszyka i przejdź na https://tapsshop.pl/zamowienie/
    - expect: Na stronie widoczny jest element 'Masz kupon?'
  2. Kliknij na 'Kliknij tutaj, aby dodać swój kod' lub przycisk przy 'Masz kupon?'
    - expect: Pojawia się pole tekstowe umożliwiające wpisanie kodu kuponu

#### 6.8. TC-06-08: Happy path — wypełnienie formularza checkout poprawnymi danymi

**File:** `tests/checkout/tc-06-08-checkout-happy-path-fill-form.spec.ts`

**Steps:**
  1. Dodaj produkt Beanie do koszyka i przejdź na https://tapsshop.pl/zamowienie/
    - expect: Formularz zamówienia jest wyświetlony z produktem w podsumowaniu
  2. Wypełnij formularz danych rozliczeniowych: Imię='Jan', Nazwisko='Testowy', Kraj='Polska', Ulica='ul. Testowa 1', Kod pocztowy='00-001', Miasto='Warszawa', Telefon='500123456', Email='test@example.com'
    - expect: Wszystkie pola są wypełnione poprawnymi danymi
    - expect: Formularz nie pokazuje błędów walidacji
  3. Sprawdź, czy metoda płatności 'Przelew bankowy' jest zaznaczona i widoczne jest podsumowanie: Beanie x1 €20,00, Przesyłka €5,00, VAT €5,75, Łącznie €30,75
    - expect: Podsumowanie zamówienia jest poprawne
    - expect: Przycisk 'Kupuję i płacę' jest dostępny

### 7. TS-07: Konto Użytkownika

**Seed:** `https://tapsshop.pl/moje-konto/`

#### 7.1. TC-07-01: Wyświetlenie strony 'Moje konto' dla niezalogowanego użytkownika

**File:** `tests/account/tc-07-01-my-account-page-logged-out.spec.ts`

**Steps:**
  1. Przejdź na https://tapsshop.pl/moje-konto/ przy braku aktywnej sesji
    - expect: Strona ładuje się poprawnie
    - expect: Tytuł strony zawiera 'Moje konto'
    - expect: Breadcrumb pokazuje 'Strona główna / Moje konto'
  2. Sprawdź widoczność formularzy na stronie
    - expect: Widoczna jest sekcja 'Logowanie' z polami: 'Nazwa użytkownika lub adres e-mail' i 'Hasło'
    - expect: Widoczna jest sekcja 'Zarejestruj się' z polem 'Adres email'
    - expect: Widoczny jest przycisk 'Zaloguj się' i przycisk 'Zarejestruj się'
    - expect: Widoczny jest link 'Nie pamiętasz hasła?'

#### 7.2. TC-07-02: Logowanie z nieprawidłowymi danymi

**File:** `tests/account/tc-07-02-login-invalid-credentials.spec.ts`

**Steps:**
  1. Przejdź na https://tapsshop.pl/moje-konto/
    - expect: Formularz logowania jest widoczny
  2. W sekcji 'Logowanie' wpisz: Nazwa użytkownika='nieistniejacy@example.com', Hasło='BledneHaslo123!'
    - expect: Pola są wypełnione wprowadzonymi wartościami
  3. Kliknij przycisk 'Zaloguj się'
    - expect: Logowanie kończy się niepowodzeniem
    - expect: Wyświetlany jest komunikat błędu informujący o nieprawidłowych danych logowania
    - expect: Użytkownik pozostaje na stronie 'Moje konto'

#### 7.3. TC-07-03: Walidacja logowania — puste pola

**File:** `tests/account/tc-07-03-login-empty-fields.spec.ts`

**Steps:**
  1. Przejdź na https://tapsshop.pl/moje-konto/
    - expect: Formularz logowania jest widoczny
  2. Pozostaw oba pola formularza logowania puste i kliknij 'Zaloguj się'
    - expect: Formularz nie jest wysłany lub zwracany jest błąd
    - expect: Wyświetlany jest komunikat błędu o wymaganych polach (pola oznaczone * są wymagane)
    - expect: Użytkownik nie zostaje zalogowany

#### 7.4. TC-07-04: Walidacja logowania — puste hasło

**File:** `tests/account/tc-07-04-login-empty-password.spec.ts`

**Steps:**
  1. Przejdź na https://tapsshop.pl/moje-konto/
    - expect: Formularz logowania jest widoczny
  2. Wpisz nazwę użytkownika 'test@example.com', pozostaw pole hasła puste i kliknij 'Zaloguj się'
    - expect: Formularz nie jest wysłany pomyślnie
    - expect: Wyświetlany jest komunikat błędu o wymaganym haśle

#### 7.5. TC-07-05: Widoczność/ukrywanie hasła w formularzu logowania

**File:** `tests/account/tc-07-05-login-password-visibility-toggle.spec.ts`

**Steps:**
  1. Przejdź na https://tapsshop.pl/moje-konto/ i wpisz dowolny tekst w pole 'Hasło'
    - expect: Wpisany tekst jest ukryty (widoczne są gwiazdki lub kropki)
    - expect: Widoczny jest przycisk 'Pokaż hasło'
  2. Kliknij przycisk 'Pokaż hasło' przy polu hasła
    - expect: Wpisane hasło staje się widoczne jako tekst
    - expect: Przycisk zmienia stan (np. zmienia ikonę lub etykietę)
  3. Kliknij ponownie przycisk, aby ukryć hasło
    - expect: Hasło jest ponownie ukryte (gwiazdki/kropki)

#### 7.6. TC-07-06: Rejestracja — brak adresu email

**File:** `tests/account/tc-07-06-register-empty-email.spec.ts`

**Steps:**
  1. Przejdź na https://tapsshop.pl/moje-konto/
    - expect: Formularz rejestracji jest widoczny w sekcji 'Zarejestruj się'
  2. Pozostaw pole 'Adres email' w formularzu rejestracji puste i kliknij 'Zarejestruj się'
    - expect: Formularz nie jest wysłany
    - expect: Wyświetlany jest komunikat błędu o wymaganym adresie email

#### 7.7. TC-07-07: Rejestracja — nieprawidłowy format email

**File:** `tests/account/tc-07-07-register-invalid-email.spec.ts`

**Steps:**
  1. Przejdź na https://tapsshop.pl/moje-konto/
    - expect: Formularz rejestracji jest widoczny
  2. Wpisz nieprawidłowy adres email np. 'nieformatowy-email' (bez @) w polu 'Adres email' w sekcji 'Zarejestruj się' i kliknij 'Zarejestruj się'
    - expect: Rejestracja kończy się niepowodzeniem
    - expect: Wyświetlany jest komunikat błędu informujący o nieprawidłowym formacie adresu email

#### 7.8. TC-07-08: Link do polityki prywatności na stronie rejestracji

**File:** `tests/account/tc-07-08-register-privacy-policy-link.spec.ts`

**Steps:**
  1. Przejdź na https://tapsshop.pl/moje-konto/
    - expect: Formularz rejestracji jest widoczny
  2. Znajdź i kliknij link 'polityka prywatności' w sekcji 'Zarejestruj się'
    - expect: Link jest widoczny i klikalny
    - expect: Użytkownik jest przekierowany na stronę polityki prywatności (lub pojawia się strona 404 — znany defekt środowiska testowego)

#### 7.9. TC-07-09: Strona 'Zapomniane hasło' — wyświetlenie i formularz

**File:** `tests/account/tc-07-09-forgot-password-page.spec.ts`

**Steps:**
  1. Przejdź na https://tapsshop.pl/moje-konto/ i kliknij link 'Nie pamiętasz hasła?'
    - expect: Zostaje przekierowany na https://tapsshop.pl/moje-konto/lost-password/
    - expect: Tytuł strony zawiera 'Zapomniane hasło'
  2. Sprawdź zawartość strony resetu hasła
    - expect: Widoczny jest opis: 'Zapomniane hasło? Proszę wpisać nazwę użytkownika lub adres e-mail...'
    - expect: Widoczne jest pole 'Nazwa użytkownika lub adres e-mail'
    - expect: Widoczny jest przycisk 'Zresetuj hasło'
  3. Sprawdź breadcrumb na stronie
    - expect: Breadcrumb pokazuje: Strona główna / Moje konto / Zapomniane hasło

#### 7.10. TC-07-10: Reset hasła — puste pole formularza

**File:** `tests/account/tc-07-10-forgot-password-empty-field.spec.ts`

**Steps:**
  1. Przejdź na https://tapsshop.pl/moje-konto/lost-password/
    - expect: Formularz resetu hasła jest wyświetlony
  2. Pozostaw pole 'Nazwa użytkownika lub adres e-mail' puste i kliknij 'Zresetuj hasło'
    - expect: Formularz nie jest wysłany
    - expect: Wyświetlany jest komunikat błędu o wymaganym polu

#### 7.11. TC-07-11: Reset hasła — podanie nieistniejącego adresu email

**File:** `tests/account/tc-07-11-forgot-password-unknown-email.spec.ts`

**Steps:**
  1. Przejdź na https://tapsshop.pl/moje-konto/lost-password/
    - expect: Formularz resetu hasła jest wyświetlony
  2. Wpisz adres email nieistniejącego konta np. 'nieznany-uzytkownik@testdomain.example' i kliknij 'Zresetuj hasło'
    - expect: Formularz jest wysłany
    - expect: Wyświetlany jest komunikat błędu informujący, że nie znaleziono konta powiązanego z podanym adresem email LUB ogólny komunikat bezpieczeństwa informujący o wysłaniu linku (zachowanie zależy od konfiguracji)

### 8. TS-08: Strony Informacyjne i Obsługa Błędów

**Seed:** `https://tapsshop.pl/`

#### 8.1. TC-08-01: Wyświetlenie strony 404 — bezpośredni URL

**File:** `tests/info-pages/tc-08-01-404-page.spec.ts`

**Steps:**
  1. Przejdź bezpośrednio na https://tapsshop.pl/invalidpage (nieistniejący URL)
    - expect: Serwer zwraca odpowiedź HTTP 404
    - expect: Wyświetlana jest strona błędu 404 z tytułem 'Oh no! This is 404 page! Where am I?!'
  2. Sprawdź zawartość strony 404
    - expect: Widoczny jest tekst informujący o błędzie 404
    - expect: Widoczna jest grafika/ilustracja błędu 404
    - expect: Dostępny jest przycisk/link 'Back to main page'
  3. Kliknij przycisk 'Back to main page'
    - expect: Zostaje przekierowany z powrotem na stronę główną https://tapsshop.pl/

#### 8.2. TC-08-02: Link 'Oh no!' w menu nawigacji prowadzi do strony 404

**File:** `tests/info-pages/tc-08-02-404-nav-link.spec.ts`

**Steps:**
  1. Przejdź na stronę główną https://tapsshop.pl/
    - expect: Strona główna jest załadowana
  2. Kliknij link 'Oh no!' w głównym menu nawigacji
    - expect: Zostaje przekierowany na stronę https://tapsshop.pl/invalidpage
    - expect: Wyświetlana jest strona błędu 404

#### 8.3. TC-08-03: Sample Page — dostępność strony

**File:** `tests/info-pages/tc-08-03-sample-page.spec.ts`

**Steps:**
  1. Przejdź na https://tapsshop.pl/sample-page/
    - expect: Strona ładuje się poprawnie (kod HTTP 200)
    - expect: Tytuł strony zawiera 'Sample Page'
    - expect: Treść strony jest widoczna

#### 8.4. TC-08-04: Breadcrumb — poprawna nawigacja okruszkami

**File:** `tests/info-pages/tc-08-04-breadcrumb-navigation.spec.ts`

**Steps:**
  1. Przejdź na https://tapsshop.pl/produkt/beanie/
    - expect: Breadcrumb jest widoczny
    - expect: Wyświetla ścieżkę: Strona główna / Clothing / Accessories / Beanie
  2. Kliknij link 'Accessories' w breadcrumb
    - expect: Zostaje przekierowany na stronę kategorii Accessories
    - expect: URL zawiera '/kategoria-produktu/clothing/accessories-clothing/'
  3. Kliknij link 'Clothing' w breadcrumb na stronie kategorii
    - expect: Zostaje przekierowany na stronę kategorii Clothing (https://tapsshop.pl/kategoria-produktu/clothing/)
  4. Kliknij link 'Strona główna' w breadcrumb
    - expect: Zostaje przekierowany z powrotem na stronę główną https://tapsshop.pl/

### 9. TS-09: Walidacje Formularzy

**Seed:** `https://tapsshop.pl/moje-konto/`

#### 9.1. TC-09-01: Walidacja formularza logowania — pusta nazwa użytkownika

**File:** `tests/validation/tc-09-01-login-empty-username.spec.ts`

**Steps:**
  1. Przejdź na https://tapsshop.pl/moje-konto/
    - expect: Formularz logowania jest widoczny
  2. Pozostaw pole 'Nazwa użytkownika lub adres e-mail' puste, wpisz dowolne hasło np. 'TestHaslo123' i kliknij 'Zaloguj się'
    - expect: Formularz nie jest wysłany pomyślnie
    - expect: Wyświetlany jest komunikat błędu przy polu nazwy użytkownika

#### 9.2. TC-09-02: Walidacja pola ilości w koszyku — wartość zero

**File:** `tests/validation/tc-09-02-cart-quantity-zero.spec.ts`

**Steps:**
  1. Dodaj produkt Beanie do koszyka i przejdź na https://tapsshop.pl/koszyk/
    - expect: Koszyk zawiera produkt Beanie z ilością 1
  2. Zmień wartość ilości przy produkcie Beanie na '0' i kliknij 'Zaktualizuj koszyk'
    - expect: Produkt jest usuwany z koszyka LUB wyświetlany jest komunikat błędu walidacji informujący, że ilość musi być większa od 0

#### 9.3. TC-09-03: Walidacja pola ilości w koszyku — wartość ujemna

**File:** `tests/validation/tc-09-03-cart-quantity-negative.spec.ts`

**Steps:**
  1. Dodaj produkt Beanie do koszyka i przejdź na https://tapsshop.pl/koszyk/
    - expect: Koszyk zawiera produkt Beanie z ilością 1
  2. Zmień wartość ilości przy produkcie Beanie na '-1' i kliknij 'Zaktualizuj koszyk'
    - expect: Formularz nie pozwala na ustawienie ujemnej ilości LUB wyświetlany jest komunikat błędu walidacji
    - expect: Koszyk nie jest aktualizowany z ujemną ilością

#### 9.4. TC-09-04: Walidacja pola ilości produktu na karcie produktu — wartość 0

**File:** `tests/validation/tc-09-04-product-page-quantity-zero.spec.ts`

**Steps:**
  1. Przejdź na https://tapsshop.pl/produkt/beanie/
    - expect: Strona produktu z polem ilości jest załadowana
  2. Zmień wartość w polu ilości na '0' i kliknij 'Dodaj do koszyka'
    - expect: Produkt nie jest dodawany do koszyka LUB wyświetlany jest komunikat błędu walidacji o minimalnej ilości
    - expect: Licznik koszyka w nagłówku nie zmienia się

#### 9.5. TC-09-05: Walidacja checkout — nieprawidłowy format kodu pocztowego

**File:** `tests/validation/tc-09-05-checkout-invalid-postcode.spec.ts`

**Steps:**
  1. Dodaj produkt do koszyka i przejdź na https://tapsshop.pl/zamowienie/
    - expect: Formularz zamówienia jest wyświetlony
  2. Wypełnij wszystkie wymagane pola poprawnymi danymi z wyjątkiem kodu pocztowego — wpisz 'abc' jako kod pocztowy dla Polski
    - expect: Wszystkie pola poza kodem pocztowym mają poprawne wartości
  3. Kliknij 'Kupuję i płacę'
    - expect: Formularz nie jest wysłany
    - expect: Wyświetlany jest komunikat błędu przy polu kodu pocztowego informujący o nieprawidłowym formacie

#### 9.6. TC-09-06: Walidacja checkout — pole numeru telefonu z tekstem zamiast cyfr

**File:** `tests/validation/tc-09-06-checkout-invalid-phone.spec.ts`

**Steps:**
  1. Dodaj produkt do koszyka i przejdź na https://tapsshop.pl/zamowienie/
    - expect: Formularz zamówienia jest wyświetlony
  2. Wypełnij wszystkie wymagane pola poprawnymi danymi, ale w polu 'Numer telefonu' wpisz tekst 'abcdefgh'
    - expect: Wszystkie inne pola mają poprawne wartości
  3. Kliknij 'Kupuję i płacę'
    - expect: Formularz nie jest wysłany LUB wyświetlany jest komunikat błędu przy polu numeru telefonu

### 10. TS-10: Responsywność i Podstawowe UI

**Seed:** `https://tapsshop.pl/`

#### 10.1. TC-10-01: Wyświetlenie strony głównej na widoku mobilnym (375px)

**File:** `tests/ui/tc-10-01-homepage-mobile-view.spec.ts`

**Steps:**
  1. Ustaw viewport przeglądarki na 375x667 (iPhone SE) i przejdź na https://tapsshop.pl/
    - expect: Strona ładuje się poprawnie bez poziomego paska przewijania
    - expect: Baner informacyjny jest widoczny
    - expect: Logo sklepu jest widoczne
  2. Sprawdź menu nawigacji na widoku mobilnym
    - expect: Nawigacja dostosowuje się do widoku mobilnego (np. pojawia się ikona hamburgera lub menu składa się pionowo)
    - expect: Linki nawigacji są dostępne i klikalne
  3. Sprawdź listę produktów na widoku mobilnym
    - expect: Produkty są wyświetlane w układzie responsywnym (np. 1 kolumna zamiast siatki)
    - expect: Obrazki, nazwy, ceny i przyciski produktów są czytelne i klikalne

#### 10.2. TC-10-02: Wyświetlenie strony produktu na widoku mobilnym

**File:** `tests/ui/tc-10-02-product-page-mobile-view.spec.ts`

**Steps:**
  1. Ustaw viewport na 375x667 i przejdź na https://tapsshop.pl/produkt/beanie/
    - expect: Strona produktu ładuje się poprawnie
  2. Sprawdź, czy galeria zdjęć, opis, cena i przycisk 'Dodaj do koszyka' są widoczne i dostępne
    - expect: Galeria produktu wyświetla się poprawnie
    - expect: Cena i przycisk akcji są widoczne bez konieczności poziomego przewijania

#### 10.3. TC-10-03: Wyświetlenie formularza checkout na widoku mobilnym

**File:** `tests/ui/tc-10-03-checkout-mobile-view.spec.ts`

**Steps:**
  1. Dodaj produkt do koszyka, ustaw viewport na 375x667 i przejdź na https://tapsshop.pl/zamowienie/
    - expect: Strona checkout ładuje się poprawnie
  2. Sprawdź układ formularza na widoku mobilnym
    - expect: Formularz 'Dane rozliczeniowe' i podsumowanie zamówienia są widoczne
    - expect: Pola formularza są czytelne i dostępne na małym ekranie
    - expect: Przycisk 'Kupuję i płacę' jest widoczny

#### 10.4. TC-10-04: Skrót klawiszowy — nawigacja klawiaturą po formularzu logowania

**File:** `tests/ui/tc-10-04-keyboard-navigation-login.spec.ts`

**Steps:**
  1. Przejdź na https://tapsshop.pl/moje-konto/ i kliknij w pole 'Nazwa użytkownika lub adres e-mail'
    - expect: Pole jest aktywne (posiada focus)
  2. Naciśnij klawisz Tab
    - expect: Focus przenosi się do kolejnego pola — 'Hasło'
  3. Naciśnij Tab ponownie
    - expect: Focus przenosi się do checkboxa 'Zapamiętaj mnie'
  4. Naciśnij Tab ponownie
    - expect: Focus przenosi się do przycisku 'Zaloguj się'
