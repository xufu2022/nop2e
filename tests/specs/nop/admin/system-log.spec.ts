import { test, expect } from '../../../fixtures';
import { AdminSystemLogListPage } from '../../../pages/admin/AdminSystemLogListPage';
import { AdminSystemLogDetailPage } from '../../../pages/admin/AdminSystemLogDetailPage';

test.describe('System Log', () => {
  test('admin can view the system log list', async ({ authenticatedAdmin }) => {
    const listPage = new AdminSystemLogListPage(authenticatedAdmin.page);
    await listPage.navigate();
    await expect(listPage.heading).toBeVisible();
    await expect(listPage.grid).toBeVisible();
  });

  test('admin can filter log by log level', async ({ authenticatedAdmin }) => {
    const listPage = new AdminSystemLogListPage(authenticatedAdmin.page);
    await listPage.navigate();
    await listPage.filterByLogLevel('Error');
    const rows = listPage.grid.getByRole('row').filter({ hasText: 'Error' });
    await expect(rows.first()).toBeVisible();
  });

  test('admin can filter log by message keyword', async ({ authenticatedAdmin }) => {
    const listPage = new AdminSystemLogListPage(authenticatedAdmin.page);
    await listPage.navigate();
    await listPage.filterByMessage('Application started');
    const rows = listPage.grid.getByRole('row').filter({ hasText: 'Application started' });
    await expect(rows.first()).toBeVisible();
  });

  test('admin can filter log by date range', async ({ authenticatedAdmin }) => {
    const listPage = new AdminSystemLogListPage(authenticatedAdmin.page);
    await listPage.navigate();
    await listPage.filterByDateRange('06/29/2026', '06/29/2026');
    await expect(listPage.grid).toBeVisible();
    const rowCount = await listPage.gridRowCount();
    expect(rowCount).toBeGreaterThan(1); // header row + at least one data row
  });

  test('admin can view system log entry details', async ({ authenticatedAdmin }) => {
    const listPage = new AdminSystemLogListPage(authenticatedAdmin.page);
    await listPage.navigate();
    await listPage.firstViewLink().click();
    const detailPage = new AdminSystemLogDetailPage(authenticatedAdmin.page);
    await expect(detailPage.heading).toContainText('View log entry details');
    await expect(detailPage.shortMessageLabel).toBeVisible();
    await expect(detailPage.fullMessageLabel).toBeVisible();
  });
});
