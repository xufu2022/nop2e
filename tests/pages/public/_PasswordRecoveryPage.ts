import { Page, Locator } from '@playwright/test';
import { PublicLayoutPage } from './PublicLayoutPage';

export class _PasswordRecoveryPage extends PublicLayoutPage {
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly recoverButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    super(page);
    this.heading        = page.getByRole('heading', { name: 'Password recovery', level: 1 });
    this.emailInput     = page.getByRole('textbox', { name: 'Your email address:' });
    this.recoverButton  = page.getByRole('button', { name: 'Recover' });
    this.successMessage = page.getByText(/email with instructions has been sent/i); // uncertain: exact text
    this.errorMessage   = page.locator('.message-error, .field-validation-error').first(); // uncertain: selector
    this.loginLink      = page.getByRole('link', { name: 'Log in' });
  }
}
