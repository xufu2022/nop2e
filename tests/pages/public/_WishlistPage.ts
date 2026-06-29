import { Page, Locator } from '@playwright/test';
import { PublicLayoutPage } from './PublicLayoutPage';

export class _WishlistPage extends PublicLayoutPage {
  readonly heading: Locator;
  readonly emptyMessage: Locator;
  readonly wishlistRows: Locator;
  readonly updateWishlistButton: Locator;
  readonly addToCartButton: Locator;
  readonly wishlistQty: Locator;

  constructor(page: Page) {
    super(page);
    this.heading              = page.getByRole('heading', { name: 'Wishlist', level: 1 });
    this.emptyMessage         = page.getByText('The wishlist is empty!');
    this.wishlistRows         = page.getByRole('row').filter({ has: page.getByRole('button', { name: 'Remove' }) });
    this.updateWishlistButton = page.getByRole('button', { name: 'Update wishlist' });
    this.addToCartButton      = page.getByRole('button', { name: 'Add to cart' });
    this.wishlistQty          = page.locator('.wishlist-qty');
  }
}
