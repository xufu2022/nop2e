import { Locator } from '@playwright/test';
import { _RecentlyViewedPage } from './_RecentlyViewedPage';
import { routes } from '../../fixtures/routes';

export class RecentlyViewedPage extends _RecentlyViewedPage {
  async navigate(): Promise<void> {
    await this.goto(routes.public.recentlyViewed);
  }

  productCard(name: string): Locator {
    return this.productCards.filter({ hasText: name });
  }

  productLink(name: string): Locator {
    return this.productCard(name).getByRole('link', { name });
  }
}
