# INST-BR-02 — Pobieranie przy zerowych wynikach generuje pusty plik XLSX bez nagłówka

**Priorytet:** P3 · Niski · **Ważność/dotkliwość:** Niska · **Powiązany scenariusz testowy:** INST-17 · **Data zgłoszenia:** 2026-08-15

## Środowisko
- **URL:** https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/
- **Przeglądarka:** Chrome 151
- **System operacyjny:** macOS 15.7.4
- **Rozdzielczość:** 1440×900

## Kroki reprodukcji
1) Otwórz https://kwalifikacje.gov.pl/wyszukiwarka-instytucji/
2) W pole wyszukiwania wpisz frazę "nieistniejaca_xyz" i poczekaj aż licznik pokaże "Znaleziono: 0"
3) Kliknij przycisk "Pobierz"
4) Otwórz pobrany plik i sprawdź czy zawiera nagłówek kolumn

## Oczekiwany rezultat
Przycisk "Pobierz" jest wyłączony LUB pobrany plik zawiera co najmniej nagłówek kolumn (nie tylko pusty arkusz)

## Rzeczywisty rezultat
Przycisk "Pobierz" nie jest disabled przy liczniku 0. Pobrany plik ma 1 wiersz × 1 kolumnę, komórka = None (pusty XLSX bez nawet nagłówka "#/ID/Nazwa")

![Dowód](../screenshots/INST-17.png)

## Wpływ na użytkownika
Użytkownik przy pustym wyniku wyszukiwania klika "Pobierz" i dostaje niezrozumiały pusty plik zamiast informacji zwrotnej. Myślący że plik jest uszkodzony lub że eksport nie zadziałał. Rzadko trafia w flow (typowo user widzi 0 wyników i już nie pobiera), ale gdy trafi — mylące.
