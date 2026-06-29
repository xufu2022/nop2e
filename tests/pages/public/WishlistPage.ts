import { Locator } from '@playwright/test';
import { _WishlistPage } from './_WishlistPage';
import { routes } from '../../fixtures/routes';

export class WishlistPage extends _WishlistPage {
  async navigate(): Promise<void> {
    await this.goto(routes.public.wishlist);
  }

  async getWishlistCount(): Promise<number> {
    const text = await this.wishlistQty.textContent() ?? '(0)';
    const match = text.match(/\((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  rowFor(productName: string): Locator {
    return this.wishlistRows.filter({ hasText: productName });
  }

  async removeItem(productName: string): Promise<void> {
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      this.rowFor(productName).getByRole('button', { name: 'Remove' }).click(),
    ]);
  }

  async addAllToCart(): Promise<void> {
    await Promise.all([
      this.page.waitForResponse(resp => resp.url().includes('/wishlist') && resp.request().method() === 'POST'),
      this.addToCartButton.click(),
    ]);
  }

  async clearWishlist(): Promise<void> {
    await this.navigate();
    let count = await this.wishlistRows.count();
    while (count > 0) {
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
        this.wishlistRows.first().getByRole('button', { name: 'Remove' }).click(),
      ]);
      count = await this.wishlistRows.count();
    }
  }
}
