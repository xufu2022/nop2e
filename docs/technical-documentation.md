# Playwright E2E — Technical Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Authentication Flow](#authentication-flow)
5. [Test Execution Flow](#test-execution-flow)
6. [Page Object Model (POM) Hierarchy](#page-object-model-pom-hierarchy)
7. [Fixture System](#fixture-system)
8. [Routes](#routes)
9. [Environment & Configuration](#environment--configuration)
10. [CI Pipeline](#ci-pipeline)
11. [Spec-Driven Workflow](#spec-driven-workflow)
12. [Timeout Strategy](#timeout-strategy)

---

## Overview

This project is a **Playwright-based E2E test suite** for a nopCommerce storefront. It covers two roles (Admin, Guest/Buyer) across admin-panel and public-storefront surfaces. Tests run headless in CI and can run headed or in UI mode locally.

| Item | Value |
|---|---|
| Framework | Playwright (TypeScript) |
| Roles | Admin, Guest/Buyer |
| Browsers | Chromium |
| Auth strategy | `storageState` — login once, reuse session per role |
| CI | GitHub Actions |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Test Runner (Playwright)                  │
│                                                                  │
│  ┌─────────────────┐                                            │
│  │  admin setup    │  Runs FIRST — saves admin.json            │
│  │  project        │                                            │
│  └────────┬────────┘                                            │
│           │ dependency                                           │
│           ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  chromium project                                        │   │
│  │  testMatch: **/specs/**/*.spec.ts                        │   │
│  │  storageState: playwright/.auth/admin.json               │   │
│  │                                                          │   │
│  │  Admin specs  → use admin storageState                   │   │
│  │  Public specs → override with test.use({ storageState:  │   │
│  │                   { cookies: [], origins: [] } })         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Fixture Layer (index.ts)                     │
│            adminPage · publicPage · authenticatedAdmin           │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Page Object Model (POM) Layer                  │
│                                                                  │
│   BasePage                                                       │
│   ├── AdminBasePage      ← admin login, logout, navigateToDashboard
│   │   ├── AdminDashboardPage                                     │
│   │   ├── AdminOrderListPage                                     │
│   │   ├── AdminOrderDetailsPage                                  │
│   │   ├── AdminProductListPage                                   │
│   │   ├── AdminProductCreatePage                                 │
│   │   └── components/                                            │
│   │       ├── AdminLeftMenu                                      │
│   │       └── AdminTopMenu                                       │
│   └── PublicBasePage     ← buyer login, logout                   │
│       └── PublicLayoutPage  ← adds header + footer               │
│           ├── HomePage                                           │
│           ├── LoginPage                                          │
│           ├── ProductPage                                        │
│           └── CartPage                                           │
│   └── components/                                                │
│       ├── Header                                                 │
│       └── Footer                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
playwrighte2e/
│
├── docs/
│   ├── specs/                     ← Source-of-truth spec files (edit here, not POMs)
│   │   ├── admin/
│   │   │   ├── admin-dashboard.md
│   │   │   ├── order-management.md
│   │   │   └── product-management.md
│   │   ├── public/
│   │   │   └── dashboard.md
│   │   ├── login-logout.md
│   │   └── shopping-cart.md
│   └── technical-documentation.md
│
├── tests/
│   ├── auth/                      ← One-time login setup, saves storageState
│   │   └── admin.setup.ts
│   │
│   ├── fixtures/                  ← Shared test utilities
│   │   ├── index.ts               ← Custom test/expect exports — import from here
│   │   ├── role-config.ts         ← Credential helpers per role
│   │   ├── routes.ts              ← All URL paths (admin + public)
│   │   ├── timeouts.ts            ← Global timeout constants
│   │   └── locale-config.ts
│   │
│   ├── pages/
│   │   ├── BasePage.ts                        ← manual, root base class
│   │   ├── admin/
│   │   │   ├── AdminBasePage.ts               ← manual, admin infrastructure
│   │   │   ├── _AdminDashboardPage.ts         ← GENERATED (locators only)
│   │   │   ├── AdminDashboardPage.ts          ← manual (navigate + methods)
│   │   │   ├── _AdminOrderListPage.ts         ← GENERATED
│   │   │   ├── AdminOrderListPage.ts          ← manual
│   │   │   ├── _AdminOrderDetailsPage.ts      ← GENERATED
│   │   │   ├── AdminOrderDetailsPage.ts       ← manual
│   │   │   ├── _AdminProductListPage.ts       ← GENERATED
│   │   │   ├── AdminProductListPage.ts        ← manual
│   │   │   ├── _AdminProductCreatePage.ts     ← GENERATED
│   │   │   ├── AdminProductCreatePage.ts      ← manual
│   │   │   └── components/
│   │   │       ├── _AdminLeftMenu.ts          ← GENERATED
│   │   │       ├── AdminLeftMenu.ts           ← manual
│   │   │       ├── _AdminTopMenu.ts           ← GENERATED
│   │   │       └── AdminTopMenu.ts            ← manual
│   │   ├── public/
│   │   │   ├── PublicBasePage.ts              ← manual, public infrastructure
│   │   │   ├── PublicLayoutPage.ts            ← manual, adds header + footer
│   │   │   ├── _HomePage.ts                   ← GENERATED
│   │   │   ├── HomePage.ts                    ← manual
│   │   │   ├── _LoginPage.ts                  ← GENERATED
│   │   │   ├── LoginPage.ts                   ← manual
│   │   │   ├── _ProductPage.ts                ← GENERATED
│   │   │   ├── ProductPage.ts                 ← manual
│   │   │   ├── _CartPage.ts                   ← GENERATED
│   │   │   └── CartPage.ts                    ← manual
│   │   └── components/
│   │       ├── header.ts                      ← manual
│   │       └── footer.ts                      ← manual
│   │
│   └── specs/                     ← Generated .spec.ts files
│       ├── .manifest.json         ← Tracks which spec owns which POMs
│       ├── admin/
│       │   ├── admin-dashboard.spec.ts
│       │   ├── order-management.spec.ts
│       │   └── product-management.spec.ts
│       └── public/
│           ├── dashboard.spec.ts
│           ├── shopping-cart.spec.ts
│           └── login-logout.spec.ts
│
├── utils/
│   └── helpers.ts                 ← waitForToast, generateEmail, generateUniqueString, retryAction
│
├── envs/
│   ├── .env                       ← Gitignored — local credentials
│   └── uat-ca.env                 ← Gitignored — UAT-CA credentials
│
├── playwright/.auth/              ← Gitignored — saved session files
│   └── admin.json
│
├── playwright.config.ts
└── package.json
```

---

## Authentication Flow

The suite uses Playwright's `storageState` pattern. Login happens once at the start of a run via the `admin setup` project; every test in `chromium` inherits the saved session.

```
npm test
        │
        ▼
┌───────────────────┐
│  "admin setup"    │  Runs FIRST (chromium depends on it)
│  admin.setup.ts   │
└────────┬──────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  AdminBasePage.login()                   │
│                                          │
│  1. page.goto('/login')                  │
│  2. fill Email field                     │
│  3. fill Password field                  │
│  4. click "Log in" button                │
│  5. assert URL does NOT contain /login   │
│  6. page.goto('/Admin')                  │
│  7. assert URL matches /Admin            │
│  8. context.storageState → admin.json    │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│  "chromium" project (depends on admin setup)     │
│                                                  │
│  storageState: 'playwright/.auth/admin.json'     │
│  ──────────────────────────────────────────      │
│  Every test opens the browser already            │
│  authenticated as admin                          │
│                                                  │
│  Public/guest tests override at test level:      │
│  test.use({ storageState: { cookies: [],         │
│                              origins: [] } })    │
└──────────────────────────────────────────────────┘
```

**Session reset:** Delete `playwright/.auth/admin.json` and re-run to force fresh login.

---

## Test Execution Flow

```
npx playwright test (or npm test)
        │
        ▼
┌──────────────────┐
│  admin setup     │  Saves playwright/.auth/admin.json
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│  chromium project                                    │
│  testMatch: **/specs/**/*.spec.ts                    │
│  ─────────────────────────────────────              │
│  tests/specs/admin/**   → run with admin session     │
│  tests/specs/public/**  → run with cleared session   │
└────────┬─────────────────────────────────────────────┘
         │
┌────────▼──────────────────────────────────────────┐
│  Per test:                                         │
│                                                    │
│  1. Fixture setup (index.ts)                      │
│     └── authenticatedAdmin = new AdminBasePage(page)
│  2. test.beforeEach (if any)                      │
│  3. Test body                                      │
│     ├── new FooPage(authenticatedAdmin.page)       │
│     ├── fooPage.navigate()  → page.goto(route)    │
│     ├── fooPage.action()    → click / fill        │
│     └── expect(locator)     → assertion           │
│  4. On failure:                                    │
│     ├── screenshot saved                          │
│     ├── video retained                            │
│     └── trace captured (first retry)             │
│  5. CI: retry up to 2 times                       │
└────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────┐
│  Reports                                   │
│  ├── HTML report  (playwright-report/)     │
│  ├── List (console)                        │
│  └── JSON (playwright-report/results.json) │
└────────────────────────────────────────────┘
```

---

## Page Object Model (POM) Hierarchy

Every POM is split into two files:

| File | Prefix | Written by | Rule |
|------|--------|-----------|------|
| `_FooPage.ts` | `_` | Skill — always overwritten | Locators only |
| `FooPage.ts` | none | Developer — written once | `navigate()` + action methods |

The skill only ever writes `_*.ts` files. `FooPage.ts` is created once on first generation and never touched again — safe to edit manually at any time.

All admin POMs extend `AdminBasePage` directly. Components (`AdminLeftMenu`, `AdminTopMenu`) are imported explicitly by tests that need them.

```
BasePage  (tests/pages/BasePage.ts)
│
│  Properties
│  └── page: Page
│
│  Methods
│  ├── goto(path)              → page.goto(path)
│  ├── getTitle()              → page.title()
│  ├── waitForNetworkIdle()    → page.waitForLoadState('networkidle')
│  ├── getLocator(selector)    → page.locator(selector)
│  └── takeScreenshot(name)
│
├── AdminBasePage  (tests/pages/admin/AdminBasePage.ts)
│   │
│   │  Methods
│   │  ├── login(user?, pass?)         → fills login form, asserts redirect
│   │  ├── logout()                    → clicks Log out link
│   │  └── navigateToDashboard()       → goto(routes.admin.dashboard)
│   │
│   ├── AdminDashboardPage
│   │   ├── navigate()                 → routes.admin.dashboard
│   │   └── heading: Locator
│   │
│   ├── AdminOrderListPage
│   │   ├── navigate()                 → routes.admin.orders
│   │   ├── filterByStatus(status)
│   │   ├── clickFirstView()
│   │   ├── dataRows()                 → Locator (rows with View link)
│   │   ├── rowOrderStatusCell(row)
│   │   └── heading / orderNumberHeader / orderStatusHeader: Locator
│   │
│   ├── AdminOrderDetailsPage
│   │   ├── navigate(orderId)          → /Admin/Order/Edit/:id
│   │   └── backToListLink / customerLink / productsTable / orderTotalLabel: Locator
│   │
│   ├── AdminProductListPage
│   │   ├── navigate()                 → routes.admin.products
│   │   ├── searchByName(name)
│   │   ├── rowFor(productName)        → Locator
│   │   ├── clickEdit(productName)
│   │   ├── deleteProduct(productName)
│   │   └── heading / productNameSearch / searchButton / addNewButton: Locator
│   │
│   ├── AdminProductCreatePage
│   │   ├── navigate()                 → routes.admin.productCreate
│   │   ├── createProduct(name, sku, price)
│   │   └── productName / sku / price / saveButton / backToListLink: Locator
│   │
│   └── components/
│       ├── AdminLeftMenu
│       │   ├── navigate()             → routes.admin.dashboard
│       │   ├── expandCatalog()
│       │   ├── isLinkActive(name)     → boolean
│       │   └── productsLink: Locator
│       └── AdminTopMenu
│           ├── logoutLink: Locator
│           └── publicStoreLink: Locator
│
└── PublicBasePage  (tests/pages/public/PublicBasePage.ts)
    │
    │  Methods
    │  ├── login(user?, pass?)   → buyer login, asserts redirect to '/'
    │  └── logout()
    │
    └── PublicLayoutPage  (adds header + footer to all public pages)
        │
        │  Properties
        │  ├── header: Header
        │  └── footer: Footer
        │
        ├── HomePage
        │   ├── navigate()                   → routes.public.home
        │   ├── logout()
        │   ├── welcomeHeading: Locator
        │   ├── featuredProductsHeading: Locator
        │   ├── featuredProductArticles: Locator
        │   ├── addToWishlistButtons: Locator
        │   ├── administrationLink: Locator
        │   ├── logOutLink: Locator
        │   └── logInLink: Locator
        │
        ├── LoginPage
        │   ├── navigate()                   → routes.public.login
        │   ├── login(email, password)
        │   └── emailInput / passwordInput / loginButton: Locator
        │
        ├── ProductPage
        │   ├── navigate(slug?)              → default: /htc-smartphone
        │   ├── addToCart()                  → waits for /addproducttocart/ response
        │   ├── getCartCount()               → number
        │   └── addToCartButton / cartCountLink: Locator
        │
        └── CartPage
            ├── navigate()                   → routes.public.cart
            ├── clearCart()
            ├── updateQuantity(n)
            ├── removeItem()
            └── quantityInput / removeButton / subTotalRow / emptyCartMessage: Locator
```

---

## Fixture System

All fixtures live in `tests/fixtures/index.ts` and extend Playwright's base `test`. Every spec imports `{ test, expect }` from there — never directly from `@playwright/test`.

```
base test (Playwright)
        │
        ▼
test.extend<Fixtures>  (tests/fixtures/index.ts)
        │
        ├── adminPage           → new AdminBasePage(page)
        ├── publicPage          → new PublicBasePage(page)
        └── authenticatedAdmin  → new AdminBasePage(page)
                                   (page already has admin storageState from project config)
```

Tests instantiate specific POMs directly inside the test body:

```ts
import { test, expect } from '../../fixtures';
import { AdminProductListPage } from '../../pages/admin/AdminProductListPage';

test('admin can view the product list', async ({ authenticatedAdmin }) => {
  const listPage = new AdminProductListPage(authenticatedAdmin.page);
  await listPage.navigate();
  await expect(listPage.heading).toBeVisible();
});
```

Guest/public tests clear the project-level storageState at the file level:

```ts
test.use({ storageState: { cookies: [], origins: [] } });
```

---

## Routes

All URL paths are centralised in `tests/fixtures/routes.ts`. Every POM `navigate()` method uses these constants — never hardcoded strings.

```ts
export const routes = {
  admin: {
    login:         '/login',
    dashboard:     '/Admin',
    products:      '/Admin/Product/List',
    productCreate: '/Admin/Product/Create',
    orders:        '/Admin/Order/List',
    customers:     '/Admin/Customer/List',
  },
  public: {
    home:     '/',
    login:    '/login',
    register: '/register',
    cart:     '/cart',
    checkout: '/checkout',
  },
} as const;
```

Dynamic routes (e.g. `/Admin/Order/Edit/:id`) are constructed inline in the POM's `navigate()` method using template literals.

---

## Environment & Configuration

### Environment files

| File | Purpose | Committed |
|---|---|---|
| `envs/.env` | Local development credentials | No (gitignored) |
| `envs/uat-ca.env` | UAT-CA environment credentials | No (gitignored) |

Switch environments: `ENV_FILE=uat-ca.env npm test`

### Required variables

```
BASE_URL=
ADMIN_USERNAME=
ADMIN_PASSWORD=
BUYER_USERNAME=
BUYER_PASSWORD=
```

### `playwright.config.ts` — key decisions

```
defineConfig
  ├── testDir:        ./tests
  ├── fullyParallel:  true
  ├── forbidOnly:     true in CI
  ├── retries:        2 in CI, 0 locally
  ├── workers:        1 in CI, auto locally
  ├── reporter:       html + list + json
  ├── timeout:        from timeouts.test
  ├── expect.timeout: from timeouts.expect
  ├── use
  │   ├── baseURL:           from BASE_URL env var
  │   ├── actionTimeout:     from timeouts.action
  │   ├── navigationTimeout: from timeouts.navigation
  │   ├── trace:             on-first-retry
  │   ├── screenshot:        only-on-failure
  │   └── video:             retain-on-failure
  └── projects
      ├── "admin setup"   testMatch: **/auth/admin.setup.ts
      └── "chromium"      testMatch: **/specs/**/*.spec.ts
                          storageState: playwright/.auth/admin.json
                          dependencies: ['admin setup']
```

---

## CI Pipeline

```
git push / PR to main
        │
        ▼
GitHub Actions workflow
        │
        ├── Set env vars from GitHub Secrets
        │   (BASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD,
        │    BUYER_USERNAME, BUYER_PASSWORD)
        │
        ├── npm ci
        │
        ├── npx playwright install chromium
        │
        └── npx playwright test
                │
                ├── workers:    1        (serialised in CI)
                ├── retries:    2
                ├── forbidOnly: true
                │
                ├── admin setup  ──────────────┐
                │                              │ dependency
                └── chromium project  ◄────────┘
                        │
                        ▼
                    Artifacts uploaded
                    ├── playwright-report/ (HTML)
                    └── playwright-report/results.json
```

---

## Spec-Driven Workflow

Source of truth lives in `docs/specs/**/*.md`. POMs and spec files under `tests/` are **generated output** — edit the spec, then regenerate with `/generate-tests`.

### Spec file format

```markdown
---
name: product-management
description: admin product catalog CRUD
role: admin
---

# Product Management

- Admin can view the product list
- Admin can create a product with name, SKU, and price — saved, redirected to list
```

`role` values: `admin` → admin POMs + admin storageState | `buyer` → public POMs + buyer storageState | `public` → public POMs + no auth

### Spec → test file path mapping

```
docs/specs/admin/foo.md        →  tests/specs/admin/foo.spec.ts
docs/specs/public/bar.md       →  tests/specs/public/bar.spec.ts
docs/specs/baz.md              →  tests/specs/baz.spec.ts
```

### `/generate-tests` skill steps

```
Step 0  Read this file (technical-documentation.md) for system context
        Read fixtures/index.ts and routes.ts for current contracts
        Read tests/specs/.manifest.json for POM ownership

Step 1  Resolve target spec file
        (explicit arg → IDE open file → stop and ask)
        Glob existing POMs for overwrite detection

Step 2  Confirm & Clarify
        Warn about any files that would be overwritten
        Ask all ambiguous questions in ONE message — wait for one reply
        Skip entirely if nothing to clarify and no overwrites

Step 3  Resolve pages → determine which URLs need exploration
        Cross-reference manifest for POM ownership
        explore:true  = new or owned by this spec → explore + write
        explore:false = owned by different spec   → import only, skip write

Step 4  MCP exploration (only explore:true pages)
        Authenticate once via browser_navigate + browser_type + browser_click
        browser_snapshot per page → accessibility tree (never raw HTML)
        Extract selectors using role/label/placeholder priority

Step 5  Write POM files (only explore:true pages)
        All locators as readonly class properties
        navigate() on every POM using routes constants
        Extend AdminBasePage (admin) or PublicBasePage (public)
        Components go in tests/pages/admin/components/ or public/components/

Step 6  Write spec file
        Import { test, expect } from fixtures (never @playwright/test)
        Admin tests: async ({ authenticatedAdmin })
        Guest tests: async ({ page }) + test.use({ storageState: {} })
        One test.describe per feature, one test() per spec bullet

Step 7  Update manifest (tests/specs/.manifest.json)

Step 8  Report — list new (✓) and overwritten (~) files, flag uncertain selectors
```

### Manifest structure

```json
{
  "docs/specs/admin/product-management.md": {
    "spec": "tests/specs/admin/product-management.spec.ts",
    "poms": [
      "tests/pages/admin/AdminProductListPage.ts",
      "tests/pages/admin/AdminProductCreatePage.ts"
    ],
    "date": "2026-06-27"
  }
}
```

---

## Timeout Strategy

All timeouts are centralised in `tests/fixtures/timeouts.ts`.

```
timeouts.ts
    │
    ├── test:       90 000 ms   ← max duration of a single test
    ├── action:     30 000 ms   ← single interaction (click, fill, select)
    ├── navigation: 60 000 ms   ← page.goto() / waitForNavigation
    └── expect:     15 000 ms   ← expect().toBeVisible() / toHaveURL()

playwright.config.ts
    ├── timeout           ← timeouts.test
    ├── expect.timeout    ← timeouts.expect
    ├── actionTimeout     ← timeouts.action
    └── navigationTimeout ← timeouts.navigation
```

Shorter `expect` timeout (15 s) catches assertion hangs quickly. Longer `navigation` timeout (60 s) accommodates slow page loads in UAT environments.
