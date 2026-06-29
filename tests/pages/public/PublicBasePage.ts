import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';
import { routes } from '../../fixtures/routes';
import { getCredentials } from '../../fixtures/role-config';

export class PublicBasePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async login(username?: string, password?: string): Promise<void> {
    const creds = getCredentials('buyer');
    const user = username ?? creds.username;
    const pass = password ?? creds.password;

    await this.goto(routes.public.login);
    await this.page.getByRole('textbox', { name: 'Email:' }).fill(user);
    await this.page.getByRole('textbox', { name: 'Password:' }).fill(pass);
    await this.page.getByRole('button', { name: 'Log in' }).click();
    await expect(this.page).not.toHaveURL(/login/);
  }

  async logout(): Promise<void> {
    await this.page.getByRole('link', { name: 'Log out' }).click();
  }
}
