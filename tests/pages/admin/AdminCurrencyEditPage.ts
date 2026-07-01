import { _AdminCurrencyEditPage } from './_AdminCurrencyEditPage';

export class AdminCurrencyEditPage extends _AdminCurrencyEditPage {
  async navigate(id: number): Promise<void> {
    await this.goto(`/Admin/Currency/Edit/${id}`);
  }

  async setRate(rate: number): Promise<void> {
    await this.rateField.fill(String(rate));
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
}
