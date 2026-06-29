import { _AdminProductCreatePage } from './_AdminProductCreatePage';
import { routes } from '../../fixtures/routes';

export class AdminProductCreatePage extends _AdminProductCreatePage {
  async navigate(): Promise<void> {
    await this.goto(routes.admin.productCreate);
  }

  async createProduct(name: string, sku: string, price: string): Promise<void> {
    await this.productName.fill(name);
    await this.sku.fill(sku);
    await this.price.fill(price);
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      this.saveButton.click(),
    ]);
  }
}
