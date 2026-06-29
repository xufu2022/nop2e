import { _CategoryBrowsePage } from './_CategoryBrowsePage';

export class CategoryBrowsePage extends _CategoryBrowsePage {
  async navigate(path: string): Promise<void> {
    await this.goto(path);
  }

  async sortBy(option: string): Promise<void> {
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      this.sortBySelect.selectOption(option),
    ]);
  }

  async setPerPage(count: string): Promise<void> {
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      this.perPageSelect.selectOption(count),
    ]);
  }

  async clickFirstProduct(): Promise<void> {
    await this.productItems.first().getByRole('heading', { level: 2 }).getByRole('link').click();
  }
}
