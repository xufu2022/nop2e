import { _HomePage } from './_HomePage';
import { routes } from '../../fixtures/routes';

export class HomePage extends _HomePage {
  async navigate(): Promise<void> {
    await this.goto(routes.public.home);
  }

  async logout(): Promise<void> {
    await this.logOutLink.click();
  }
}
