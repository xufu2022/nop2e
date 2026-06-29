import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class _AdminTopMenu extends BasePage {
  readonly logoutLink: Locator;
  readonly publicStoreLink: Locator;

  constructor(page: Page) {
    super(page);
    this.logoutLink      = page.getByRole('link', { name: 'Logout' });
    this.publicStoreLink = page.getByRole('link', { name: 'Public store' });
  }
}
