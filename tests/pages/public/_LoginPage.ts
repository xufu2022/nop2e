import { Page, Locator } from '@playwright/test';
import { PublicLayoutPage } from './PublicLayoutPage';

export class _LoginPage extends PublicLayoutPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput         = page.getByRole('textbox', { name: 'Email:' });
    this.passwordInput      = page.getByRole('textbox', { name: 'Password:' });
    this.loginButton        = page.getByRole('button', { name: 'Log in' });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot password?' });
    this.errorMessage       = page.locator('.message-error');
  }
}
