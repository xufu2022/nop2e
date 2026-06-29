import { Page, Locator } from '@playwright/test';
import { AdminBasePage } from './AdminBasePage';

export class _AdminOrderListPage extends AdminBasePage {
  readonly heading: Locator;
  readonly orderNumberHeader: Locator;
  readonly orderStatusHeader: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading           = page.getByRole('heading', { name: 'Orders', level: 1 });
    this.orderNumberHeader = page.getByRole('columnheader', { name: 'Order #' });
    this.orderStatusHeader = page.getByRole('columnheader', { name: 'Order status' });
    this.searchButton      = page.getByRole('button', { name: 'Search' });
  }
}
