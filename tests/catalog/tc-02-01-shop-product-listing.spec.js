const { test, expect } = require('@playwright/test');
const { TapsShopShopPage } = require('../../pages/TapsShopShopPage');

test.describe('TS-02: Katalog Produktów i Kategorie', () => {
    test('TC-02-01: Wyświetlenie listy produktów w sklepie', async ({ page }) => {
        const shop = new TapsShopShopPage(page);

        await shop.navigate();
        await shop.expectLoaded();

        await expect(shop.pageHeading).toBeVisible();

        await expect(shop.breadcrumb).toBeVisible();
        await expect(shop.breadcrumb).toContainText('Strona główna');
        await expect(shop.breadcrumb).toContainText('Sklep');

        await expect(shop.resultCount).toHaveText(/Wyświetlanie 1[–-]8 z 11 wyników/);

        await expect(shop.products).toHaveCount(8);

        await expect(shop.sortDropdown).toBeVisible();

        await expect(shop.pagination).toBeVisible();
        await expect(shop.pagination.getByRole('link', { name: 'Strona 2' })).toBeVisible();
    });
});
