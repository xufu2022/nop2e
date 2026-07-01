import { Locator } from '@playwright/test';
import { _AdminLanguageListPage } from './_AdminLanguageListPage';

export class AdminLanguageListPage extends _AdminLanguageListPage {
  async navigate(): Promise<void> {
    await this.goto('/Admin/Language/List');
  }

  rowFor(name: string): Locator {
    return this.grid.getByRole('row').filter({ hasText: name });
  }

  displayOrderCellFor(name: string): Locator {
    return this.rowFor(name).getByRole('cell').nth(3);
  }

  editLinkFor(name: string): Locator {
    return this.rowFor(name).getByRole('link', { name: 'Edit' });
  }
}
