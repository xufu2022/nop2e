import { Page, Locator } from '@playwright/test';
import { AdminBasePage } from './AdminBasePage';

export class _AdminLanguageListPage extends AdminBasePage {
  readonly heading: Locator;
  readonly grid: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Languages', level: 1 });
    this.grid    = page.locator('#languages-grid'); // uncertain — verify grid element ID
  }
}
