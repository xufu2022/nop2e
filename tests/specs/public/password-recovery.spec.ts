import { test, expect } from '../../fixtures';
import { PasswordRecoveryPage } from '../../pages/public/PasswordRecoveryPage';
import { routes } from '../../fixtures/routes';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Password Recovery', () => {
  test('guest can view the password recovery form', async ({ page }) => {
    const recoveryPage = new PasswordRecoveryPage(page);
    await recoveryPage.navigate();
    await expect(recoveryPage.heading).toBeVisible();
    await expect(recoveryPage.emailInput).toBeVisible();
    await expect(recoveryPage.recoverButton).toBeVisible();
  });

  test('guest can request a password recovery email with a registered email', async ({ page }) => {
    const recoveryPage = new PasswordRecoveryPage(page);
    await recoveryPage.navigate();
    await recoveryPage.requestRecovery(process.env.BUYER_USERNAME!);
    await expect(recoveryPage.successMessage).toBeVisible(); // uncertain: exact success message text
  });

  test('guest cannot request recovery with an email not registered in the system', async ({ page }) => {
    const recoveryPage = new PasswordRecoveryPage(page);
    await recoveryPage.navigate();
    await recoveryPage.requestRecovery('notregistered@example.com');
    await expect(recoveryPage.errorMessage).toBeVisible(); // uncertain: error selector
  });

  test('guest cannot submit the recovery form with an empty email field', async ({ page }) => {
    const recoveryPage = new PasswordRecoveryPage(page);
    await recoveryPage.navigate();
    await recoveryPage.recoverButton.click();
    await expect(recoveryPage.errorMessage).toBeVisible();
  });

  test('guest cannot submit with an invalid email format', async ({ page }) => {
    const recoveryPage = new PasswordRecoveryPage(page);
    await recoveryPage.navigate();
    await recoveryPage.requestRecovery('not-an-email');
    await expect(recoveryPage.errorMessage).toBeVisible();
  });

  test('guest can navigate back to the login page from the recovery form', async ({ page }) => {
    const recoveryPage = new PasswordRecoveryPage(page);
    await recoveryPage.navigate();
    await recoveryPage.loginLink.click();
    await expect(page).toHaveURL(routes.public.login);
  });
});
