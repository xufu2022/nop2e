import { Page } from '@playwright/test';
import { AdminBasePage } from './AdminBasePage';
import { AdminLeftMenu } from './components/AdminLeftMenu';
import { AdminTopMenu } from './components/AdminTopMenu';

export class AdminLayoutPage extends AdminBasePage {
  readonly leftMenu: AdminLeftMenu;
  readonly topMenu: AdminTopMenu;

  constructor(page: Page) {
    super(page);
    this.leftMenu = new AdminLeftMenu(page);
    this.topMenu = new AdminTopMenu(page);
  }
}
