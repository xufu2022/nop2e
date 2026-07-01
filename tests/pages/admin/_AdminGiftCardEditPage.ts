import { Page, Locator } from '@playwright/test';
import { AdminBasePage } from './AdminBasePage';

export class _AdminGiftCardEditPage extends AdminBasePage {
  readonly heading: Locator;
  readonly amountField: Locator;
  readonly isActivatedCheckbox: Locator;
  readonly saveButton: Locator;
  readonly usageHistoryGrid: Locator;

  constructor(page: Page) {
    super(page);
    this.heading              = page.getByRole('heading', { level: 1 });
    this.amountField          = page.getByRole('spinbutton', { name: 'Initial value' });
    this.isActivatedCheckbox  = page.getByLabel('Is gift card activated');
    this.saveButton           = page.getByRole('button', { name: 'Save' });
    this.usageHistoryGrid     = page.locator('#usagehistory-grid'); // uncertain — verify grid element ID
  }
}
