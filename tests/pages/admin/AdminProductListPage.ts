import { Locator } from '@playwright/test';
import { _AdminProductListPage } from './_AdminProductListPage';
import { routes } from '../../fixtures/routes';

export class AdminProductListPage extends _AdminProductListPage {
  async navigate(): Promise<void> {
    await this.goto(routes.admin.products);
  }

  async searchByName(name: string): Promise<void> {
    await this.productNameSearch.fill(name);
    await Promise.all([
      this.page.waitForResponse(resp => resp.url().includes('/Admin/Product/ProductList') && resp.request().method() === 'POST'),
      this.searchButton.click(),
    ]);
  }

  rowFor(productName: string): Locator {
    return this.page.getByRole('row').filter({ hasText: productName });
  }

  async clickEdit(productName: string): Promise<void> {
    await this.rowFor(productName).getByRole('link', { name: 'Edit' }).click();
  }

  async deleteProduct(productName: string): Promise<void> {
    await this.rowFor(productName).getByRole('checkbox').click();
    this.page.once('dialog', dialog => dialog.accept());
    await Promise.all([
      this.page.waitForResponse(resp => resp.url().includes('/Admin/Product/ProductList') && resp.request().method() === 'POST'),
      this.deleteSelectedButton.click(),
    ]);
  }
}
