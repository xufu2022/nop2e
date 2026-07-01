import { _AdminGiftCardEditPage } from './_AdminGiftCardEditPage';

export class AdminGiftCardEditPage extends _AdminGiftCardEditPage {
  async updateAmount(amount: string): Promise<void> {
    await this.amountField.fill(amount);
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      this.saveButton.click(),
    ]);
  }

  async deactivate(): Promise<void> {
    if (await this.isActivatedCheckbox.isChecked()) {
      await this.isActivatedCheckbox.uncheck();
    }
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      this.saveButton.click(),
    ]);
  }
}
