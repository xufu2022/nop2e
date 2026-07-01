import { test, expect } from '../../../fixtures';
import { AdminCurrencyListPage } from '../../../pages/admin/AdminCurrencyListPage';
import { AdminCurrencyEditPage } from '../../../pages/admin/AdminCurrencyEditPage';

test.describe('Currency Management', () => {
  test('admin can view the currency list', async ({ authenticatedAdmin }) => {
    const listPage = new AdminCurrencyListPage(authenticatedAdmin.page);
    await listPage.navigate();
    await expect(listPage.heading).toBeVisible();
  });

  test('admin can edit a currency exchange rate', async ({ authenticatedAdmin }) => {
    const listPage = new AdminCurrencyListPage(authenticatedAdmin.page);
    const editPage = new AdminCurrencyEditPage(authenticatedAdmin.page);

    await listPage.navigate();
    await listPage.editLinkFor('Australian Dollar').click();
    await authenticatedAdmin.page.waitForLoadState('domcontentloaded');

    await editPage.setRate(1.99);

    await expect(listPage.rateCellFor('Australian Dollar')).toContainText('1.99');
  });

  test('admin can set a currency as the primary exchange rate currency', async ({ authenticatedAdmin }) => {
    const listPage = new AdminCurrencyListPage(authenticatedAdmin.page);
    await listPage.navigate();
    await listPage.markAsPrimaryErcFor('Australian Dollar');
    await expect(listPage.isPrimaryErcIconFor('Australian Dollar')).toBeVisible();
  });

  test('admin can set a currency as the primary store currency', async ({ authenticatedAdmin }) => {
    const listPage = new AdminCurrencyListPage(authenticatedAdmin.page);
    await listPage.navigate();
    await listPage.markAsPrimaryStoreCurrencyFor('Australian Dollar');
    await expect(listPage.isPrimaryStoreCurrencyIconFor('Australian Dollar')).toBeVisible();
  });

  test('admin can publish a currency', async ({ authenticatedAdmin }) => {
    const listPage = new AdminCurrencyListPage(authenticatedAdmin.page);
    const editPage = new AdminCurrencyEditPage(authenticatedAdmin.page);

    await listPage.navigate();
    await listPage.editLinkFor('Australian Dollar').click();
    await authenticatedAdmin.page.waitForLoadState('domcontentloaded');

    await editPage.setPublished(true);

    await expect(listPage.isPublishedIconFor('Australian Dollar')).toBeVisible();
  });

  test('admin can unpublish a currency', async ({ authenticatedAdmin }) => {
    const listPage = new AdminCurrencyListPage(authenticatedAdmin.page);
    const editPage = new AdminCurrencyEditPage(authenticatedAdmin.page);

    await listPage.navigate();
    await listPage.editLinkFor('Australian Dollar').click();
    await authenticatedAdmin.page.waitForLoadState('domcontentloaded');

    await editPage.setPublished(false);

    await expect(listPage.isPublishedIconFor('Australian Dollar')).not.toBeVisible();
  });

  test('admin can update live exchange rates', async ({ authenticatedAdmin }) => {
    const listPage = new AdminCurrencyListPage(authenticatedAdmin.page);
    await listPage.navigate();
    await listPage.getLiveRates();
    await expect(listPage.heading).toBeVisible();
  });
});
