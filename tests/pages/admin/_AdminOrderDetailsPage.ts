import { Page, Locator } from '@playwright/test';
import { AdminBasePage } from './AdminBasePage';

export class _AdminOrderDetailsPage extends AdminBasePage {
  readonly backToListLink: Locator;
  readonly customerLink: Locator;
  readonly productsTable: Locator;
  readonly orderTotalLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.backToListLink  = page.getByRole('link', { name: 'back to order list' });
    this.customerLink    = page.getByRole('link', { name: /@/ });
    this.productsTable   = page.getByRole('table').filter({
      has: page.getByRole('columnheader', { name: 'Product name' }),
    });
    this.orderTotalLabel = page.getByText('Order total').nth(1);
  }
}
