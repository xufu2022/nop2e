import { Page, Locator } from '@playwright/test';
import { PublicLayoutPage } from './PublicLayoutPage';

export class _ContactUsPage extends PublicLayoutPage {
  readonly heading: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly enquiryInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.heading        = page.getByRole('heading', { name: 'Contact Us', level: 1 });
    this.nameInput      = page.getByRole('textbox', { name: 'Your name:' });
    this.emailInput     = page.getByRole('textbox', { name: 'Your email:' });
    this.enquiryInput   = page.getByRole('textbox', { name: 'Enquiry:' });
    this.submitButton   = page.getByRole('button', { name: 'Submit' });
    this.successMessage = page.getByText(/your enquiry has been successfully sent/i); // uncertain: exact text
  }
}
