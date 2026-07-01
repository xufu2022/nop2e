# POM Templates — nopCommerce

Project-specific configuration for `/generate-tests`.
Read by the skill at Step 1 alongside `.env`.

---

## Base class by role

| Role | Extends | When |
|---|---|---|
| `admin` page | `AdminBasePage` | standard admin page |
| `public` / `buyer` page | `PublicLayoutPage` | public-facing page |
| admin component (`components/`) | `BasePage` | header/nav/footer component |

## Import depth — base class

```
tests/pages/admin/_Foo.ts             → import { AdminBasePage }   from './AdminBasePage'
tests/pages/admin/components/_Foo.ts  → import { BasePage }        from '../../BasePage'
tests/pages/public/_Foo.ts            → import { PublicLayoutPage } from './PublicLayoutPage'
```

## Import depth — routes

```
tests/pages/admin/<Name>.ts            → import { routes } from '../../fixtures/routes'
tests/pages/admin/components/<Name>.ts → import { routes } from '../../../fixtures/routes'
tests/pages/public/<Name>.ts           → import { routes } from '../../fixtures/routes'
```

## Import depth — spec files

```
tests/specs/foo.spec.ts          → import { test, expect } from '../fixtures'
tests/specs/admin/foo.spec.ts    → import { test, expect } from '../../fixtures'
tests/specs/public/foo.spec.ts   → import { test, expect } from '../../fixtures'
```

---

## Base file template (`_<Name>.ts`) — always overwrite

```typescript
import { Page, Locator } from '@playwright/test';
import { AdminBasePage } from './AdminBasePage'; // swap per base class table above

export class _AdminProductListPage extends AdminBasePage {
  readonly heading: Locator;
  readonly searchBox: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading      = page.getByRole('heading', { name: 'Products', level: 1 });
    this.searchBox    = page.getByRole('textbox', { name: 'Product name' });
    this.searchButton = page.getByRole('button',  { name: 'Search' });
  }
}
```

## Extension file template (`<Name>.ts`) — write only if not on disk

```typescript
import { Locator } from '@playwright/test';
import { _AdminProductListPage } from './_AdminProductListPage';
import { routes } from '../../fixtures/routes'; // adjust depth per table above

export class AdminProductListPage extends _AdminProductListPage {
  async navigate(): Promise<void> {
    await this.goto(routes.admin.products);
  }

  async searchByName(name: string): Promise<void> {
    await this.searchBox.fill(name);
    await Promise.all([
      this.page.waitForResponse(
        resp => resp.url().includes('/Admin/Product/ProductList') && resp.request().method() === 'POST'
      ),
      this.searchButton.click(),
    ]);
  }

  rowFor(name: string): Locator {
    return this.page.getByRole('row').filter({ hasText: name });
  }
}
```

## Spec file template

```typescript
import { test, expect } from '../../fixtures'; // adjust depth per table above
import { AdminProductListPage } from '../../pages/admin/AdminProductListPage';

// Add ONLY when bypassing project storageState (guest or login-flow tests):
// test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Product Management', () => {
  test('admin can view the product list', async ({ authenticatedAdmin }) => {
    const listPage = new AdminProductListPage(authenticatedAdmin.page);
    await listPage.navigate();
    await expect(listPage.heading).toBeVisible();
  });
});
```

## Auth fixtures

| Context | Fixture | When |
|---|---|---|
| Admin (storageState pre-loaded) | `{ authenticatedAdmin }` | default for admin specs |
| Buyer / guest (explicit login) | `{ page }` + `publicPage.login()` in `beforeEach` | buyer or mixed-auth specs |
| Login-flow test | `{ page }` + `test.use({ storageState: { cookies: [], origins: [] } })` | testing the login UI itself |

---

## Known routes

```
Admin:
  /Admin                      /Admin/Product/List        /Admin/Product/Create
  /Admin/Category/List        /Admin/Order/List          /Admin/Customer/List
  /Admin/Manufacturer/List    /Admin/Customer/Create

Public:
  /    /login    /register    /cart    /wishlist    /checkout    /search
```

Convention for unlisted pages: `/Admin/{Entity}/{Action}` (e.g. `/Admin/Discount/List`).

---

## Faker field-mapping table (Step 5b)

Used by `/generate-tests` to map form field labels to faker calls when auto-generating factories.

| Field signal (label / placeholder / name) | Faker call |
|---|---|
| first name | `faker.person.firstName()` |
| last name | `faker.person.lastName()` |
| full name, name | `faker.person.fullName()` |
| email | `` faker.internet.email({ provider: `${Date.now()}.test` }) `` |
| phone, mobile | `faker.phone.number()` |
| password | `'Password123!'` — static, must meet site rules |
| price, amount, cost | `parseFloat(faker.commerce.price({ min: 10, max: 500 }))` |
| product name, title | `faker.commerce.productName()` |
| sku, code, reference | `` `REF-${faker.string.alphanumeric(8).toUpperCase()}` `` |
| description, notes, message, enquiry, body, text | `faker.lorem.sentences(2)` |
| status, state (dropdown) | `faker.helpers.arrayElement([...observed options])` |
| quantity, count | `faker.number.int({ min: 1, max: 10 })` |
| date | `faker.date.future().toISOString().split('T')[0]` |
| url, website | `faker.internet.url()` |
| company, organisation | `faker.company.name()` |
| city | `faker.location.city()` |
| address, street | `faker.location.streetAddress()` |
| zip, postal code | `faker.location.zipCode()` |
| country | `faker.location.country()` |
| any other text field | `faker.lorem.word()` |

Factory template:
```ts
import { faker } from '@faker-js/faker';

export const fake{Entity} = () => ({
  // one property per discovered form field
});
```

---

## Project-specific wait notes

- **`waitForNetworkIdle()` — do not call in action methods.** This app has persistent
  background connections; networkidle may never arrive. Use `waitForResponse` or
  `waitForNavigation` instead (see wait strategy table in `generate-tests.md` Step 5).
- **AJAX grid endpoints** follow the pattern `/Admin/{Entity}/{Entity}List` for POST requests.
- **Public cart/wishlist** AJAX hits `/addproducttocart/details/{id}/{type}` (details page)
  or `/addproducttocart/catalog/{id}/{type}/1` (category listing).
