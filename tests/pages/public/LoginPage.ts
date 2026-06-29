import { _LoginPage } from './_LoginPage';
import { routes } from '../../fixtures/routes';

export class LoginPage extends _LoginPage {
  async navigate(): Promise<void> {
    await this.goto(routes.public.login);
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
