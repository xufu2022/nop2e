import { _RegistrationPage } from './_RegistrationPage';
import { routes } from '../../fixtures/routes';

export class RegistrationPage extends _RegistrationPage {
  async navigate(): Promise<void> {
    await this.goto(routes.public.register);
  }

  async register(firstName: string, lastName: string, email: string, password: string, confirmPassword = password): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
    await Promise.all([
      this.page.waitForResponse(resp => resp.url().includes('/register') && resp.request().method() === 'POST'),
      this.registerButton.click(),
    ]);
  }

  async clickRegister(): Promise<void> {
    await this.registerButton.click();
  }
}
