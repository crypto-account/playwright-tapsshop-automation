// spec: TS-01: Strona Główna
// seed: tests/seed.spec.ts

const { test, expect } = require('@playwright/test');
const { TapsShopHomePage } = require('../../pages/TapsShopHomePage');

test.describe('TS-01: Strona Główna', () => {
    test('TC-01-05: Kliknięcie w produkt na stronie głównej przenosi do karty produktu', { tag: ['@regression'] }, async ({ page }) => {
        const homePage = new TapsShopHomePage(page);

        // 1. Otwórz stronę główną https://tapsshop.pl/
        await homePage.navigate();

        // verify: Strona główna jest załadowana z listami produktów (sekcja 'Nowe' widoczna)
        await expect(homePage.newSection).toBeVisible();

        // 2. W sekcji 'Nowe' kliknij na link produktu 'Beanie' (obrazek lub nazwa)
        await homePage.productLinkInSection(homePage.newSection, 'Beanie').click();

        // verify: Zostaje przekierowany na stronę https://tapsshop.pl/produkt/beanie/
        await expect(page).toHaveURL('https://tapsshop.pl/produkt/beanie/');

        // verify: Nagłówek h1 zawiera 'Beanie'
        await expect(page.getByRole('heading', { name: 'Beanie', level: 1 })).toBeVisible();

        // verify: Cena €20,00 jest widoczna
        await expect(page.getByText('€20,00').first()).toBeVisible();
    });
});
