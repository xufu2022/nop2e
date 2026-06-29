import { _ProductPage } from './_ProductPage';

export class ProductPage extends _ProductPage {
  async navigate(productSlug = '/htc-smartphone'): Promise<void> {
    await this.goto(productSlug);
  }

  async addToCart(): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      resp => resp.url().includes('/addproducttocart/')
    );
    await this.addToCartButton.click();
    await responsePromise;
  }

  async getCartCount(): Promise<number> {
    const text  = await this.cartCountLink.textContent() ?? '';
    const match = text.match(/\((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  }
}
