// spec: TS-01 Strona Główna
// seed: tests/seed.spec.ts

const { test, expect } = require('@playwright/test');
const { TapsShopHomePage } = require('../../pages/TapsShopHomePage');

test.describe('TS-01: Strona Główna', () => {
  test('TC-01-04: Wyświetlanie licznika koszyka w nagłówku', async ({ page }) => {
    const homePage = new TapsShopHomePage(page);

    // 1. Otwórz stronę główną https://tapsshop.pl/ przy pustym koszyku (upewnij się że sesja jest czysta)
    await homePage.navigate();

    // expect: Licznik koszyka w nagłówku pokazuje '€0,00 0 Produkt'
    await expect(homePage.cartCounter).toBeVisible();
    await expect(homePage.cartCounter).toHaveText(/€0,00\s+0 Produkt/);

    // 2. Kliknij przycisk 'Dodaj do koszyka' przy produkcie Polo (€20,00) w sekcji 'Nowe'
    const addPoloToCart = homePage.productAddToCartInSection(homePage.newSection, 'Polo');
    const addToCartResponse = page.waitForResponse(res => res.url().includes('wc-ajax=add_to_cart'));
    await addPoloToCart.click();
    await addToCartResponse;

    // expect: Licznik koszyka w nagłówku aktualizuje się do '€20,00 1 Produkt'
    await expect(homePage.cartCounter).toHaveText(/€20,00\s+1 Produkt/);

    // 3. Kliknij ikonę koszyka w nagłówku — przekierowanie na stronę koszyka z dodanym produktem
    // Uwaga: mini-cart widget na tej stronie jest ukryty CSS-em (position: absolute; left: -13986px)
    // i nie działa jako dropdown na hover, więc weryfikujemy zawartość na stronie /koszyk/.
    await homePage.cartCounter.click();
    await page.waitForURL(/\/koszyk\/?$/);

    // expect: Na stronie koszyka widoczny jest produkt Polo z ceną €20,00 i ilością 1
    await expect(page.getByRole('link', { name: 'Polo', exact: true }).first()).toBeVisible();
    await expect(page.getByRole('cell', { name: /€20,00/ }).first()).toBeVisible();
    await expect(page.getByRole('spinbutton', { name: /Ilość/ })).toHaveValue('1');
  });
});
