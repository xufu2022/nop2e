import { _PasswordRecoveryPage } from './_PasswordRecoveryPage';
import { routes } from '../../fixtures/routes';

export class PasswordRecoveryPage extends _PasswordRecoveryPage {
  async navigate(): Promise<void> {
    await this.goto(routes.public.passwordRecovery);
  }

  async requestRecovery(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.recoverButton.click();
  }
}
