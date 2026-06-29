import { Page, Locator } from '@playwright/test';
import { PublicLayoutPage } from './PublicLayoutPage';

export class _ProductPage extends PublicLayoutPage {
  readonly addToCartButton: Locator;
  readonly quantityInput: Locator;
  readonly cartCountLink: Locator;
  readonly reviewCountLink: Locator;
  readonly addReviewLink: Locator;
  readonly existingReviewsHeading: Locator;
  readonly onlyRegisteredUsersMessage: Locator;
  readonly writeReviewHeading: Locator;
  readonly reviewTitleInput: Locator;
  readonly reviewTextInput: Locator;
  readonly submitReviewButton: Locator;
  readonly addToWishlistButton: Locator;
  readonly reviewSuccessMessage: Locator;

  constructor(page: Page) {
    super(page);
    // .first() selects the main product button, not related-product buttons below
    this.addToCartButton            = page.getByRole('button', { name: 'Add to cart' }).first();
    this.addToWishlistButton        = page.getByRole('button', { name: 'Add to wishlist' }).first();
    this.quantityInput              = page.getByLabel('Enter a quantity');
    this.cartCountLink              = page.getByRole('link', { name: /Shopping cart/ });
    this.reviewCountLink            = page.getByRole('link', { name: /\d+ review\(s\)/ });
    this.addReviewLink              = page.getByRole('link', { name: 'Add your review' });
    this.existingReviewsHeading     = page.getByRole('heading', { name: 'Existing reviews' });
    this.onlyRegisteredUsersMessage = page.getByText('Only registered users can write reviews');
    this.writeReviewHeading         = page.getByRole('heading', { name: 'Write your own review' });
    this.reviewTitleInput           = page.getByRole('textbox', { name: 'Review title:' });
    this.reviewTextInput            = page.getByRole('textbox', { name: 'Review text:' });
    this.submitReviewButton         = page.getByRole('button', { name: 'Submit review' });
    this.reviewSuccessMessage       = page.getByText(/product review is successfully added/i);
  }
}
