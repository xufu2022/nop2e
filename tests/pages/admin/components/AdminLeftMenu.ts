import { _AdminLeftMenu } from './_AdminLeftMenu';
import { routes } from '../../../fixtures/routes';

export class AdminLeftMenu extends _AdminLeftMenu {
  async navigate(): Promise<void> {
    await this.goto(routes.admin.dashboard);
  }

  async expandCatalog(): Promise<void> {
    await this.catalogLink.click();
  }

  async expandSales(): Promise<void> {
    await this.salesLink.click();
  }

  // uncertain: relies on AdminLTE .active / .menu-open CSS class on <li> — verify on first run
  async isLinkActive(linkName: string): Promise<boolean> {
    const link = this.page.getByRole('link', { name: linkName });
    const li   = link.locator('..');
    const linkClass = (await link.getAttribute('class')) ?? '';
    const liClass   = (await li.getAttribute('class')) ?? '';
    return linkClass.includes('active') || liClass.includes('menu-open');
  }
}
