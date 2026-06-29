import { _AdminTopMenu } from './_AdminTopMenu';
import { routes } from '../../../fixtures/routes';

export class AdminTopMenu extends _AdminTopMenu {
  async navigate(): Promise<void> {
    await this.goto(routes.admin.dashboard);
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
  }
}
