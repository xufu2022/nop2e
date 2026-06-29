import { test, expect } from '../../fixtures';
import { AdminProductListPage } from '../../pages/admin/AdminProductListPage';
import { AdminProductCreatePage } from '../../pages/admin/AdminProductCreatePage';
import { generateUniqueString } from '../../../utils/helpers';

test.describe('Product Management', () => {
  test('admin can view the product list', async ({ authenticatedAdmin }) => {
    const listPage = new AdminProductListPage(authenticatedAdmin.page);
    await listPage.navigate();
    await expect(listPage.heading).toBeVisible();
    await expect(listPage.page.getByRole('columnheader', { name: 'Product name' })).toBeVisible();
  });

  test('admin can create a product with name, SKU, and price', async ({ authenticatedAdmin }) => {
    const listPage   = new AdminProductListPage(authenticatedAdmin.page);
    const createPage = new AdminProductCreatePage(authenticatedAdmin.page);
    const name = generateUniqueString('Product');
    const sku  = generateUniqueString('SKU');

    await createPage.navigate();
    await createPage.createProduct(name, sku, '29.99');

    await listPage.navigate();
    await listPage.searchByName(name);
    await expect(listPage.rowFor(name)).toBeVisible();
  });

  test('admin can search products by name', async ({ authenticatedAdmin }) => {
    const listPage = new AdminProductListPage(authenticatedAdmin.page);
    await listPage.navigate();
    await listPage.searchByName('Adobe Photoshop');

    await expect(listPage.rowFor('Adobe Photoshop')).toBeVisible();
    await expect(authenticatedAdmin.page.getByRole('link', { name: 'Edit' })).toHaveCount(1);
  });

  test('admin can edit a product name', async ({ authenticatedAdmin }) => {
    const listPage   = new AdminProductListPage(authenticatedAdmin.page);
    const createPage = new AdminProductCreatePage(authenticatedAdmin.page);
    const originalName = generateUniqueString('EditMe');
    const updatedName  = generateUniqueString('Edited');
    const sku = generateUniqueString('SKU');

    await createPage.navigate();
    await createPage.createProduct(originalName, sku, '49.99');

    await listPage.navigate();
    await listPage.searchByName(originalName);
    await listPage.clickEdit(originalName);

    await createPage.productName.fill(updatedName);
    await Promise.all([
      authenticatedAdmin.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      createPage.saveButton.click(),
    ]);

    await listPage.navigate();
    await listPage.searchByName(updatedName);
    await expect(listPage.rowFor(updatedName)).toBeVisible();
  });

  test('admin can delete a product', async ({ authenticatedAdmin }) => {
    const listPage   = new AdminProductListPage(authenticatedAdmin.page);
    const createPage = new AdminProductCreatePage(authenticatedAdmin.page);
    const name = generateUniqueString('ToDelete');
    const sku  = generateUniqueString('SKU');

    await createPage.navigate();
    await createPage.createProduct(name, sku, '9.99');

    await listPage.navigate();
    await listPage.searchByName(name);
    await listPage.deleteProduct(name);

    await listPage.searchByName(name);
    await expect(listPage.rowFor(name)).not.toBeVisible();
  });
});
