import { test, expect } from '../../fixtures';
import { ContactUsPage } from '../../pages/public/ContactUsPage';
import { getCredentials } from '../../fixtures/role-config';

// Override project-level storageState — guest tests need no auth, registered-user test logs in manually
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Contact Us', () => {
  test('guest can view the contact form', async ({ page }) => {
    const contactPage = new ContactUsPage(page);
    await contactPage.navigate();
    await expect(contactPage.heading).toBeVisible();
    await expect(contactPage.nameInput).toBeVisible();
    await expect(contactPage.emailInput).toBeVisible();
    await expect(contactPage.enquiryInput).toBeVisible();
    await expect(contactPage.submitButton).toBeVisible();
  });

  test('guest can submit the contact form with all required fields filled', async ({ page }) => {
    const contactPage = new ContactUsPage(page);
    await contactPage.navigate();
    await contactPage.fillAndSubmit('Test User', 'test@example.com', 'This is a test enquiry message.');
    await expect(contactPage.successMessage).toBeVisible(); // uncertain: exact success message text
  });

  test('guest cannot submit the form without a name', async ({ page }) => {
    const contactPage = new ContactUsPage(page);
    await contactPage.navigate();
    await contactPage.emailInput.fill('test@example.com');
    await contactPage.enquiryInput.fill('Test message body.');
    await contactPage.submitButton.click();
    await expect(page.locator('.field-validation-error').first()).toBeVisible(); // uncertain: validation error selector
  });

  test('guest cannot submit the form without an email', async ({ page }) => {
    const contactPage = new ContactUsPage(page);
    await contactPage.navigate();
    await contactPage.nameInput.fill('Test User');
    await contactPage.enquiryInput.fill('Test message body.');
    await contactPage.submitButton.click();
    await expect(page.locator('.field-validation-error').first()).toBeVisible();
  });

  test('guest cannot submit the form without a message body', async ({ page }) => {
    const contactPage = new ContactUsPage(page);
    await contactPage.navigate();
    await contactPage.nameInput.fill('Test User');
    await contactPage.emailInput.fill('test@example.com');
    await contactPage.submitButton.click();
    await expect(page.locator('.field-validation-error').first()).toBeVisible();
  });

  test('guest cannot submit the form with an invalid email format', async ({ page }) => {
    const contactPage = new ContactUsPage(page);
    await contactPage.navigate();
    await contactPage.fillAndSubmit('Test User', 'not-an-email', 'Test message body.');
    await expect(page.locator('.field-validation-error').first()).toBeVisible();
  });

  test('registered user sees name and email pre-filled on the contact form', async ({ page }) => {
    const contactPage = new ContactUsPage(page);
    await contactPage.login(getCredentials('buyer').username, getCredentials('buyer').password);
    await contactPage.navigate();
    await expect(contactPage.nameInput).not.toHaveValue('');
    await expect(contactPage.emailInput).not.toHaveValue('');
  });
});
