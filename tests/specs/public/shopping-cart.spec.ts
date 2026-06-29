import { test, expect } from '../../fixtures';
import { ProductPage } from '../../pages/public/ProductPage';
import { CartPage } from '../../pages/public/CartPage';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    const cartPage = new CartPage(page);
    await cartPage.clearCart();
  });

  test('user can add a product to the cart', async ({ page }) => {
    const productPage = new ProductPage(page);

    await productPage.navigate();
    await productPage.addToCart();

    await expect(productPage.cartCountLink).toContainText('(1)');
  });

  test('user can update item quantity to 2', async ({ page }) => {
    const productPage = new ProductPage(page);
    const cartPage    = new CartPage(page);

    await productPage.navigate();
    await productPage.addToCart();
    await cartPage.navigate();
    await cartPage.updateQuantity(2);

    // HTC smartphone is $245.00; qty 2 = $490.00
    await expect(cartPage.subTotalRow).toContainText('$490.00');
  });

  test('user can remove an item', async ({ page }) => {
    const productPage = new ProductPage(page);
    const cartPage    = new CartPage(page);

    await productPage.navigate();
    await productPage.addToCart();
    await cartPage.navigate();
    await cartPage.removeItem();

    await expect(cartPage.emptyCartMessage).toBeVisible();
  });
});
