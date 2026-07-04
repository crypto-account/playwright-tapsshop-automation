const { expect } = require('@playwright/test');

class TapsShopHomePage {
    static URL = 'https://tapsshop.pl/';

    constructor(page) {
        this.page = page;

        this.banner = page.getByRole('complementary', { name: 'Napis w sklepie' });
        this.bannerDismissBtn = this.banner.getByRole('button', { name: 'Odrzuć' });

        this.logo = page.getByRole('link', { name: 'FT TEST SHOP v. 2.1.7' }).first();
        this.searchbox = page.getByRole('searchbox', { name: 'Szukaj:' });
        this.searchBtn = page.getByRole('button', { name: 'Szukaj' });

        this.mainNav = page.getByRole('navigation', { name: 'Główne menu' });
        this.navHome = this.mainNav.getByRole('link', { name: 'Strona główna', exact: true }).first();
        this.navCart = this.mainNav.getByRole('link', { name: 'Koszyk', exact: true }).first();
        this.navAccount = this.mainNav.getByRole('link', { name: 'Moje konto', exact: true }).first();
        this.navOrder = this.mainNav.getByRole('link', { name: 'Zamówienie', exact: true }).first();
        this.navShop = this.mainNav.getByRole('link', { name: 'Sklep', exact: true }).first();
        this.navOhNo = this.mainNav.getByRole('link', { name: 'Oh no!', exact: true }).first();

        this.categoriesHeading = page.getByRole('heading', { level: 2, name: 'Kupuj wg kategorii' });
        this.clothingCategoryLink = page.getByRole('link', { name: 'Przejdź do kategorii produktu Clothing' });

        this.newSection = page.getByRole('heading', { level: 2, name: 'Nowe' });
        this.favoritesSection = page.getByRole('heading', { level: 2, name: 'Ulubione' });
        this.bestsellersSection = page.getByRole('heading', { level: 2, name: 'Bestsellery' });

        // Licznik koszyka w nagłówku (w sekcji banner/site-header-cart, nie w mainNav)
        // Lokator dopasowuje link z tekstem zawierającym "Produkt": "€0,00 0 Produkt" lub "€20,00 1 Produkt"
        this.cartCounter = page.locator('.site-header-cart').getByRole('link', { name: /Produkt/ });

        // Mini-cart dropdown (widget WooCommerce widoczny po hover na cartCounter)
        this.miniCart = page.locator('.widget_shopping_cart_content');
        this.miniCartViewCartLink = this.miniCart.getByRole('link', { name: /Zobacz koszyk/ });
        this.miniCartCheckoutLink = this.miniCart.getByRole('link', { name: /Zamówienie/ });

        this.footer = page.getByRole('contentinfo');
        this.footerCopyright = this.footer.getByText('© FT TEST SHOP v. 2.1.7 2026');
        this.footerWooLink = this.footer.getByRole('link', { name: 'Stworzone z WooCommerce' });
    }

    async navigate() {
        await this.page.goto(TapsShopHomePage.URL);
    }

    productAddToCartInSection(sectionHeading, productName) {
        return sectionHeading
            .locator('xpath=following-sibling::div[1]')
            .getByRole('link', { name: `Dodaj do koszyka: „${productName}”` });
    }

    // Link do karty produktu w danej sekcji (obrazek + nazwa).
    // Accessible name linku ma postać "Nazwa Nazwa" (alt obrazka + tekst span).
    productLinkInSection(sectionHeading, productName) {
        return sectionHeading
            .locator('xpath=following-sibling::div[1]')
            .getByRole('link', { name: `${productName} ${productName}` });
    }

    async dismissBanner() {
        await this.bannerDismissBtn.click();
    }

    async goToShop() {
        await this.navShop.click();
        await this.page.waitForURL(/\/sklep\/?$/);
    }

    async goToCart() {
        await this.navCart.click();
        await this.page.waitForURL(/\/koszyk\/?$/);
    }

    async goToAccount() {
        await this.navAccount.click();
        await this.page.waitForURL(/\/moje-konto\/?$/);
    }

    async goToHomeViaNav() {
        await this.navHome.click();
        await this.page.waitForURL(TapsShopHomePage.URL);
    }

    async expectLoaded() {
        await expect(this.page).toHaveTitle(/FT TEST SHOP v\. 2\.1\.7/);
        await expect(this.logo).toBeVisible();
    }
}

module.exports = { TapsShopHomePage };
