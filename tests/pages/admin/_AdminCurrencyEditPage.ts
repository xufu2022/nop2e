import { Page, Locator } from '@playwright/test';
import { AdminBasePage } from './AdminBasePage';

export class _AdminCurrencyEditPage extends AdminBasePage {
  readonly heading: Locator;
  readonly rateField: Locator;
  readonly publishedCheckbox: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading          = page.getByRole('heading', { level: 1 });
    this.rateField        = page.locator('#Rate');
    this.publishedCheckbox = page.locator('#Published');
    this.saveButton       = page.getByRole('button', { name: 'Save', exact: true });
  }
}
