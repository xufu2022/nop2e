import { _ContactUsPage } from './_ContactUsPage';
import { routes } from '../../fixtures/routes';

export class ContactUsPage extends _ContactUsPage {
  async navigate(): Promise<void> {
    await this.goto(routes.public.contactUs);
  }

  async fillAndSubmit(name: string, email: string, enquiry: string): Promise<void> {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.enquiryInput.fill(enquiry);
    await this.submitButton.click();
  }
}
