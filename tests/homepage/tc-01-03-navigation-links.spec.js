const { test, expect } = require('@playwright/test');
const { TapsShopHomePage } = require('../../pages/TapsShopHomePage');

test.describe('TS-01: Strona Główna', () => {
    test('TC-01-03: Nawigacja z menu do poszczególnych sekcji', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
        const home = new TapsShopHomePage(page);

        await home.navigate();
        await home.expectLoaded();

        await home.goToShop();
        await expect(page).toHaveURL(/\/sklep\/?$/);
        await expect(page).toHaveTitle(/Sklep/);

        await home.goToHomeViaNav();
        await expect(page).toHaveURL(TapsShopHomePage.URL);

        await home.goToCart();
        await expect(page).toHaveURL(/\/koszyk\/?$/);
        await expect(page).toHaveTitle(/Koszyk/);

        await home.navigate();

        await home.goToAccount();
        await expect(page).toHaveURL(/\/moje-konto\/?$/);
        await expect(page.getByLabel('Nazwa użytkownika lub adres e-mail')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Zaloguj się' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Zarejestruj się' })).toBeVisible();
    });
});
