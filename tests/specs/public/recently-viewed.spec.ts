import { test, expect } from '../../fixtures';
import { ProductPage } from '../../pages/public/ProductPage';
import { RecentlyViewedPage } from '../../pages/public/RecentlyViewedPage';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Recently Viewed Products', () => {
  test('Guest who has visited product pages can see those products listed', async ({ page }) => {
    const productPage = new ProductPage(page);
    const recentlyViewedPage = new RecentlyViewedPage(page);

    await productPage.navigate('/nokia-lumia-1020');
    await recentlyViewedPage.navigate();

    await expect(recentlyViewedPage.productCard('Nokia Lumia 1020')).toBeVisible();
    await expect(recentlyViewedPage.productCard('Nokia Lumia 1020')).toContainText('$349.00');
  });

  test('Guest can navigate to a product from the recently viewed list', async ({ page }) => {
    const productPage = new ProductPage(page);
    const recentlyViewedPage = new RecentlyViewedPage(page);

    await productPage.navigate('/nokia-lumia-1020');
    await recentlyViewedPage.navigate();

    await recentlyViewedPage.productLink('Nokia Lumia 1020').click();
    await expect(page).toHaveURL(/nokia-lumia-1020/);
  });

  test('Guest who has not viewed any products sees an empty state', async ({ page }) => {
    const recentlyViewedPage = new RecentlyViewedPage(page);

    await recentlyViewedPage.navigate();

    await expect(recentlyViewedPage.productCards).toHaveCount(0);
    await expect(recentlyViewedPage.noProductsMessage).toBeVisible();
  });

  test('Guest sees the most recently visited product present in the list', async ({ page }) => {
    const productPage = new ProductPage(page);
    const recentlyViewedPage = new RecentlyViewedPage(page);

    await productPage.navigate('/nokia-lumia-1020');
    await productPage.navigate('/htc-smartphone');
    await recentlyViewedPage.navigate();

    await expect(recentlyViewedPage.productCard('HTC smartphone')).toBeVisible();
  });
});
