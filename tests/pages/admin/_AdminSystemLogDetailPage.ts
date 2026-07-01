import { Page, Locator } from '@playwright/test';
import { AdminBasePage } from './AdminBasePage';

export class _AdminSystemLogDetailPage extends AdminBasePage {
  readonly heading: Locator;
  readonly logLevelLabel: Locator;
  readonly shortMessageLabel: Locator;
  readonly fullMessageLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.heading           = page.getByRole('heading', { level: 1 });
    this.logLevelLabel     = page.locator('.content-wrapper').getByText('Log level');
    this.shortMessageLabel = page.locator('.content-wrapper').getByText('Short message');
    this.fullMessageLabel  = page.locator('.content-wrapper').getByText('Full message');
  }
}
