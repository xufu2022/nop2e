import { Locator } from '@playwright/test';
import { _AdminSystemLogListPage } from './_AdminSystemLogListPage';

export class AdminSystemLogListPage extends _AdminSystemLogListPage {
  async navigate(): Promise<void> {
    await this.goto('/Admin/Log/List');
  }

  async filterByLogLevel(level: 'All' | 'Debug' | 'Information' | 'Warning' | 'Error' | 'Fatal'): Promise<void> {
    await this.logLevelFilter.selectOption({ label: level });
    await Promise.all([
      this.page.waitForResponse(
        resp => resp.url().includes('/Admin/Log/LogList') && resp.request().method() === 'POST'
      ),
      this.searchButton.click(),
    ]);
  }

  async filterByMessage(keyword: string): Promise<void> {
    await this.messageField.fill(keyword);
    await Promise.all([
      this.page.waitForResponse(
        resp => resp.url().includes('/Admin/Log/LogList') && resp.request().method() === 'POST'
      ),
      this.searchButton.click(),
    ]);
  }

  async filterByDateRange(from: string, to: string): Promise<void> {
    await this.createdFromField.fill(from);
    await this.createdToField.fill(to);
    await Promise.all([
      this.page.waitForResponse(
        resp => resp.url().includes('/Admin/Log/LogList') && resp.request().method() === 'POST'
      ),
      this.searchButton.click(),
    ]);
  }

  firstViewLink(): Locator {
    return this.grid.getByRole('link', { name: 'View' }).first();
  }

  gridRowCount(): Promise<number> {
    return this.grid.getByRole('row').count();
  }
}
