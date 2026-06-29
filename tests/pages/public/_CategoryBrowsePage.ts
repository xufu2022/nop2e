import { Page, Locator } from '@playwright/test';
import { PublicLayoutPage } from './PublicLayoutPage';

export class _CategoryBrowsePage extends PublicLayoutPage {
  readonly heading: Locator;
  readonly sortBySelect: Locator;
  readonly perPageSelect: Locator;
  readonly productItems: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;
  readonly subcategoryLinks: Locator;
  readonly noProductsMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1 });
    this.sortBySelect = page.getByRole('combobox', { name: 'Select product sort order' });
    this.perPageSelect = page.getByRole('combobox', { name: 'Select number of products per page' });
    this.productItems = page.getByRole('article');
    this.productNames = page.getByRole('article').getByRole('heading', { level: 2 });
    this.productPrices = page.locator('.actual-price'); // uncertain: CSS class may vary
    this.subcategoryLinks = page.getByRole('heading', { level: 2 }).getByRole('link'); // uncertain: on parent category pages only
    this.noProductsMessage = page.getByText(/no products were found/i); // uncertain: exact message text
  }
}
