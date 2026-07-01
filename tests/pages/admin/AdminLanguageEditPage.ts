import { Download } from '@playwright/test';
import { _AdminLanguageEditPage } from './_AdminLanguageEditPage';

export class AdminLanguageEditPage extends _AdminLanguageEditPage {
  async navigate(id: number): Promise<void> {
    await this.goto(`/Admin/Language/Edit/${id}`);
  }

  async updateName(name: string): Promise<void> {
    await this.nameField.fill(name);
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      this.saveButton.click(),
    ]);
  }

  async setPublished(published: boolean): Promise<void> {
    const checked = await this.publishedCheckbox.isChecked();
    if (published && !checked) await this.publishedCheckbox.check();
    if (!published && checked) await this.publishedCheckbox.uncheck();
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      this.saveButton.click(),
    ]);
  }

  async setDisplayOrder(order: number): Promise<void> {
    await this.displayOrderField.fill(String(order));
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      this.saveButton.click(),
    ]);
  }

  async exportResources(): Promise<Download> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.exportResourcesLink.click(),
    ]);
    return download;
  }
}
