import { test, expect } from '../../fixtures';
import { CategoryBrowsePage } from '../../pages/public/CategoryBrowsePage';
import { routes } from '../../fixtures/routes';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Category Browse', () => {
  test('guest can view products listed in a category', async ({ page }) => {
    const categoryPage = new CategoryBrowsePage(page);
    await categoryPage.navigate(routes.public.cameraPhoto);
    await expect(categoryPage.heading).toBeVisible();
    await expect(categoryPage.productItems.first()).toBeVisible();
    await expect(categoryPage.productNames.first()).toBeVisible();
    await expect(categoryPage.productPrices.first()).toBeVisible(); // uncertain: .actual-price selector
  });

  test('guest can sort products by price ascending', async ({ page }) => {
    const categoryPage = new CategoryBrowsePage(page);
    await categoryPage.navigate(routes.public.cameraPhoto);
    await categoryPage.sortBy('Price: Low to High');
    await expect(categoryPage.productItems.first()).toBeVisible();
  });

  test('guest can sort products by price descending', async ({ page }) => {
    const categoryPage = new CategoryBrowsePage(page);
    await categoryPage.navigate(routes.public.cameraPhoto);
    await categoryPage.sortBy('Price: High to Low');
    await expect(categoryPage.productItems.first()).toBeVisible();
  });

  test('guest can sort products by name', async ({ page }) => {
    const categoryPage = new CategoryBrowsePage(page);
    await categoryPage.navigate(routes.public.cameraPhoto);
    await categoryPage.sortBy('Name: A to Z');
    await expect(categoryPage.productItems.first()).toBeVisible();
  });

  test('guest can change the number of products displayed per page', async ({ page }) => {
    const categoryPage = new CategoryBrowsePage(page);
    await categoryPage.navigate(routes.public.cameraPhoto);
    await categoryPage.setPerPage('3');
    await expect(page).toHaveURL(/pagesize=3/); // uncertain: nopCommerce query param name
  });

  test('guest can navigate to a product detail page from the category listing', async ({ page }) => {
    const categoryPage = new CategoryBrowsePage(page);
    await categoryPage.navigate(routes.public.cameraPhoto);
    await categoryPage.clickFirstProduct();
    await expect(page).not.toHaveURL(routes.public.cameraPhoto);
  });

  test('guest can see subcategory links on a parent category page', async ({ page }) => {
    const categoryPage = new CategoryBrowsePage(page);
    await categoryPage.navigate(routes.public.electronics);
    await expect(page.getByRole('link', { name: 'Camera & photo' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Cell phones' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Others' }).first()).toBeVisible();
  });

  test('guest navigating to an empty category sees an appropriate message', async ({ page }) => {
    test.skip(true, 'No reliably empty category identified in demo data — supply an empty category URL to enable this test');
  });
});
