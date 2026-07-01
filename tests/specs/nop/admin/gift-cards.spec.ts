import { test, expect } from '../../../fixtures';
import { AdminGiftCardListPage } from '../../../pages/admin/AdminGiftCardListPage';
import { AdminGiftCardEditPage } from '../../../pages/admin/AdminGiftCardEditPage';

test.describe('Gift Card Management', () => {
  test('admin can view the gift card list', async ({ authenticatedAdmin }) => {
    const listPage = new AdminGiftCardListPage(authenticatedAdmin.page);
    await listPage.navigate();
    await expect(listPage.heading).toBeVisible();
  });

  test('admin can search gift cards by coupon code', async ({ authenticatedAdmin }) => {
    const listPage = new AdminGiftCardListPage(authenticatedAdmin.page);
    await listPage.navigate();
    await listPage.searchByCouponCode('TEST-CODE');
    await expect(listPage.grid.getByRole('row').filter({ hasText: 'TEST-CODE' })).toBeVisible();
  });

  test('admin can filter gift cards by activation status', async ({ authenticatedAdmin }) => {
    const listPage = new AdminGiftCardListPage(authenticatedAdmin.page);
    await listPage.navigate();
    await listPage.filterByActivationStatus('Activated');
    await expect(listPage.grid).toBeVisible();
  });

  test('admin can edit a gift card amount', async ({ authenticatedAdmin }) => {
    const listPage = new AdminGiftCardListPage(authenticatedAdmin.page);
    await listPage.navigate();
    const editLink = listPage.editRowFor('TEST-CODE');
    const count = await editLink.count();
    if (count === 0) { test.skip(); }
    await editLink.click();
    const editPage = new AdminGiftCardEditPage(authenticatedAdmin.page);
    await editPage.updateAmount('50');
    await expect(editPage.amountField).toHaveValue('50');
  });

  test('admin can deactivate a gift card', async ({ authenticatedAdmin }) => {
    const listPage = new AdminGiftCardListPage(authenticatedAdmin.page);
    await listPage.navigate();
    const editLink = listPage.editRowFor('TEST-CODE');
    const count = await editLink.count();
    if (count === 0) { test.skip(); }
    await editLink.click();
    const editPage = new AdminGiftCardEditPage(authenticatedAdmin.page);
    await editPage.deactivate();
    await listPage.navigate();
    await listPage.filterByActivationStatus('Deactivated');
    await expect(listPage.grid.getByRole('row').filter({ hasText: 'TEST-CODE' })).toBeVisible();
  });

  test('admin can view gift card usage history', async ({ authenticatedAdmin }) => {
    const listPage = new AdminGiftCardListPage(authenticatedAdmin.page);
    await listPage.navigate();
    const editLink = listPage.editRowFor('TEST-CODE');
    const count = await editLink.count();
    if (count === 0) { test.skip(); }
    await editLink.click();
    const editPage = new AdminGiftCardEditPage(authenticatedAdmin.page);
    await expect(editPage.usageHistoryGrid).toBeVisible();
  });
});
