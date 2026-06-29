import { test, expect } from '../../fixtures';
import { PublicBasePage } from '../../pages/public/PublicBasePage';
import { RegistrationPage } from '../../pages/public/RegistrationPage';
import { LoginPage } from '../../pages/public/LoginPage';
import { generateEmail } from '../../../utils/helpers';
import { getCredentials } from '../../fixtures/role-config';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('User Registration', () => {
  test('Guest can register with a valid email and password — account created, redirected to home page', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    await registrationPage.navigate();
    await registrationPage.register('Test', 'User', generateEmail(), 'Password123!');
    await expect(page).not.toHaveURL(/\/register/);
  });

  test('Guest can register with an already used email — error message shown, registration blocked', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    await registrationPage.navigate();
    await registrationPage.register('Test', 'User', getCredentials('admin').username, 'Password123!');
    await expect(registrationPage.errorSummary).toBeVisible();
  });

  test('Guest can register with a mismatched password confirmation — validation error shown inline', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    await registrationPage.navigate();
    await registrationPage.firstNameInput.fill('Test');
    await registrationPage.lastNameInput.fill('User');
    await registrationPage.emailInput.fill(generateEmail());
    await registrationPage.passwordInput.fill('Password123!');
    await registrationPage.confirmPasswordInput.fill('Different456!');
    await registrationPage.clickRegister();
    await expect(registrationPage.fieldErrors.first()).toBeVisible();
  });

  test('Guest can register with a missing required field — validation error shown on that field', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    await registrationPage.navigate();
    await registrationPage.clickRegister();
    await expect(registrationPage.fieldErrors.first()).toBeVisible();
  });

  test('Registered user can log in with correct credentials — redirected to home page, username shown in header', async ({ page }) => {
    const publicPage = new PublicBasePage(page);
    await publicPage.login();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('link', { name: 'My account' })).toBeVisible();
  });

  test('Registered user can log in with wrong password — error message shown, stays on login page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(getCredentials('buyer').username, 'wrongpassword');
    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('Logged-in user can log out — session cleared, header shows login link', async ({ page }) => {
    const publicPage = new PublicBasePage(page);
    await publicPage.login();
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      publicPage.logout(),
    ]);
    await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible();
  });
});
