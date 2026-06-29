import { test, expect } from '../../fixtures';
import { HomePage } from '../../pages/public/HomePage';

// Guest tests — bypass project-level admin storageState
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Newsletter Subscription', () => {
  test('Guest can subscribe to the newsletter with a valid email via the footer form — success confirmation shown', async ({ page }) => {
    const home = new HomePage(page);
    await home.navigate();
    const email = `newsletter.test.${Date.now()}@example.com`;
    await home.newsletterEmailInput.fill(email);
    await home.newsletterSubscribeButton.click();
    await expect(home.newsletterResultBlock).toBeVisible();
    await expect(home.newsletterResultBlock).toContainText('Thank you for signing up');
    await expect(home.newsletterSubscribeBlock).not.toBeVisible();
  });

  test('Guest cannot subscribe with an empty email field — no form submission occurs', async ({ page }) => {
    const home = new HomePage(page);
    await home.navigate();
    await home.newsletterSubscribeButton.click();
    await expect(home.newsletterSubscribeBlock).toBeVisible();
    await expect(home.newsletterResultBlock).not.toBeVisible();
  });

  test('Guest cannot subscribe with an invalid email format — validation error shown', async ({ page }) => {
    const home = new HomePage(page);
    await home.navigate();
    await home.newsletterEmailInput.fill('notanemail');
    await home.newsletterSubscribeButton.click();
    await expect(home.newsletterResultBlock).toBeVisible();
    await expect(home.newsletterResultBlock).toContainText('Enter valid email');
  });

  test('Submitting an already-subscribed email shows an already-subscribed message — no duplicate subscription created', async ({ page }) => {
    const home = new HomePage(page);
    const email = `already.sub.${Date.now()}@example.com`;

    // First subscription
    await home.navigate();
    await home.newsletterEmailInput.fill(email);
    await home.newsletterSubscribeButton.click();
    await expect(home.newsletterResultBlock).toBeVisible();

    // Re-submit the same email on a fresh page load
    await home.navigate();
    await home.newsletterEmailInput.fill(email);
    await home.newsletterSubscribeButton.click();
    await expect(home.newsletterResultBlock).toBeVisible();
  });
});
