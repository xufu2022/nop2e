import { Page, Locator } from '@playwright/test';
import { AdminBasePage } from './AdminBasePage';

export class _AdminCurrencyListPage extends AdminBasePage {
  readonly heading: Locator;
  readonly grid: Locator;
  readonly getLiveRatesLink: Locator;

  constructor(page: Page) {
    super(page);
    this.heading        = page.getByRole('heading', { name: 'Currencies', level: 1 });
    this.grid           = page.locator('#currencies-grid');
    this.getLiveRatesLink = page.getByRole('link', { name: 'Get live rates' });
  }
}
