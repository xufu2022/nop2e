import { Locator } from '@playwright/test';
import { _AdminOrderListPage } from './_AdminOrderListPage';
import { routes } from '../../fixtures/routes';

export class AdminOrderListPage extends _AdminOrderListPage {
  async navigate(): Promise<void> {
    await this.goto(routes.admin.orders);
  }

  // #OrderStatusIds is the underlying <select> for the Select2 widget — force bypasses Select2 UI
  async filterByStatus(status: string): Promise<void> {
    await this.page.locator('#OrderStatusIds').selectOption({ label: status }, { force: true });
    await Promise.all([
      this.page.waitForResponse(resp => resp.url().includes('/Admin/Order/OrderList') && resp.request().method() === 'POST'),
      this.searchButton.click(),
    ]);
  }

  dataRows(): Locator {
    return this.page
      .getByRole('row')
      .filter({ has: this.page.getByRole('link', { name: 'View' }) });
  }

  rowOrderStatusCell(row: Locator): Locator {
    return row.getByRole('cell').nth(2);
  }

  async clickFirstView(): Promise<void> {
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      this.page.getByRole('link', { name: 'View' }).first().click(),
    ]);
  }
}
