import { _AdminDashboardPage } from './_AdminDashboardPage';
import { routes } from '../../fixtures/routes';

export class AdminDashboardPage extends _AdminDashboardPage {
  async navigate(): Promise<void> {
    await this.goto(routes.admin.dashboard);
  }
}
