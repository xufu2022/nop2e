import { test, expect } from '../../fixtures';
import { ProductPage } from '../../pages/public/ProductPage';
import { routes } from '../../fixtures/routes';
import { getCredentials } from '../../fixtures/role-config';

// Override project-level storageState — guest and buyer tests both start unauthenticated
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Product Reviews', () => {
  test('guest can view existing reviews on a product page', async ({ page }) => {
    const productPage = new ProductPage(page);
    await productPage.navigate(routes.public.productWithReviews);
    await expect(productPage.existingReviewsHeading).toBeVisible();
    await expect(page.getByRole('strong').first()).toBeVisible();
  });

  test('guest can see the review count link near the product title', async ({ page }) => {
    const productPage = new ProductPage(page);
    await productPage.navigate(routes.public.productWithReviews);
    await expect(productPage.reviewCountLink).toBeVisible();
  });

  test('guest cannot write a review without logging in — sees registered users only message', async ({ page }) => {
    const productPage = new ProductPage(page);
    await productPage.navigate(routes.public.productWithReviews);
    await expect(productPage.onlyRegisteredUsersMessage).toBeVisible();
    await expect(productPage.writeReviewHeading).not.toBeVisible();
  });

  test('registered user can submit a review with a title, text, and star rating', async ({ page }) => {
    const productPage = new ProductPage(page);
    await productPage.login(getCredentials('buyer').username, getCredentials('buyer').password);
    await productPage.navigate(routes.public.productWithReviews);
    await productPage.reviewTitleInput.fill('Great phone');
    await productPage.reviewTextInput.fill('Excellent camera quality and great build. Highly recommended.');
    await page.getByRole('radio', { name: 'Excellent' }).check();
    await productPage.submitReviewButton.click();
    await expect(productPage.reviewSuccessMessage).toBeVisible(); // uncertain: exact message text
  });

  test('registered user cannot submit a review with missing title', async ({ page }) => {
    const productPage = new ProductPage(page);
    await productPage.login(getCredentials('buyer').username, getCredentials('buyer').password);
    await productPage.navigate(routes.public.productWithReviews);
    await productPage.reviewTextInput.fill('Good product overall, very happy with the purchase.');
    await productPage.submitReviewButton.click();
    await expect(page.locator('.field-validation-error').first()).toBeVisible(); // uncertain: validation error selector
  });

  test.skip('registered user cannot submit a review with missing rating', async () => {
    // The rating field defaults to "Excellent" and cannot be deselected through normal browser UI
  });

  test.skip('registered user can see their submitted review after approval', async () => {
    // Requires manual admin approval before the review appears on the product page
  });
});
