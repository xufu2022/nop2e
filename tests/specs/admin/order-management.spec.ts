import { test, expect } from '../../fixtures';
import { AdminOrderListPage } from '../../pages/admin/AdminOrderListPage';
import { AdminOrderDetailsPage } from '../../pages/admin/AdminOrderDetailsPage';

test.describe('Order Management', () => {
  test('admin can view the order list', async ({ authenticatedAdmin }) => {
    const orderList = new AdminOrderListPage(authenticatedAdmin.page);
    await orderList.navigate();
    await expect(orderList.heading).toBeVisible();
    await expect(orderList.orderNumberHeader.first()).toBeVisible();
    await expect(orderList.orderStatusHeader.first()).toBeVisible();
  });

  test('admin can filter orders by status Pending', async ({ authenticatedAdmin }) => {
    const orderList = new AdminOrderListPage(authenticatedAdmin.page);
    await orderList.navigate();
    await orderList.filterByStatus('Pending');
    const rows = orderList.dataRows();
    const count = await rows.count();
    if (count === 0) {
      test.skip(true, 'No Pending orders in test environment');
      return;
    }
    for (let i = 0; i < count; i++) {
      await expect(orderList.rowOrderStatusCell(rows.nth(i))).toContainText('Pending');
    }
  });

  test('admin can view order details', async ({ authenticatedAdmin }) => {
    const orderList    = new AdminOrderListPage(authenticatedAdmin.page);
    const orderDetails = new AdminOrderDetailsPage(authenticatedAdmin.page);
    await orderList.navigate();
    await orderList.clickFirstView();
    await expect(orderDetails.backToListLink).toBeVisible();
    await expect(orderDetails.customerLink).toBeVisible();
    await expect(orderDetails.productsTable).toBeVisible();
    await expect(orderDetails.orderTotalLabel).toBeVisible();
  });
});
