import { test, expect } from '../../../fixtures';
import { AdminLanguageListPage } from '../../../pages/admin/AdminLanguageListPage';
import { AdminLanguageEditPage } from '../../../pages/admin/AdminLanguageEditPage';

const LANGUAGE_ID = 1; // English — update if seeded differently

test.describe('Language Management', () => {
  test('admin can view the language list', async ({ authenticatedAdmin }) => {
    const listPage = new AdminLanguageListPage(authenticatedAdmin.page);
    await listPage.navigate();
    await expect(listPage.heading).toBeVisible();
  });

  test('admin can edit a language name', async ({ authenticatedAdmin }) => {
    const editPage = new AdminLanguageEditPage(authenticatedAdmin.page);
    await editPage.navigate(LANGUAGE_ID);
    await editPage.updateName('English (Updated)');
    const listPage = new AdminLanguageListPage(authenticatedAdmin.page);
    await listPage.navigate();
    await expect(listPage.rowFor('English (Updated)')).toBeVisible();
    // restore
    await editPage.navigate(LANGUAGE_ID);
    await editPage.updateName('English');
  });

  test('admin can set a language as the default', async ({ authenticatedAdmin }) => {
    // nopCommerce uses display order + published status to determine the default language
    const editPage = new AdminLanguageEditPage(authenticatedAdmin.page);
    await editPage.navigate(LANGUAGE_ID);
    await editPage.setDisplayOrder(1);
    const listPage = new AdminLanguageListPage(authenticatedAdmin.page);
    await listPage.navigate();
    await expect(listPage.displayOrderCellFor('English')).toHaveText('1');
  });

  test('admin can publish a language', async ({ authenticatedAdmin }) => {
    const editPage = new AdminLanguageEditPage(authenticatedAdmin.page);
    await editPage.navigate(LANGUAGE_ID);
    await editPage.setPublished(true);
    await editPage.navigate(LANGUAGE_ID);
    await expect(editPage.publishedCheckbox).toBeChecked();
  });

  test('admin can unpublish a language', async ({ authenticatedAdmin }) => {
    const editPage = new AdminLanguageEditPage(authenticatedAdmin.page);
    await editPage.navigate(LANGUAGE_ID);
    await editPage.setPublished(false);
    await editPage.navigate(LANGUAGE_ID);
    await expect(editPage.publishedCheckbox).not.toBeChecked();
    // restore
    await editPage.setPublished(true);
  });

  test('admin can set the display order of a language', async ({ authenticatedAdmin }) => {
    const editPage = new AdminLanguageEditPage(authenticatedAdmin.page);
    await editPage.navigate(LANGUAGE_ID);
    await editPage.setDisplayOrder(2);
    const listPage = new AdminLanguageListPage(authenticatedAdmin.page);
    await listPage.navigate();
    await expect(listPage.displayOrderCellFor('English')).toHaveText('2');
    // restore
    await editPage.navigate(LANGUAGE_ID);
    await editPage.setDisplayOrder(1);
  });

  test('admin can export language resources to XML', async ({ authenticatedAdmin }) => {
    const editPage = new AdminLanguageEditPage(authenticatedAdmin.page);
    await editPage.navigate(LANGUAGE_ID);
    const download = await editPage.exportResources();
    expect(download.suggestedFilename()).toMatch(/\.xml$/i);
  });
});
