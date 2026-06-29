import { test as setup, expect } from '@playwright/test';
import { AdminBasePage } from '../pages/admin/AdminBasePage';

const authFile = 'playwright/.auth/admin.json';

setup('authenticate as admin', async ({ page }) => {
  const adminPage = new AdminBasePage(page);
  await adminPage.login();
  await page.goto('/Admin');
  await expect(page).toHaveURL(/\/Admin/);
  await page.context().storageState({ path: authFile });
});
