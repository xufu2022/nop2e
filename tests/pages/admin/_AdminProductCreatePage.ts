import { Page, Locator } from '@playwright/test';
import { AdminBasePage } from './AdminBasePage';

export class _AdminProductCreatePage extends AdminBasePage {
  readonly productName: Locator;  // uncertain: uses #Name — verify on first run
  readonly sku: Locator;
  readonly price: Locator;
  readonly saveButton: Locator;
  readonly backToListLink: Locator;

  constructor(page: Page) {
    super(page);
    this.productName    = page.locator('#Name');
    this.sku            = page.getByRole('textbox', { name: 'SKU' });
    this.price          = page.getByRole('spinbutton', { name: 'Price' });
    this.saveButton     = page.getByRole('button', { name: 'Save' }).first();
    this.backToListLink = page.getByRole('link', { name: 'back to product list' });
  }
}
