import { Page, Locator } from '@playwright/test';
import { AdminBasePage } from './AdminBasePage';

export class _AdminGiftCardListPage extends AdminBasePage {
  readonly heading: Locator;
  readonly searchCouponCode: Locator;
  readonly searchRecipientName: Locator;
  readonly activatedFilter: Locator;
  readonly searchButton: Locator;
  readonly grid: Locator;

  constructor(page: Page) {
    super(page);
    this.heading              = page.getByRole('heading', { name: 'Gift cards', level: 1 });
    this.searchCouponCode     = page.getByRole('textbox', { name: 'Gift card coupon code' });
    this.searchRecipientName  = page.getByRole('textbox', { name: 'Recipient name' });
    this.activatedFilter      = page.locator('#SearchActivatedId'); // uncertain — Kendo-wrapped select
    this.searchButton         = page.getByRole('button', { name: 'Search' });
    this.grid                 = page.locator('#gift-cards-grid'); // uncertain — verify grid element ID
  }
}
