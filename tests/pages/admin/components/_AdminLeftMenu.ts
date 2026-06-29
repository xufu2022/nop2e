import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class _AdminLeftMenu extends BasePage {
  readonly dashboardLink: Locator;
  readonly catalogLink: Locator;
  readonly productsLink: Locator;
  readonly salesLink: Locator;
  readonly ordersLink: Locator;
  readonly customersLink: Locator;

  constructor(page: Page) {
    super(page);
    this.dashboardLink = page.locator('aside').getByRole('link', { name: 'Dashboard' });
    this.catalogLink   = page.locator('aside').getByRole('link', { name: 'Catalog' });
    this.productsLink  = page.locator('aside').getByRole('link', { name: 'Products' });
    this.salesLink     = page.locator('aside').getByRole('link', { name: 'Sales' });
    this.ordersLink    = page.locator('aside').getByRole('link', { name: 'Orders' });
    this.customersLink = page.locator('aside').getByRole('link', { name: 'Customers' });
  }
}
