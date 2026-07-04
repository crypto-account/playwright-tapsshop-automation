const { test, expect } = require('@playwright/test');
const { TapsShopHomePage } = require('../../pages/TapsShopHomePage');

test.describe('TS-01: Strona Główna', () => {
    test('TC-01-01: Załadowanie strony głównej i weryfikacja podstawowych sekcji', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
        const home = new TapsShopHomePage(page);

        const response = await page.goto(TapsShopHomePage.URL);
        expect(response.status()).toBe(200);

        await home.expectLoaded();

        await expect(home.banner).toBeVisible();
        await expect(home.banner).toContainText('Testowy sklep do testowania');
        await expect(home.bannerDismissBtn).toBeVisible();

        await expect(home.mainNav).toBeVisible();
        for (const link of [home.navHome, home.navCart, home.navAccount, home.navOrder, home.navShop, home.navOhNo]) {
            await expect(link).toBeVisible();
            await expect(link).toBeEnabled();
        }

        await expect(home.categoriesHeading).toBeVisible();
        await expect(home.clothingCategoryLink).toBeVisible();
        await expect(home.clothingCategoryLink).toContainText('Clothing');
        await expect(home.clothingCategoryLink).toContainText('(11)');

        await expect(home.newSection).toBeVisible();
        await expect(home.favoritesSection).toBeVisible();
        await expect(home.bestsellersSection).toBeVisible();

        await expect(home.footerCopyright).toBeVisible();
        await expect(home.footerWooLink).toBeVisible();
    });
});
