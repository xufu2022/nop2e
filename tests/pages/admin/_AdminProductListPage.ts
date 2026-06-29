import { Page, Locator } from '@playwright/test';
import { AdminBasePage } from './AdminBasePage';

export class _AdminProductListPage extends AdminBasePage {
  readonly heading: Locator;
  readonly productNameSearch: Locator;
  readonly searchButton: Locator;
  readonly addNewButton: Locator;
  readonly deleteSelectedButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading              = page.getByRole('heading', { name: 'Products', level: 1 });
    this.productNameSearch    = page.getByRole('textbox', { name: 'Product name' });
    this.searchButton         = page.getByRole('button', { name: 'Search' });
    this.addNewButton         = page.getByRole('link', { name: 'Add new' });
    this.deleteSelectedButton = page.getByRole('button', { name: 'Delete (selected)' });
  }
}
