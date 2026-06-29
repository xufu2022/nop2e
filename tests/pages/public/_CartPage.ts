import { Page, Locator } from '@playwright/test';
import { PublicLayoutPage } from './PublicLayoutPage';

export class _CartPage extends PublicLayoutPage {
  readonly heading: Locator;
  readonly emptyCartMessage: Locator;
  readonly quantityInput: Locator;
  readonly removeButton: Locator;
  readonly subTotalRow: Locator;

  constructor(page: Page) {
    super(page);
    this.heading          = page.getByRole('heading', { name: 'Shopping cart', level: 1 });
    this.emptyCartMessage = page.getByText('Your Shopping Cart is empty!');
    this.quantityInput    = page.getByRole('textbox', { name: 'Qty.' });
    this.removeButton     = page.getByRole('button', { name: 'Remove' });
    this.subTotalRow      = page.getByRole('row', { name: /Sub-Total/ });
  }
}
