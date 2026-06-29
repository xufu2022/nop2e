import { test as setup, expect } from '@playwright/test';
import { PublicBasePage } from '../pages/public/PublicBasePage';

const authFile = 'playwright/.auth/buyer.json';

setup('authenticate as buyer', async ({ page }) => {
  const publicPage = new PublicBasePage(page);
  await publicPage.login();
  await expect(page).toHaveURL('/');
  await page.context().storageState({ path: authFile });
});
