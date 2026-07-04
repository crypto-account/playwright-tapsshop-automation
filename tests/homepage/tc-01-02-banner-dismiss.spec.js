const { test, expect } = require('@playwright/test');
const { TapsShopHomePage } = require('../../pages/TapsShopHomePage');

test.describe('TS-01: Strona Główna', () => {
    test('TC-01-02: Odrzucenie banera informacyjnego', async ({ page }) => {
        const home = new TapsShopHomePage(page);

        await home.navigate();

        await expect(home.banner).toBeVisible();
        await expect(home.banner).toContainText('Testowy sklep do testowania');

        await home.dismissBanner();

        await expect(home.banner).toBeHidden();

        await expect(home.mainNav).toBeVisible();
        await expect(home.categoriesHeading).toBeVisible();
        await expect(home.footerCopyright).toBeVisible();
    });
});
