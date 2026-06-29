import { Page } from '@playwright/test';
import { PublicBasePage } from './PublicBasePage';
import { Header } from '../components/header';
import { Footer } from '../components/footer';

export class PublicLayoutPage extends PublicBasePage {
  readonly header: Header;
  readonly footer: Footer;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.footer = new Footer(page);
  }
}
