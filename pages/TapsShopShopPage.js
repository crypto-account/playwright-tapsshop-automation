const { expect } = require('@playwright/test');

class TapsShopShopPage {
    static URL = 'https://tapsshop.pl/sklep/';

    static Sort = {
        DEFAULT: 'menu_order',
        POPULARITY: 'popularity',
        RATING: 'rating',
        NEWEST: 'date',
        PRICE_ASC: 'price',
        PRICE_DESC: 'price-desc',
    };

    constructor(page) {
        this.page = page;

        this.pageHeading = page.getByRole('heading', { level: 1, name: 'Sklep' });
        this.breadcrumb = page.getByRole('navigation', { name: 'okruszki' });

        this.sortDropdown = page.getByRole('combobox', { name: 'Zamówienie w sklepie' }).first();
        this.resultCount = page.getByRole('status').filter({ hasText: 'Wyświetlanie' }).first();

        this.pagination = page.getByRole('navigation', { name: 'Paginacja produktów' }).first();
        this.paginationNextBtn = this.pagination.getByRole('link', { name: '→' });

        this.productList = page.locator('ul.products');
        this.products = this.productList.getByRole('listitem');
    }

    async navigate() {
        await this.page.goto(TapsShopShopPage.URL);
    }

    async sortBy(value) {
        await this.sortDropdown.selectOption(value);
        await this.page.waitForLoadState('networkidle');
    }

    async goToPage(pageNumber) {
        await this.pagination.getByRole('link', { name: `Strona ${pageNumber}` }).first().click();
        await this.page.waitForURL(new RegExp(`/sklep/page/${pageNumber}/?$`));
    }

    async goToNextPage() {
        await this.paginationNextBtn.first().click();
    }

    productByName(name) {
        return this.productList.getByRole('link', { name: new RegExp(`^${name} ${name}`) });
    }

    addToCartByName(name) {
        return this.productList.getByRole('button', { name: `Dodaj do koszyka: „${name}”` });
    }

    async openProduct(name) {
        await this.productByName(name).click();
    }

    async getVisibleProductNames() {
        return await this.productList.locator('h2').allTextContents();
    }

    async expectLoaded() {
        await expect(this.pageHeading).toBeVisible();
        await expect(this.page).toHaveTitle(/Sklep/);
    }
}

module.exports = { TapsShopShopPage };
