import { test, expect } from '../../fixtures';
import { PublicBasePage } from '../../pages/public/PublicBasePage';
import { ProductPage } from '../../pages/public/ProductPage';
import { CategoryBrowsePage } from '../../pages/public/CategoryBrowsePage';
import { WishlistPage } from '../../pages/public/WishlistPage';
import { CartPage } from '../../pages/public/CartPage';
import { routes } from '../../fixtures/routes';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Wishlist', () => {
  test.beforeEach(async ({ page }) => {
    const publicPage = new PublicBasePage(page);
    await publicPage.login();
    const wishlistPage = new WishlistPage(page);
    await wishlistPage.clearWishlist();
  });

  test('Buyer can view an empty wishlist — empty state message shown', async ({ page }) => {
    const wishlistPage = new WishlistPage(page);
    await wishlistPage.navigate();
    await expect(wishlistPage.emptyMessage).toBeVisible();
  });

  test('Buyer can add a product to the wishlist from a product detail page — wishlist count increases', async ({ page }) => {
    const productPage = new ProductPage(page);
    const wishlistPage = new WishlistPage(page);

    await productPage.navigate();
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/addproducttocart/details/') && resp.request().method() === 'POST'),
      productPage.addToWishlistButton.click(),
    ]);

    await expect(wishlistPage.wishlistQty).toContainText('(1)');
  });

  test('Buyer can add a product to the wishlist from a category listing — wishlist count increases', async ({ page }) => {
    const categoryPage = new CategoryBrowsePage(page);
    const wishlistPage = new WishlistPage(page);

    await categoryPage.navigate(routes.public.cameraPhoto);
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/addproducttocart/catalog/') && resp.request().method() === 'POST'),
      categoryPage.productItems.first().getByRole('button', { name: 'Add to wishlist' }).click(),
    ]);

    await expect(wishlistPage.wishlistQty).toContainText('(1)');
  });

  test('Buyer adding the same product to the wishlist twice does not create a duplicate — only one entry shown', async ({ page }) => {
    const productPage = new ProductPage(page);
    const wishlistPage = new WishlistPage(page);

    await productPage.navigate();
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/addproducttocart/details/') && resp.request().method() === 'POST'),
      productPage.addToWishlistButton.click(),
    ]);
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/addproducttocart/details/') && resp.request().method() === 'POST'),
      productPage.addToWishlistButton.click(),
    ]);

    await wishlistPage.navigate();
    await expect(wishlistPage.wishlistRows).toHaveCount(1);
  });

  test('Buyer can view all wishlisted products with their names and prices — product info displayed', async ({ page }) => {
    const productPage = new ProductPage(page);
    const wishlistPage = new WishlistPage(page);

    await productPage.navigate();
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/addproducttocart/details/') && resp.request().method() === 'POST'),
      productPage.addToWishlistButton.click(),
    ]);

    await wishlistPage.navigate();
    await expect(wishlistPage.rowFor('HTC smartphone')).toBeVisible();
    await expect(wishlistPage.rowFor('HTC smartphone')).toContainText('$245.00');
  });

  test('Buyer can remove an individual item from the wishlist — item no longer shown in the list', async ({ page }) => {
    const productPage = new ProductPage(page);
    const wishlistPage = new WishlistPage(page);

    await productPage.navigate();
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/addproducttocart/details/') && resp.request().method() === 'POST'),
      productPage.addToWishlistButton.click(),
    ]);

    await wishlistPage.navigate();
    await wishlistPage.removeItem('HTC smartphone');

    await expect(wishlistPage.emptyMessage).toBeVisible();
  });

  test('Buyer can add a wishlist item to the cart — item appears in cart, wishlist count decreases', async ({ page }) => {
    const productPage = new ProductPage(page);
    const wishlistPage = new WishlistPage(page);
    const cartPage = new CartPage(page);

    await productPage.navigate();
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/addproducttocart/details/') && resp.request().method() === 'POST'),
      productPage.addToWishlistButton.click(),
    ]);

    await wishlistPage.navigate();
    await wishlistPage.rowFor('HTC smartphone').getByRole('checkbox', { name: 'Add to cart' }).check();
    await wishlistPage.addAllToCart();

    await cartPage.navigate();
    await expect(page.getByRole('row').filter({ hasText: 'HTC smartphone' })).toBeVisible();
    await expect(wishlistPage.wishlistQty).toContainText('(0)');
  });
});

test.describe('Wishlist — guest', () => {
  test('Guest attempting to add a product to the wishlist is prompted to log in — login page or prompt shown', async ({ page }) => {
    const productPage = new ProductPage(page);
    await productPage.navigate();
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.getByRole('button', { name: 'Add to wishlist' }).first().click(),
    ]);
    await expect(page).toHaveURL(/\/login/);
  });
});
