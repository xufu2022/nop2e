import { _AdminOrderDetailsPage } from './_AdminOrderDetailsPage';

export class AdminOrderDetailsPage extends _AdminOrderDetailsPage {
  async navigate(orderId: number): Promise<void> {
    await this.goto(`/Admin/Order/Edit/${orderId}`);
  }
}
