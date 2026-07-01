import { test as base } from '@playwright/test';
import { AdminBasePage } from '../pages/admin/AdminBasePage';
import { PublicBasePage } from '../pages/public/PublicBasePage';

type Fixtures = {
  adminPage: AdminBasePage;
  publicPage: PublicBasePage;
  authenticatedAdmin: AdminBasePage;
};

export const test = base.extend<Fixtures>({
  adminPage: async ({ page }, use) => {
    await use(new AdminBasePage(page));
  },
  publicPage: async ({ page }, use) => {
    await use(new PublicBasePage(page));
  },
  authenticatedAdmin: async ({ page }, use) => {
    await use(new AdminBasePage(page));
  },
});

export { expect } from '@playwright/test';
export { timeouts } from './timeouts';

// Factory re-exports — add one line per new factory file
export { fakeUser } from '../../utils/factories/user.factory';
