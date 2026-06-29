import { test, expect } from '../../fixtures';
import { AdminDashboardPage } from '../../pages/admin/AdminDashboardPage';
import { AdminLeftMenu } from '../../pages/admin/components/AdminLeftMenu';
import { AdminTopMenu } from '../../pages/admin/components/AdminTopMenu';
import { LoginPage } from '../../pages/public/LoginPage';

test.describe('Admin Dashboard', () => {
  test.describe('Administration button navigation', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('admin can log in and navigate to admin panel via Administration button', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.navigate();
      await loginPage.login(process.env.ADMIN_USERNAME!, process.env.ADMIN_PASSWORD!);

      const administrationLink = page.getByRole('link', { name: 'Administration' });
      await expect(administrationLink).toBeVisible();
      await administrationLink.click();
      await expect(page).toHaveURL(/\/Admin/i);
    });
  });

  test('dashboard heading is visible', async ({ authenticatedAdmin }) => {
    const dashboardPage = new AdminDashboardPage(authenticatedAdmin.page);
    await dashboardPage.navigate();
    await expect(dashboardPage.heading).toBeVisible();
  });

  test('left menu Dashboard link is active on the dashboard page', async ({ authenticatedAdmin }) => {
    const leftMenu = new AdminLeftMenu(authenticatedAdmin.page);
    await leftMenu.navigate();
    const isActive = await leftMenu.isLinkActive('Dashboard');
    expect(isActive).toBe(true);
  });

  test('left menu highlights Catalog when navigating to products', async ({ authenticatedAdmin }) => {
    const leftMenu = new AdminLeftMenu(authenticatedAdmin.page);
    await leftMenu.navigate();
    await leftMenu.expandCatalog();
    await leftMenu.productsLink.click();
    await expect(authenticatedAdmin.page).toHaveURL(/\/Admin\/Product\/List/);
    const isActive = await leftMenu.isLinkActive('Catalog');
    expect(isActive).toBe(true);
  });

  test('top menu shows Logout and Public store links', async ({ authenticatedAdmin }) => {
    const topMenu = new AdminTopMenu(authenticatedAdmin.page);
    await authenticatedAdmin.navigateToDashboard();
    await expect(topMenu.logoutLink).toBeVisible();
    await expect(topMenu.publicStoreLink).toBeVisible();
  });
});
