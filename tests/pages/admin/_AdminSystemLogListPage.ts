import { Page, Locator } from '@playwright/test';
import { AdminBasePage } from './AdminBasePage';

export class _AdminSystemLogListPage extends AdminBasePage {
  readonly heading: Locator;
  readonly createdFromField: Locator;
  readonly createdToField: Locator;
  readonly messageField: Locator;
  readonly logLevelFilter: Locator;
  readonly searchButton: Locator;
  readonly grid: Locator;

  constructor(page: Page) {
    super(page);
    this.heading          = page.getByRole('heading', { name: 'Log', level: 1 });
    this.createdFromField = page.getByRole('textbox', { name: 'Created from' });
    this.createdToField   = page.getByRole('textbox', { name: 'Created to' });
    this.messageField     = page.getByRole('textbox', { name: 'Message' });
    this.logLevelFilter   = page.locator('#SearchLogLevelId'); // uncertain — Kendo-wrapped select
    this.searchButton     = page.getByRole('button', { name: 'Search' });
    this.grid             = page.locator('#log-grid'); // uncertain — verify grid element ID
  }
}
