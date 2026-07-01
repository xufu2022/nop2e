import { test, expect, fakeUser } from '../../fixtures';
import { RegistrationPage } from '../../pages/public/RegistrationPage';
import { LoginPage } from '../../pages/public/LoginPage';
import { PublicBasePage } from '../../pages/public/PublicBasePage';
import { getCredentials } from '../../fixtures/role-config';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('User Registration', () => {
  test('Guest can register with a valid email and password — account created, redirected to home page', async ({ page }) => {
    const data = fakeUser();
    const registrationPage = new RegistrationPage(page);
    await registrationPage.navigate();
    await registrationPage.register(data.firstName, data.lastName, data.email, data.password);
    await expect(page).not.toHaveURL(/\/register/);
  });

  test('Guest can register with an already used email — error message shown, registration blocked', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    await registrationPage.navigate();
    await registrationPage.register('Any', 'Name', getCredentials('buyer').username, 'Password123!');
    await expect(registrationPage.errorSummary).toBeVisible();
  });

  test('Guest can register with a mismatched password confirmation — validation error shown inline', async ({ page }) => {
    const data = fakeUser();
    const registrationPage = new RegistrationPage(page);
    await registrationPage.navigate();
    await registrationPage.register(data.firstName, data.lastName, data.email, data.password, 'Different456!');
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
    await publicPage.logout();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible();
  });
});
