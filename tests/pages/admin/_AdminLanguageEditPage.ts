import { Page, Locator } from '@playwright/test';
import { AdminBasePage } from './AdminBasePage';

export class _AdminLanguageEditPage extends AdminBasePage {
  readonly heading: Locator;
  readonly nameField: Locator;
  readonly publishedCheckbox: Locator;
  readonly displayOrderField: Locator;
  readonly saveButton: Locator;
  readonly exportResourcesLink: Locator;

  constructor(page: Page) {
    super(page);
    this.heading             = page.getByRole('heading', { level: 1 });
    this.nameField           = page.getByRole('textbox', { name: 'Name' });
    this.publishedCheckbox   = page.getByLabel('Published');
    this.displayOrderField   = page.getByRole('spinbutton', { name: 'Display order' });
    this.saveButton          = page.getByRole('button', { name: 'Save' });
    this.exportResourcesLink = page.getByRole('link', { name: 'Export resources' });
  }
}
