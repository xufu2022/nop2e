import { Page, Locator } from '@playwright/test';
import { PublicLayoutPage } from './PublicLayoutPage';

export class _RecentlyViewedPage extends PublicLayoutPage {
  readonly heading: Locator;
  readonly productCards: Locator;
  readonly noProductsMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Recently viewed products', level: 1 });
    this.productCards = page.getByRole('article');
    this.noProductsMessage = page.getByText('You have not recently viewed any products');
  }
}
