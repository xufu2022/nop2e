import { Page, Locator } from '@playwright/test';
import { PublicLayoutPage } from './PublicLayoutPage';

export class _RegistrationPage extends PublicLayoutPage {
  readonly heading: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly registerButton: Locator;
  readonly errorSummary: Locator;
  readonly fieldErrors: Locator;

  constructor(page: Page) {
    super(page);
    this.heading              = page.getByRole('heading', { name: 'Register', level: 1 });
    this.firstNameInput       = page.getByRole('textbox', { name: 'First name:' });
    this.lastNameInput        = page.getByRole('textbox', { name: 'Last name:' });
    this.emailInput           = page.getByRole('textbox', { name: 'Email:' });
    this.passwordInput        = page.getByRole('textbox', { name: 'Password:', exact: true });
    this.confirmPasswordInput = page.getByRole('textbox', { name: 'Confirm password:' });
    this.registerButton       = page.getByRole('button', { name: 'Register' });
    this.errorSummary         = page.locator('.message-error');
    this.fieldErrors          = page.locator('.field-validation-error');
  }
}
