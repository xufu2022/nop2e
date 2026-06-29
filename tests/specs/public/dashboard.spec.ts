import { test, expect } from '../../fixtures';
import { HomePage } from '../../pages/public/HomePage';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Dashboard', () => {
  test('it is home page, path /', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    await expect(page).toHaveURL('/');
  });

  test('should find Welcome to our store', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    await expect(homePage.welcomeHeading).toBeVisible();
  });

  test('should be able to find Featured products', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    await expect(homePage.featuredProductsHeading).toBeVisible();
  });

  test("if there are Featured products, should be able to click 'Add to wishlist' and url contains '/addproducttocart/catalog'", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    const count = await homePage.featuredProductArticles.count();
    if (count === 0) { test.skip(); }
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/addproducttocart/catalog')),
      homePage.addToWishlistButtons.first().click(),
    ]);
  });
});
