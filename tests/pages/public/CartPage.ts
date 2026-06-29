import { _CartPage } from './_CartPage';
import { routes } from '../../fixtures/routes';

export class CartPage extends _CartPage {
  async navigate(): Promise<void> {
    await this.goto(routes.public.cart);
  }

  async updateQuantity(qty: number): Promise<void> {
    await this.quantityInput.fill(String(qty));
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      this.quantityInput.press('Enter'),
    ]);
  }

  async removeItem(): Promise<void> {
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      this.removeButton.click(),
    ]);
  }

  async clearCart(): Promise<void> {
    await this.navigate();
    while ((await this.removeButton.count()) > 0) {
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
        this.removeButton.first().click(),
      ]);
    }
  }
}
