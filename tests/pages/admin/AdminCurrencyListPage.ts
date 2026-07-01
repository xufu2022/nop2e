import { Locator } from '@playwright/test';
import { _AdminCurrencyListPage } from './_AdminCurrencyListPage';

export class AdminCurrencyListPage extends _AdminCurrencyListPage {
  async navigate(): Promise<void> {
    await this.goto('/Admin/Currency/List');
  }

  rowFor(name: string): Locator {
    return this.grid.getByRole('row').filter({ hasText: name });
  }

  editLinkFor(name: string): Locator {
    return this.rowFor(name).getByRole('link', { name: 'Edit' });
  }

  rateCellFor(name: string): Locator {
    return this.rowFor(name).locator('td').nth(2);
  }

  // Column 3: "Is primary exchange rate currency" — .true-icon when set, .false-icon otherwise
  isPrimaryErcIconFor(name: string): Locator {
    return this.rowFor(name).locator('td').nth(3).locator('.true-icon');
  }

  // Column 5: "Is primary store currency" — .true-icon when set, .false-icon otherwise
  isPrimaryStoreCurrencyIconFor(name: string): Locator {
    return this.rowFor(name).locator('td').nth(5).locator('.true-icon');
  }

  // Column 8: "Published" — .true-icon when published, .false-icon when not
  isPublishedIconFor(name: string): Locator {
    return this.rowFor(name).locator('td').nth(8).locator('.true-icon');
  }

  async markAsPrimaryErcFor(name: string): Promise<void> {
    await this.rowFor(name).getByRole('link', { name: 'Mark as primary exchange rate currency' }).click();
    const confirmBtn = this.page.locator('#btnMarkPERC-action-confirmation-submit-button');
    await confirmBtn.waitFor({ state: 'visible' });
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      confirmBtn.click(),
    ]);
  }

  async markAsPrimaryStoreCurrencyFor(name: string): Promise<void> {
    await this.rowFor(name).getByRole('link', { name: 'Mark as primary store currency' }).click();
    const confirmBtn = this.page.locator('#btnMarkPSC-action-confirmation-submit-button');
    await confirmBtn.waitFor({ state: 'visible' });
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      confirmBtn.click(),
    ]);
  }

  async getLiveRates(): Promise<void> {
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      this.getLiveRatesLink.click(),
    ]);
  }
}
