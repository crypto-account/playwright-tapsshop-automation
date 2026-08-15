# Konwencje kolumn — wywoływane z SKILL.md krok 4

Szczegółowe reguły dla dwóch kolumn, które wymagają więcej miejsca niż inline w SKILL.md.

## Tytuł

**Zwięzły opis w języku produktu** (jeśli produkt polski → polski tytuł), **6–10 słów**, format: **czynność + obiekt + oczekiwany efekt**. MUSI sygnalizować intent (positive/negative/edge) przez samo sformułowanie.

### Unikaj

- **Zbyt lakoniczne**: `"Otwarcie profilu"`, `"Filtr IC"`, `"XSS"` — mówią WHAT bez EFFECT
- **Zbyt techniczne**: `"Kliknięcie nazwy instytucji w tabeli otwiera stronę profilu z pełnymi danymi kontaktowymi (nazwa, NIP, adres)"` — szczegóły należą do Kroków / Oczekiwany rezultat, nie do tytułu
- **English jargon**: nie „AND", „sanitized", „end-to-end", „empty state", „XSS". Używaj: „łączy warunki", „nie zostaje wykonany", „pełny przepływ", „brak wyników", „złośliwy kod". Techniczne akronimy tolerowane tylko gdy to nazwa własna funkcji produktu (IC, WCAG, PZZJ)
- **Konkretne metryki**: `4.5:1`, `24×24 CSS px`, `?limit=99999` — te idą do Kroków / Oczekiwany rezultat / Dane testowe

### Rób tak

- `"Kliknięcie w instytucję otwiera stronę z jej danymi"`
- `"Filtr instytucji certyfikującej (IC) zawęża listę wyników"`
- `"Złośliwy kod w parametrze URL nie zostaje wykonany"`

## Dane testowe

Konkretne wartości lub klasy równoważnościowe (`<dowolny poprawny email>`). PRZED Krokami, bo dane wchodzą w kroki (When).

### Dla wyszukiwania / filtrów na realnych zbiorach danych

Lista wartości oddzielonych przecinkami, format:

```
nazwa: "X", "Y", "Z", "W"
```

**Pierwsza wartość = ta użyta w Krokach** (deterministyczna weryfikacja przez Playwright), pozostałe 3–5 to alternatywy z domeny do sprawdzenia przez testera (największe miasta, popularne instytucje, różne kategorie).

Zero etykiet typu „Primary:" — konwencja implicit, first-value-wins.

To daje pokrycie klas równoważnościowych (stolica vs małe miasto, uczelnia publiczna vs fundacja, popularna vs egzotyczna nazwa) bez enumeracji osobnych case'ów.

### Dla edge / injection case'ów

Payload primary + 2-3 warianty ataku (SQLi, path traversal, template injection) w tym samym formacie.
