import { _AdminSystemLogDetailPage } from './_AdminSystemLogDetailPage';

export class AdminSystemLogDetailPage extends _AdminSystemLogDetailPage {
  async navigateToEntry(id: number): Promise<void> {
    await this.goto(`/Admin/Log/View/${id}`);
  }
}
