import { Page, Locator } from '@playwright/test';
import { PublicLayoutPage } from './PublicLayoutPage';

export class _HomePage extends PublicLayoutPage {
  readonly administrationLink: Locator;
  readonly logOutLink: Locator;
  readonly logInLink: Locator;
  readonly registerLink: Locator;
  readonly welcomeHeading: Locator;
  readonly featuredProductsHeading: Locator;
  readonly featuredProductArticles: Locator;
  readonly addToWishlistButtons: Locator;
  readonly newsletterEmailInput: Locator;
  readonly newsletterSubscribeButton: Locator;
  readonly newsletterResultBlock: Locator;
  readonly newsletterSubscribeBlock: Locator;

  constructor(page: Page) {
    super(page);
    this.administrationLink        = page.getByRole('link', { name: 'Administration' });
    this.logOutLink                = page.getByRole('link', { name: 'Log out' });
    this.logInLink                 = page.getByRole('link', { name: 'Log in' });
    this.registerLink              = page.getByRole('link', { name: 'Register' });
    this.welcomeHeading            = page.getByRole('heading', { name: 'Welcome to our store' });
    this.featuredProductsHeading   = page.getByRole('heading', { name: 'Featured products' });
    this.addToWishlistButtons      = page.getByRole('button', { name: 'Add to wishlist' });
    this.featuredProductArticles   = page.locator('article').filter({
      has: page.getByRole('button', { name: 'Add to wishlist' }),
    });
    this.newsletterEmailInput      = page.getByRole('textbox', { name: 'Sign up for our newsletter' });
    this.newsletterSubscribeButton = page.getByRole('button', { name: 'Subscribe' });
    this.newsletterResultBlock     = page.locator('#newsletter-result-block');
    this.newsletterSubscribeBlock  = page.locator('#newsletter-subscribe-block');
  }
}
