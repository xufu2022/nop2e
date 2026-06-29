import { Page, Locator } from '@playwright/test';

export class Footer {
  readonly page: Page;
  readonly newsletter: Locator;
  readonly newsletterEmail: Locator;
  readonly newsletterSubmit: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newsletter = page.locator('#newsletter-email, .newsletter-subscribe');
    this.newsletterEmail = page.locator('#newsletter-email');
    this.newsletterSubmit = page.locator('#newsletter-subscribe-button');
  }

  async subscribeNewsletter(email: string): Promise<void> {
    await this.newsletterEmail.fill(email);
    await this.newsletterSubmit.click();
  }

  async getFooterLinks(): Promise<string[]> {
    const links = this.page.locator('footer a');
    return links.allTextContents();
  }
}
