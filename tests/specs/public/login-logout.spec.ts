import { test, expect } from '../../fixtures';
import { LoginPage } from '../../pages/public/LoginPage';
import { HomePage } from '../../pages/public/HomePage';

// Override project-level storageState — these tests exercise the login UI directly
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login / Logout', () => {
  test('admin login and logout flow', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage  = new HomePage(page);

    await test.step('admin can log in via public login page and see Administration link', async () => {
      await loginPage.navigate();
      await loginPage.login(process.env.ADMIN_USERNAME!, process.env.ADMIN_PASSWORD!);
      await expect(homePage.administrationLink).toBeVisible();
      await expect(homePage.logOutLink).toBeVisible();
    });

    await test.step('admin can log out and see login link', async () => {
      await homePage.logout();
      await expect(homePage.logInLink).toBeVisible();
      await expect(homePage.administrationLink).not.toBeVisible();
    });
  });
});
