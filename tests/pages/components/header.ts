import { Page, Locator } from '@playwright/test';

export class Header {
  readonly page: Page;
  readonly cartLink: Locator;
  readonly wishlistLink: Locator;
  readonly loginLink: Locator;
  readonly logoutLink: Locator;
  readonly searchBox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartLink = page.locator('.cart-qty, #topcartlink');
    this.wishlistLink = page.locator('.wishlist-qty, [href*="wishlist"]');
    this.loginLink = page.locator('[href*="/login"]');
    this.logoutLink = page.locator('[href*="logout"]');
    this.searchBox = page.locator('#small-searchterms, [name="q"]');
  }

  async search(term: string): Promise<void> {
    await this.searchBox.fill(term);
    await this.page.keyboard.press('Enter');
  }

  async getCartCount(): Promise<string> {
    return (await this.cartLink.textContent()) ?? '0';
  }
}
