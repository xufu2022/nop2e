# Playwright Best Practices — nopCommerce E2E Suite

A lifecycle-based guide to writing maintainable, reliable Playwright tests.
Each stage maps to a concrete moment in the workflow, explains the best practice,
and notes what this repo already does vs. what could be added.

---

## Table of Contents

1. [Define What to Test](#1-define-what-to-test)
2. [Explore the Page](#2-explore-the-page)
3. [Model the Page (POM)](#3-model-the-page-pom)
4. [Write the Test](#4-write-the-test)
5. [Manage Test Data](#5-manage-test-data)
6. [Handle Failures](#6-handle-failures)
7. [Run in CI](#7-run-in-ci)
8. [AI-Assisted Workflow](#8-ai-assisted-workflow)

---

## 1. Define What to Test

### The principle: specs are the source of truth

Before writing a single line of test code, write a spec — a plain-language description
of what the user can do and what they should see. This is the single most important
decision in a test suite's architecture.

**Why this matters:**

Tests written directly from looking at UI tend to test *how the UI is built* rather than
*what the user can do*. When the UI changes — a button moves, a class name changes,
a field gets a new wrapper div — tests break even though the feature is fine.
Specs anchor you to user-visible behaviour, not implementation details.

```
docs/specs/admin/product-management.md   ← edit here
        │
        ▼
tests/specs/admin/product-management.spec.ts   ← generated, do not edit directly
```

### Spec file format

Required fields:
1. `role: admin | buyer | public` — determines auth context and output folder
2. At least one bullet (`- description`) — each bullet becomes one `test()`

`url:` — required for non-nopCommerce sites, optional for nopCommerce:
- Provide the base path: `url: /orders`
- The skill derives sub-pages from bullet text (`/orders/new`, `/orders/:id`, etc.)
- For nopCommerce, omit it — the skill uses the built-in route table and `/Admin/{Entity}/{Action}` convention

All of these are valid:

```markdown
# nopCommerce — url inferred from known routes
# Product Management
role: admin
- Admin can view the product list
- Admin can create a product — saved, redirected to list
- Admin can search by name — only matching products shown
- Admin can edit a product name — updated name visible in list
- Admin can delete a product — confirm dialog, product removed
```

```markdown
# Non-nopCommerce — url required
# Order Management
role: admin
url: /orders
- Admin can view the order list — list loads
- Admin can create an order — saved and redirected to list
- Admin can cancel an order — status updated to Cancelled
```

```markdown
# With frontmatter (optional metadata)
---
role: admin
url: /orders
---
# Order Management
- Admin can view the order list — list loads
- Admin can cancel an order — status updated to Cancelled
```

**Each bullet becomes one test.** Writing `action — expected outcome` is strongly
recommended: it forces you to name both the action AND the observable result, which
maps directly to a Playwright assertion. It is not strictly required.

### What belongs in a spec bullet

| Good bullet | Why |
|---|---|
| `Admin can delete a product — product removed from list` | Observable outcome, user perspective |
| `User can add to cart — cart count increases by 1` | Measurable assertion |
| `Login with wrong password — error message shown` | Edge case with visible result |

| Bad bullet | Why |
|---|---|
| `Cart API returns 200` | Tests implementation, not user experience |
| `Database row is inserted` | Not user-visible |
| `Spinner appears then disappears` | Intermediate state, not the outcome |

### Role values and what they control

```
role: admin   →  uses AdminBasePage + admin storageState (already authenticated)
role: buyer   →  uses PublicBasePage + buyer storageState (logged in as buyer)
role: public  →  uses PublicBasePage + no auth (anonymous visitor)
```

Getting the role wrong means your tests run in the wrong auth context — silently
passing because admin happens to be logged in from the project config.

### Already in this repo
- `docs/specs/` directory with one markdown file per feature
- Frontmatter (`name`, `description`, `role`) driving generation
- Spec bullets mapping 1:1 to generated test cases

### Could be added
- **Tags** (`@smoke`, `@regression`, `@slow`) in spec bullets to enable filtered runs
- **Priority** field in frontmatter to guide which specs run first in CI

---

## 2. Explore the Page

### The principle: use the accessibility tree, not raw HTML

When writing selectors, the instinct is to inspect the DOM and copy a CSS class or XPath.
This is the most common source of brittle tests.

**Why the accessibility tree is better:**

The accessibility tree is how assistive technologies (screen readers) and Playwright
both see the page. It exposes *semantic meaning* — "this is a button labelled Add to Cart"
— rather than structural accident — "this is a `div.btn.btn-primary` inside a `.product-box`".

- CSS classes change when designers restyle the page
- XPath breaks when markup is reorganised
- ARIA roles and labels change only when the feature itself changes

### Selector priority (highest to lowest resilience)

```
1. page.getByRole('button', { name: 'Add to cart' })
      ↳ Best. Matches by ARIA role + accessible name. Survives HTML restructuring.

2. page.getByLabel('Email address')
      ↳ Matches the input associated with a <label>. Resilient to input type changes.

3. page.getByPlaceholder('Search products...')
      ↳ Good for inputs without labels. Survives class/id changes.

4. page.getByText('Welcome to our store')
      ↳ Exact text match. Brittle if copy changes, but fine for headings/messages.

5. page.locator('[data-testid="cart-count"]')
      ↳ Stable if your team owns the app and can add test IDs. Zero in nopCommerce
        since it's a third-party app — avoid unless you fork the source.

6. page.locator('#checkout-button')
      ↳ Acceptable for stable IDs nopCommerce assigns. Check they don't change
        across versions.

7. page.locator('.shopping-cart-link')          ← fragile
8. page.locator('div > ul > li:nth-child(2)')   ← very fragile — avoid
```

### Why nopCommerce makes selectors harder

nopCommerce is a third-party app — you cannot add `data-testid` attributes without
forking it. This makes the accessibility tree your primary tool:

- Use `browser_snapshot` (MCP) to see the accessibility tree before writing any selector
- Prefer role + name combinations — nopCommerce generally has good ARIA labels on
  interactive elements
- When a selector must use CSS, choose IDs over classes, and check whether the ID
  is dynamically generated (e.g., `product-12345`) vs. stable (e.g., `AddToCart`)

### Already in this repo
- MCP `browser_snapshot` used during generation (accessibility tree, never raw HTML)
- Selectors in POMs extracted using role/label/placeholder priority

### Could be added
- A `selectors.md` cheat-sheet for commonly-used nopCommerce elements
- Linting rule to flag `locator('.')` (CSS class) selectors in PRs

---

## 3. Model the Page (POM)

### The principle: one class per page, locators separate from actions

The Page Object Model wraps a page's selectors and actions behind a typed interface.
Tests never call `page.locator(...)` directly — they call `cartPage.removeButton`.

**Why POM over raw Playwright calls in tests:**

- A selector used in 10 tests is written once in the POM. When nopCommerce changes
  the markup, you fix one line, not 10 tests.
- POMs make tests read like specifications: `await cartPage.removeItem()` rather than
  `await page.locator('.remove-btn').first().click()`.
- Type safety: TypeScript catches typos in method names at compile time, not at runtime.

### The `_Generated / manual` split

This repo splits every POM into two files:

```
tests/pages/admin/
  _AdminProductListPage.ts    ← GENERATED — locators only, overwritten on every regen
   AdminProductListPage.ts    ← MANUAL — navigate() + action methods, written once
```

**Why two files instead of one?**

When the nopCommerce UI changes, you re-run `/generate-tests` and the `_*.ts` file
is regenerated with fresh selectors. Your manually-written action methods in
`AdminProductListPage.ts` survive untouched because they live in the other file.

If everything were in one file, regeneration would destroy your action methods.
If everything were manual, selector updates would be slow and error-prone.

```
_AdminProductListPage.ts (generated)
─────────────────────────────────────
import { Page, Locator } from '@playwright/test';
import { AdminBasePage } from './AdminBasePage';

export class _AdminProductListPage extends AdminBasePage {
  readonly heading:   Locator;
  readonly searchBox: Locator;
  readonly addButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading   = page.getByRole('heading', { name: 'Products', level: 1 });
    this.searchBox = page.getByRole('textbox', { name: 'Product name' });
    this.addButton = page.getByRole('link',    { name: 'Add new' });
  }
}

AdminProductListPage.ts (manual)
─────────────────────────────────
import { _AdminProductListPage } from './_AdminProductListPage';
import { routes } from '../../fixtures/routes';

export class AdminProductListPage extends _AdminProductListPage {
  async navigate() { await this.page.goto(routes.admin.products); }
  async searchByName(name: string) {
    await this.searchBox.fill(name);
    await this.page.getByRole('button', { name: 'Search' }).click();
  }
}
```

### Why locators are `readonly` properties, not methods

```ts
// Good — readonly property
readonly heading = this.page.getByRole('heading', { name: 'Products' });

// Bad — method
getHeading() { return this.page.getByRole('heading', { name: 'Products' }); }
```

Playwright `Locator` objects are lazy — they do not query the DOM when you create them.
The query only runs when you call `.click()`, `.fill()`, or `expect()` on them.
Storing them as properties is cheaper, simpler, and makes them composable with `expect()`.

### Why `navigate()` uses route constants

```ts
// Good
async navigate() { await this.page.goto(routes.admin.products); }

// Bad
async navigate() { await this.page.goto('/Admin/Product/List'); }
```

If nopCommerce changes a URL (e.g., after an upgrade), you fix `routes.ts` once.
Hardcoded strings scatter across every POM and test that references that URL.

### Inheritance hierarchy

```
BasePage
  — goto(path), getTitle(), waitForNetworkIdle(), takeScreenshot()
  │
  ├── AdminBasePage
  │     — login(), logout(), navigateToDashboard()
  │     └── AdminProductListPage, AdminOrderListPage, etc.
  │
  └── PublicBasePage
        — login(), logout()
        └── PublicLayoutPage
              — header: Header, footer: Footer
              └── HomePage, CartPage, ProductPage, etc.
```

**Why base classes hold login/logout instead of tests:**

Login is infrastructure, not a test case. Putting it in a base class means:
- Tests that need auth just inherit it — no copy-paste
- If nopCommerce changes the login form, you fix one method in one class

### Already in this repo
- Full `_Generated / manual` split for every POM
- `readonly` locator properties
- `navigate()` using `routes` constants
- Proper inheritance hierarchy

### Could be added
- **Shared component POMs** — e.g., a `Pagination` POM reused by product list, order list, customer list
- **Fluent builder pattern** for forms with many optional fields (e.g., product create with 20+ fields)

---

## 4. Write the Test

### The principle: tests describe behaviour, fixtures provide context

A well-written Playwright test has three parts:
1. **Arrange** — navigate to the page, set up state
2. **Act** — perform the user action
3. **Assert** — verify the observable outcome

```ts
test('admin can search products by name — only matching products shown', async ({ authenticatedAdmin }) => {
  // Arrange
  const listPage = new AdminProductListPage(authenticatedAdmin.page);
  await listPage.navigate();

  // Act
  await listPage.searchByName('Build your own computer');

  // Assert
  await expect(listPage.rowFor('Build your own computer')).toBeVisible();
});
```

### Always import from `tests/fixtures/index.ts`

```ts
// Correct
import { test, expect } from '../../fixtures';

// Wrong — bypasses custom fixtures and timeouts
import { test, expect } from '@playwright/test';
```

Custom fixtures wire up POMs and timeouts. Importing from `@playwright/test` directly
gives you a bare `test` with none of that context.

### Use auto-retry assertions, never manual waits

```ts
// Good — auto-retries up to expect.timeout (15s here)
await expect(listPage.heading).toBeVisible();
await expect(page).toHaveURL(/\/Admin\/Product\/List/);

// Bad — flaky, arbitrary delay
await page.waitForTimeout(2000);
expect(await listPage.heading.isVisible()).toBe(true);
```

Playwright's `expect()` assertions poll automatically until the condition is met or
the timeout expires. `waitForTimeout` is a fixed sleep — too short and the test is
flaky, too long and the suite is slow.

`isVisible()` (the non-`expect` version) returns the state *right now* with no retry.
Combined with a hard wait, it misses the window when the element appears.

### Test isolation: each test must be independently runnable

```ts
// Good — test sets up its own state
test('admin can edit a product name', async ({ authenticatedAdmin }) => {
  const listPage = new AdminProductListPage(authenticatedAdmin.page);
  await listPage.navigate();
  await listPage.searchByName('HTC Smartphone');
  await listPage.clickEdit('HTC Smartphone');
  // ...
});

// Bad — depends on a previous test having run first
test('admin can edit product name', async ({ authenticatedAdmin }) => {
  // Assumes "admin can search products" already ran and left the page in a certain state
  await editPage.fillName('New Name');
});
```

Playwright runs tests in parallel by default. A test that depends on prior test state
will pass locally (if run in order) and fail in CI (parallel execution, random order).

### Naming convention: `role can action — expected outcome`

```ts
test('admin can delete a product — product removed from list', ...)
test('user can add a product to cart — cart count increases by 1', ...)
test('login with wrong password — error message is shown', ...)
```

This format comes directly from the spec bullet. It means:
- The test name is the spec requirement — if the test fails, you know exactly what regressed
- Reports are readable without opening the code
- One test name = one spec bullet = one assertion

### One `test.describe` per feature, one `test()` per bullet

```ts
test.describe('Product Management', () => {
  test('admin can view the product list', ...)
  test('admin can create a product', ...)
  test('admin can search by name', ...)
});
```

Grouping under one `describe` keeps reports organised and allows `--grep "Product Management"`
to run just that feature.

Avoid deeply nested `describe` blocks — they make test names verbose and reports hard to read.

### Waiting after actions — two patterns, never `waitForNetworkIdle`

nopCommerce has persistent background connections (polling, analytics). `waitForNetworkIdle()`
(i.e., `waitForLoadState('networkidle')`) waits until no network requests for 500ms — a
condition that may never arrive, causing tests to time out or run very slowly.

**Do not call `waitForNetworkIdle()` in action methods.** Use one of these two patterns instead:

#### Pattern 1 — Page navigation (URL changes after the action)

Applies to: save buttons, "View" links, form submissions that redirect.

```typescript
// sortBy, setPerPage, save, clickView — anything that navigates to a new URL
async clickSave(): Promise<void> {
  await Promise.all([
    this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    this.saveButton.click(),
  ]);
}
```

`waitUntil: 'domcontentloaded'` matches the strategy used in `BasePage.goto()` and resolves
as soon as the new page's DOM is parsed — without waiting for slow third-party scripts.

#### Pattern 2 — AJAX / grid refresh (page URL stays the same)

Applies to: search buttons, filter dropdowns, delete with grid reload (nopCommerce admin Kendo Grid).

```typescript
// searchByName, filterByStatus, deleteProduct — AJAX updates the grid in place
async searchByName(name: string): Promise<void> {
  await this.productNameSearch.fill(name);
  await Promise.all([
    this.page.waitForResponse(
      resp => resp.url().includes('/Admin/Product/ProductList') && resp.request().method() === 'POST'
    ),
    this.searchButton.click(),
  ]);
}
```

The URL fragment matches the nopCommerce admin Kendo Grid data endpoint for that entity.
Common patterns:

| Entity | AJAX endpoint |
|---|---|
| Products | `/Admin/Product/ProductList` |
| Orders | `/Admin/Order/OrderList` |
| Customers | `/Admin/Customer/CustomerList` |
| Categories | `/Admin/Category/CategoryList` |

#### Pattern 3 — Uncertain (action may navigate OR stay)

When you cannot confirm at write time whether the action causes a URL change
(common for form submits that POST and may redirect, or AJAX endpoints that
conditionally navigate):

```typescript
// waitForResponse works whether or not the page navigates afterwards
async addAllToCart(): Promise<void> {
  await Promise.all([
    this.page.waitForResponse(
      resp => resp.url().includes('/wishlist') && resp.request().method() === 'POST'
    ),
    this.addToCartButton.click(),
  ]);
}
```

`waitForResponse` resolves as soon as the matching response arrives, regardless
of whether the browser then navigates or stays on the same URL.
`waitForNavigation` resolves only if a URL change occurs — if the action turns
out to be AJAX-only, `waitForNavigation` will timeout after the action succeeds.

**Decision rule:**

| What happens | Use |
|---|---|
| URL definitely changes | `waitForNavigation` |
| URL definitely stays | `waitForResponse` |
| Not sure | `waitForResponse` — safe either way |

#### `BasePage.goto()` — always use `domcontentloaded`

`goto()` already uses `{ waitUntil: 'domcontentloaded' }` — do not override this.
nopCommerce loads third-party scripts that keep the network active well past when the
page is usable; waiting for `load` or `networkidle` adds several seconds per navigation.

```typescript
// BasePage.ts — already correct, do not change
async goto(path: string): Promise<void> {
  await this.page.goto(path, { waitUntil: 'domcontentloaded' });
}
```

### `expect.soft()` for non-blocking assertions

When a test should collect multiple failures before stopping rather than aborting on
the first:

```ts
test('product page shows all details', async ({ authenticatedAdmin }) => {
  // Arrange + Act
  const detailPage = new AdminProductDetailPage(authenticatedAdmin.page);
  await detailPage.navigate('HTC Smartphone');

  // Assert — all checked, test reports every failure not just the first
  await expect.soft(detailPage.heading).toBeVisible();
  await expect.soft(detailPage.skuField).toHaveValue('SMARTPHONE_HTX');
  await expect.soft(detailPage.priceField).toHaveValue('100');
  expect(test.info().errors).toHaveLength(0);
});
```

Keep regular `expect()` (hard-stop) for assertions where later steps would be
meaningless if the first fails (e.g., asserting a modal is open before filling it).

### Already in this repo
- Import from `tests/fixtures/index.ts` everywhere
- Auto-retry assertions used throughout
- `test.describe` per feature, `test()` per bullet
- Naming follows the spec bullet format

### Could be added
- **`test.beforeEach`** for navigation shared across all tests in a describe block
- **Tags** via `test.tag` for `@smoke` / `@regression` filtering
- **`test.step`** to label sections within a long test for better trace readability
- **`test.fixme()`** to mark known-broken tests without deleting them

---

## 5. Manage Test Data

### The principle: auth state is infrastructure, test data is a liability

The slowest and most fragile part of any E2E suite is setup that goes through the UI.
Every UI action is a network round trip, a render cycle, and a potential flake.

### storageState: login once, reuse everywhere

```
Without storageState:            With storageState:
────────────────────────         ─────────────────────────────
Test 1: login → test → done      admin.setup.ts: login → save admin.json
Test 2: login → test → done      Test 1: open browser (already authed) → test
Test 3: login → test → done      Test 2: open browser (already authed) → test
...                              Test 3: open browser (already authed) → test
30 tests × 3s login = 90s       30 tests × 0s login = 0s
```

`admin.setup.ts` runs once before the `chromium` project. It logs in via the UI and
saves cookies + local storage to `playwright/.auth/admin.json`. Every subsequent test
opens a new browser context pre-loaded with that session.

```
playwright.config.ts
  projects:
    - name: 'admin setup'
      testMatch: '**/auth/admin.setup.ts'

    - name: 'chromium'
      dependencies: ['admin setup']
      use:
        storageState: 'playwright/.auth/admin.json'
```

**Why not log in inside a `beforeEach`?**

`beforeEach` runs before *every* test. With 30 tests, that's 30 logins, 30 × ~3s = 90s
of dead time, plus 30 chances for the login to flake.

### Guest/public tests reset auth at the file level

```ts
// At the top of shopping-cart.spec.ts — clears the project-level admin storageState
test.use({ storageState: { cookies: [], origins: [] } });
```

This overrides the project-level `storageState` for every test in this file, giving
an anonymous browser context without modifying the shared `admin.json`.

### API setup for test data (not yet in this repo — recommended addition)

When a test needs a product to exist, a customer account, or an order to be in a
specific state, the safest approach is to create it via the nopCommerce API or
database before the test runs, then clean it up after.

```
UI setup (fragile):                  API setup (fast and reliable):
──────────────────                   ─────────────────────────────
1. Login as admin via browser        1. POST /api/products (request fixture)
2. Navigate to /Admin/Product/Create 2. Test runs with product already present
3. Fill 8 fields                     3. DELETE /api/products/{id} in afterEach
4. Save
5. Navigate back to test start
(~15s, 5 network requests, fragile)  (~200ms, 1 API call, stable)
```

nopCommerce's built-in REST API is very limited — most versions do not expose
product or customer creation endpoints without a third-party plugin. **Verify endpoint
availability for your nopCommerce version before investing in API fixtures.**
If the API is unavailable, prefer database seeding via a setup script over UI-driven
data creation. Use Playwright's `request` fixture for API calls when endpoints exist.

### Unique data helpers

```ts
// utils/helpers.ts
generateEmail()         // returns test_1719446400000@example.com
generateUniqueString()  // returns test_1719446400000
```

Tests that create data (a product, a customer, an order) must use unique values.
If two parallel test workers both try to create a product named "Test Product", one
will find it already exists — or they'll conflict on deletion.

Timestamp-based names are simple and readable in test reports.

### Already in this repo
- `admin.setup.ts` storageState pattern
- `generateEmail()` and `generateUniqueString()` in `utils/helpers.ts`
- Public tests clear storageState at file level

### Could be added
- **API fixtures** using Playwright's `request` context for fast test data setup
- **`afterEach` cleanup** to delete products/customers created during tests
- **`buyer.setup.ts`** + buyer project in `playwright.config.ts` for buyer-role tests

---

## 6. Handle Failures

### The principle: failures should tell you exactly what went wrong without re-running

A test that fails in CI and gives you no information is worse than no test at all —
it creates noise without signal.

### Three artefacts on failure

```
playwright.config.ts
  use:
    trace:      on-first-retry    ← full execution trace recorded on retry
    screenshot: only-on-failure   ← screenshot at the moment of failure
    video:      retain-on-failure ← full video kept only when test fails
```

**Trace** — the most valuable. Opens in Playwright Trace Viewer and shows every
action, every network request, every DOM snapshot at each step. Use it to replay
a failure exactly as it happened without re-running.

**Screenshot** — fastest to look at. Shows what the page looked like when the
assertion failed. Useful for "element not found" failures.

**Video** — most complete. Shows the full journey through the test. Useful when
the failure is in the sequence of actions, not just the final state.

### Retries and when they help (and when they don't)

```
playwright.config.ts
  retries: 2  // in CI only — 0 locally
```

Retries absorb genuine flakiness — a network blip, a slow animation, a race
condition on the nopCommerce server. They are not a substitute for fixing flaky tests.

**Signs a test is genuinely flaky (retry helps):**
- Fails 1 in 20 runs with "Timeout waiting for element"
- Fails only on CI (slower machine, different network)

**Signs a test has a real bug (retry hides it):**
- Fails every time on the same assertion
- Fails on a feature that recently changed

Set `forbidOnly: true` in CI to prevent `test.only` from accidentally running a
single test and hiding the rest. This is a common mistake on branches.

### Reading a failure

```
1. Open the HTML report:  npm run test:report
2. Find the failed test
3. Click "Trace" to open Trace Viewer
4. Step through actions to find the first unexpected state
5. Check the "Network" tab for failed API calls
6. Check the "Console" tab for JavaScript errors
```

### Local debugging

```bash
# Run with Playwright Inspector — pause on each action
npm run test:debug

# Run headed so you can see the browser
npm run test:headed

# Run a single test by title
npx playwright test -g "admin can delete a product"
```

### Already in this repo
- `trace: on-first-retry`, `screenshot: only-on-failure`, `video: retain-on-failure`
- `retries: 2` in CI, `0` locally
- `forbidOnly: true` in CI
- HTML report + JSON report

### Could be added
- **Custom failure messages** using `expect(locator, { message: 'Product row should appear after search' })`
- **`test.step()`** labels inside tests so traces show named steps instead of raw Playwright calls
- **Slack/Teams notification** on CI failure (via GitHub Actions `on: failure` job)

---

## 7. Run in CI

### The principle: CI must be deterministic and self-contained

A test suite that passes locally but fails in CI is worse than one that fails
everywhere — it erodes trust and slows down delivery.

### Workers: parallel locally, serial in CI

```
playwright.config.ts
  workers: process.env.CI ? 1 : undefined
```

`undefined` (local) → Playwright chooses based on CPU cores → tests run in parallel, fast.

`1` (CI) → tests run one at a time → slower but deterministic. nopCommerce is a shared
server in most setups; parallel writes (two tests creating a product simultaneously)
cause interference.

`fullyParallel: true` is already set in `playwright.config.ts` — tests within a file
run in parallel locally. The bottleneck in CI is `workers: 1`, not parallelism.
When you have a dedicated CI nopCommerce instance per run, increase `workers` beyond 1
to get true parallel speed.

### `forbidOnly` prevents silent test gaps

```
playwright.config.ts
  forbidOnly: !!process.env.CI
```

If a developer pushes `test.only(...)` to unblock locally, `forbidOnly` makes the CI
run fail immediately rather than silently running one test and reporting "all passed".

### Environment variables via GitHub Secrets

```yaml
# .github/workflows/playwright.yml
env:
  BASE_URL:         ${{ secrets.BASE_URL }}
  ADMIN_USERNAME:   ${{ secrets.ADMIN_USERNAME }}
  ADMIN_PASSWORD:   ${{ secrets.ADMIN_PASSWORD }}
  BUYER_USERNAME:   ${{ secrets.BUYER_USERNAME }}
  BUYER_PASSWORD:   ${{ secrets.BUYER_PASSWORD }}
```

Credentials never appear in code or logs. The same variable names used locally
(from `envs/.env`) work in CI without code changes.

Switch environments by changing which secrets the workflow uses — no code changes needed.

### Artifact upload

```yaml
- uses: actions/upload-artifact@v4
  if: ${{ !cancelled() }}   ← upload on failure, skip only if workflow was cancelled
  with:
    name: playwright-report
    path: playwright-report/
```

`if: ${{ !cancelled() }}` ensures the report is uploaded even when tests fail, while
still skipping upload if the workflow run was manually cancelled. Without it, a failed
run destroys the report before you can read why it failed.

### Project dependency order

```
admin setup  ──────────────────────────────┐
                                           │ dependency
chromium project  ◄────────────────────────┘
  runs: tests/specs/**/*.spec.ts
  with: playwright/.auth/admin.json
```

Playwright guarantees `admin setup` completes before any test in `chromium` starts.
This is safer than `globalSetup` because it participates in the reporter and shows
up in the HTML report if login fails.

### Already in this repo
- `workers: 1` in CI
- `forbidOnly: true` in CI
- `retries: 2` in CI
- GitHub Actions workflow
- Artifact upload with `if: always()`
- Secret-based credentials

### Could be added
- **Sharding** — split tests across multiple CI machines: `--shard=1/3`, `--shard=2/3`, `--shard=3/3`
- **Multi-browser** — add Firefox and WebKit projects for cross-browser coverage
- **Scheduled runs** — nightly full suite against UAT, fast `@smoke` suite on every PR

---

## 8. AI-Assisted Workflow

This section explains exactly how each AI tool in this project works, when it runs,
what it does, and why the steps are ordered the way they are.

### Overview: the three AI entry points

```
┌─────────────────────────────────────────────────────────────────────┐
│                        You (the developer)                          │
└──────────────────┬───────────────────┬──────────────────────────────┘
                   │                   │                   │
          /generate-tests       /diagnose-failures    /update-spec
                   │                   │                   │
                   ▼                   ▼                   ▼
         Writes POMs +         Maps failures        Updates spec
         spec files            to spec bullets      markdown file
         from scratch          without rerunning    and triggers
                               the suite            regeneration
```

---

### `/generate-tests` — Full Pipeline

This is the primary skill. It takes a spec markdown file and produces working
Playwright test files. Here is every step in order, and why each step is where it is.

**Key constraint: one spec is processed at a time.** `/generate-tests` is always
invoked for a single `docs/specs/*.md` file. No concurrent runs, no shared POM
ownership conflicts across specs. This makes a manifest unnecessary — existing
generated POMs are discovered directly from the filesystem.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     /generate-tests pipeline                            │
│                                                                         │
│  INPUT: docs/specs/admin/product-management.md  (one spec at a time)   │
│                                                                         │
│  Step 0 ── Resolve target spec file                                     │
│  │         Explicit arg → IDE open file → stop and ask                  │
│  │                                                                      │
│  │  WHY FIRST: Avoids ambiguity. If you run /generate-tests with no     │
│  │  arg and have 6 spec files open, the skill asks rather than          │
│  │  guessing. Fail fast before any file reads or browser work.          │
│  │                                                                      │
│  Step 1 ── Parallel reads                                               │
│  │         Read  → docs/specs/<target spec file>                        │
│  │         Glob  → tests/pages/admin/_*.ts                              │
│  │         Glob  → tests/pages/public/_*.ts                             │
│  │         Read  → envs/.env  (credentials for MCP authentication)      │
│  │                                                                      │
│  │  WHY PARALLEL: All downstream steps need spec content + existing     │
│  │  POM list + credentials. Reading simultaneously avoids sequential    │
│  │  delays. Glob results show which _*.ts files already exist on disk — │
│  │  no manifest needed because only one spec runs at a time.            │
│  │                                                                      │
│  Step 2 ── Check for overwrites + clarify                               │
│  │         Glob _*.ts for existing generated POMs                       │
│  │         Warn about any files that would be overwritten               │
│  │         Ask ALL ambiguous questions in ONE message                   │
│  │                                                                      │
│  │  WHY ONE MESSAGE: Each round-trip to the developer is expensive.     │
│  │  Batching all questions means one reply unblocks the full run.       │
│  │  Asking one question at a time would take 5-10 exchanges.           │
│  │                                                                      │
│  Step 3 ── Resolve pages → map spec bullets to URLs                    │
│  │                                                                      │
│  │  spec bullet                        URL to explore                   │
│  │  ─────────────────────────────────  ────────────────────────────     │
│  │  Admin can view product list     →  /Admin/Product/List              │
│  │  Admin can create a product      →  /Admin/Product/Create            │
│  │  Admin can search by name        →  /Admin/Product/List (same)       │
│  │                                                                      │
│  │  Deduplicate — same URL used by multiple bullets is explored once.   │
│  │  All pages are explored and regenerated. No manifest ownership        │
│  │  check needed — only one spec runs at a time, so there are no        │
│  │  cross-spec conflicts.                                                │
│  │                                                                      │
│  Step 4 ── MCP browser exploration                                      │
│  │                                                                      │
│  │  ┌──────────────────────────────────────────────────────────────┐   │
│  │  │  MCP Playwright tools                                        │   │
│  │  │                                                              │   │
│  │  │  browser_navigate('/login')                                  │   │
│  │  │  browser_type('#Email', ADMIN_USERNAME)                      │   │
│  │  │  browser_type('#Password', ADMIN_PASSWORD)                   │   │
│  │  │  browser_click('button[type=submit]')                        │   │
│  │  │         ↓ authenticated                                      │   │
│  │  │  browser_navigate('/Admin/Product/List')                     │   │
│  │  │  browser_snapshot()   ← returns accessibility tree           │   │
│  │  │         ↓                                                    │   │
│  │  │  role=heading "Products"                                     │   │
│  │  │  role=textbox "Product name"                                 │   │
│  │  │  role=button  "Search"                                       │   │
│  │  │  role=link    "Add new"                                      │   │
│  │  │  role=row × N (product rows)                                 │   │
│  │  └──────────────────────────────────────────────────────────────┘   │
│  │                                                                      │
│  │  WHY browser_snapshot NOT browser_take_screenshot:                   │
│  │  Screenshots are images — the AI cannot extract selector text.       │
│  │  The accessibility tree is structured text — roles, names, and       │
│  │  relationships are directly readable and map to getByRole() calls.   │
│  │                                                                      │
│  │  WHY authenticate once (not per page):                               │
│  │  The MCP browser keeps a live session. Navigating to the next page   │
│  │  inherits the session. Re-logging in between pages wastes ~3s each.  │
│  │                                                                      │
│  Step 5 ── Write POM files                                              │
│  │                                                                      │
│  │  _AdminProductListPage.ts   ← generated (locators from snapshot)    │
│  │   AdminProductListPage.ts   ← manual (navigate + action methods)    │
│  │                                                                      │
│  │  WHY _Generated first: the manual file's methods reference           │
│  │  the generated locators (e.g., `this.searchBox`). If the _           │
│  │  file doesn't exist yet, the manual file would have type errors.     │
│  │                                                                      │
│  Step 6 ── Write spec file                                              │
│  │                                                                      │
│  │  tests/specs/admin/product-management.spec.ts                        │
│  │                                                                      │
│  │  One test.describe per spec file                                     │
│  │  One test() per spec bullet                                          │
│  │  Import from fixtures, use authenticatedAdmin fixture                │
│  │                                                                      │
│  Step 7 ── Report                                                       │
│  │          No manifest written. Existing POMs were discovered via      │
│  │          Glob in Step 1 — filesystem state is the source of truth.  │
│  │                                                                      │
│  │  WHY NO MANIFEST: Only one spec runs at a time, so there is no      │
│  │  cross-spec POM ownership conflict to track. A manifest would add    │
│  │  a read + write on every run with no benefit. Direct `_*.ts`         │
│  │  discovery is sufficient and cheaper.                                │
│  │                                                                      │
│  Step 8 ── Report                                                       │
│            Lists all written files:                                     │
│            ✓ new file created                                           │
│            ~ file overwritten                                           │
│            ⚠ uncertain selector (flagged for manual review)            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### `/diagnose-failures` — Failure Triage Without Re-Running

When tests fail in CI, re-running the full suite to reproduce costs time and CI
minutes. This skill analyses the failure output already in hand.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    /diagnose-failures pipeline                          │
│                                                                         │
│  INPUT: CI failure output / local test run output                      │
│                                                                         │
│  Step 1 ── Parse failure output                                         │
│  │         Extract: failing test names, assertion messages,             │
│  │         expected vs. actual values, stack traces                     │
│  │                                                                      │
│  Step 2 ── Map failures to spec bullets                                 │
│  │                                                                      │
│  │  Failed test: "admin can delete a product — product removed"         │
│  │         ↓                                                            │
│  │  Spec:  docs/specs/admin/product-management.md                       │
│  │  Bullet: "Admin can delete a product — confirm dialog, removed"      │
│  │                                                                      │
│  Step 3 ── Classify root cause                                          │
│  │                                                                      │
│  │  Category           Signal                    Likely fix             │
│  │  ─────────────────  ─────────────────────────  ─────────────────     │
│  │  Selector broken    "Locator not found"        Re-explore page,      │
│  │                                                update _*.ts file     │
│  │  Timing issue       "Timeout exceeded"         Check waitFor,        │
│  │                     intermittent               increase timeout      │
│  │  Auth expired       "Redirect to /login"       Delete admin.json,    │
│  │                                                re-run setup          │
│  │  Feature regression "Expected X, got Y"        File bug,             │
│  │                     always fails               fix the app           │
│  │  Environment issue  Fails only on CI           Check BASE_URL,       │
│  │                                                credentials, network  │
│  │                                                                      │
│  Step 4 ── Output actionable suggestions                                │
│            Per failing test: root cause + specific fix command          │
│                                                                         │
│  WHY no re-run: Failures leave traces, screenshots, and video.          │
│  The information needed to diagnose is already captured. Re-running     │
│  wastes 2-10 minutes and may not reproduce flaky failures.             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### `/update-spec` — The Spec Change Cycle

When a nopCommerce feature changes — a page is redesigned, a flow is altered —
the right place to start is the spec, not the test file.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      /update-spec cycle                                 │
│                                                                         │
│                                                                         │
│  1. Feature changes in nopCommerce                                      │
│              │                                                          │
│              ▼                                                          │
│  2. /update-spec docs/specs/admin/product-management.md                 │
│     │                                                                   │
│     │  Edits the spec markdown:                                         │
│     │  — adds new bullets for new behaviour                             │
│     │  — removes bullets for removed behaviour                          │
│     │  — updates expected outcomes where the feature changed            │
│     │                                                                   │
│              │                                                          │
│              ▼                                                          │
│  3. Review the spec diff                                                │
│     — confirm bullets reflect the new intended behaviour                │
│     — approve before any code is touched                                │
│              │                                                          │
│              ▼                                                          │
│  4. /generate-tests docs/specs/admin/product-management.md             │
│     — re-explores changed pages via MCP                                 │
│     — regenerates _*.ts locator files                                   │
│     — rewrites the spec file to match new bullets                       │
│     — manual POM action methods survive (in non-_ files)               │
│              │                                                          │
│              ▼                                                          │
│  5. npm test — verify suite passes                                      │
│                                                                         │
│  WHY spec first, not test first:                                        │
│  If you edit the test directly, the spec and test diverge. The next     │
│  /generate-tests would overwrite your test edits. The spec is the       │
│  contract; the test is the generated output. Always edit the contract.  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### MCP Playwright Tools — What They Do and Why

MCP (Model Context Protocol) gives Claude Code a live browser connection.
These are the tools used during `/generate-tests` page exploration:

```
Tool                    What it does
──────────────────────  ────────────────────────────────────────────────────
browser_navigate(url)   Opens a URL in the live browser. Waits for load.

browser_type(sel, val)  Types into a field. Used for login during setup.

browser_click(sel)      Clicks an element. Used for form submission.

browser_snapshot()      Returns the ACCESSIBILITY TREE of the current page.
                        This is the key tool — output looks like:

                          role=heading level=1 "Products"
                          role=textbox "Product name" (focused)
                          role=button "Search"
                          role=link "Add new" url=/Admin/Product/Create
                          role=table "Products"
                            role=row
                              role=cell "HTC Smartphone"
                              role=cell "SMARTPHONE_HTX"
                              role=link "Edit"

                        These role+name pairs map directly to getByRole():
                          page.getByRole('button', { name: 'Search' })
                          page.getByRole('textbox', { name: 'Product name' })

                        ALWAYS pass target: 'main' unless you need header/footer
                        elements (cart count, wishlist count, login state):
                          browser_snapshot(target: 'main')   ← default
                          browser_snapshot()                 ← only for header/footer

                        A full-page snapshot on nopCommerce includes the entire
                        nav menu, all footer columns, and every link — 3-5× larger
                        than a scoped snapshot with no extra locator value.

browser_fill()          Fills a single field directly. Equivalent to
                          browser_type for most inputs.

browser_wait_for_page_load() Waits until the page reaches a load state.
                          Use after navigation when browser_navigate is not
                          sufficient.

browser_network_requests() Returns intercepted network calls. Useful when
                           debugging whether an action triggered an API call
                           (e.g., Add to Cart posting to the backend).

browser_take_screenshot() Takes a PNG screenshot. Used for documentation
                          and debugging — NOT for selector extraction
                          (images are opaque, accessibility trees are readable).
```

**Why `browser_snapshot` is the centrepiece:**

Every POM selector comes from a `browser_snapshot` call. The accessibility tree
gives role + name pairs that translate directly and reliably to Playwright locators.
No manual DOM inspection, no fragile CSS class copying.

---

### Agents vs. Inline Execution — When Each Is Used

```
Task type                          Execution strategy
────────────────────────────────   ─────────────────────────────────────────
Single spec generation             Inline — sequential steps, shared browser
                                   session, no parallelism needed

Multiple independent specs         Parallel agents — each spec gets its own
(e.g., generate 5 specs at once)   subagent with its own browser session,
                                   all run simultaneously

Diagnosis (read-only analysis)     Inline — no browser needed, fast

Code review / spec review          Subagent — isolates the review context
                                   from the main conversation
```

**When NOT to spawn a subagent:**

- When steps share state (same browser session, same files)
- When the task is short (< 3 steps)
- When you need the output before the next step begins

Spawning a subagent has a startup cost — it starts fresh with no conversation
context. It's only worth it when the parallelism benefit outweighs that cost.

---

### Token Efficiency Patterns

Every design decision in this project was also a token decision.

```
Pattern                     Token saving                Why it matters
──────────────────────────  ──────────────────────────  ─────────────────────
Specs as source of truth    MCP exploration runs only   browser_snapshot on
                            when /generate-tests is     10 pages costs ~2000
                            explicitly invoked — not    tokens per snapshot.
                            on every test run.          Accessibility tree is
                                                        50-200 lines vs 3000+
                                                        for raw HTML.

_Generated / manual split   Only _*.ts files are        If the whole POM were
                            regenerated. Manual files   one file, the entire
                            are never re-read or        file would be re-read
                            rewritten unless they       and rewritten on each
                            change.                     change.

Direct `_*.ts` discovery    Avoids manifest overhead     A single-spec generation
                            for generated POMs           uses local files only,
                                                         no shared manifest lookup.

One clarification message   All ambiguous questions in  Each message round-trip
(Step 2)                    one batch. One reply        consumes context. One
                            unblocks everything.        message vs. eight.

Accessibility tree vs HTML  Compact structured output   Raw HTML for a
                            (~50-200 lines per page)    nopCommerce page is
                            not the full DOM            3000+ lines. 15× more
                            (~3000+ lines)              expensive per page.

Scoped snapshots            target: 'main' cuts each    Header + footer + nav
(target: 'main')            snapshot to ~30-40% of      appear on every page.
                            full-page size. Full-page   A full-page snapshot
                            only when header/footer     is 3-5× larger with no
                            elements are needed.        extra locator value.

Batch ToolSearch calls      One ToolSearch call for     Each ToolSearch call is
                            core browser tools at the   a round-trip. Splitting
                            start of Step 4. Load       navigate/snapshot/type/
                            extras only if a test       click into one call vs.
                            case requires them.         two saves a full turn.
```

---

### End-to-End: A New Feature from Idea to Green CI

```
Developer                    Claude Code / AI tools               nopCommerce / CI
────────────────             ──────────────────────               ────────────────

Write spec bullet in    →    /generate-tests                 →    browser_navigate
docs/specs/                  reads spec + context                 browser_snapshot
                             resolves pages                       (live browser)
                             ↓
                             writes _*.ts (locators)
                             writes *.ts (actions)
                             writes *.spec.ts (tests)
                             updates manifest

Review generated files  →    /diagnose-failures (if needed)
                             maps errors to spec bullets

git push                →                                    →    GitHub Actions
                                                                  npm ci
                                                                  playwright install
                                                                  admin.setup.ts
                                                                  all spec files
                                                                  ↓
                                                                  HTML report
                                                                  uploaded as artifact

Test fails              →    /diagnose-failures               →    reads failure output
                             classifies root cause                 maps to spec bullet
                             suggests fix

Feature changes         →    /update-spec                     →    edits spec markdown
                             /generate-tests                       re-explores pages
                             re-generates POMs + tests             manual files safe
```

---

*End of document. Spec files live in `docs/specs/` — edit there, then run `/generate-tests` to regenerate.*
