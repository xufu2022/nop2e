import { Locator } from '@playwright/test';
import { _AdminGiftCardListPage } from './_AdminGiftCardListPage';

export class AdminGiftCardListPage extends _AdminGiftCardListPage {
  async navigate(): Promise<void> {
    await this.goto('/Admin/GiftCard/List');
  }

  async searchByCouponCode(code: string): Promise<void> {
    await this.searchCouponCode.fill(code);
    await Promise.all([
      this.page.waitForResponse(
        resp => resp.url().includes('/Admin/GiftCard/GiftCardList') && resp.request().method() === 'POST'
      ),
      this.searchButton.click(),
    ]);
  }

  async filterByActivationStatus(value: 'All' | 'Activated' | 'Deactivated'): Promise<void> {
    await this.activatedFilter.selectOption({ label: value });
    await Promise.all([
      this.page.waitForResponse(
        resp => resp.url().includes('/Admin/GiftCard/GiftCardList') && resp.request().method() === 'POST'
      ),
      this.searchButton.click(),
    ]);
  }

  editRowFor(couponCode: string): Locator {
    return this.grid.getByRole('row').filter({ hasText: couponCode }).getByRole('link', { name: 'Edit' });
  }

  activationStatusFor(couponCode: string): Locator {
    return this.grid.getByRole('row').filter({ hasText: couponCode }).getByRole('cell').nth(4);
  }
}
