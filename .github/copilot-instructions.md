# Copilot Instructions — nop2e Playwright Test Suite

This project is a Playwright end-to-end test suite for a nopCommerce storefront.
All tests are written in TypeScript. The source of truth for what to test lives in
`docs/specs/` — page objects and spec files are generated from those markdown files.

---

## Commands

```bash
npm test                  # run all tests (headless)
npm run test:headed       # run with browser visible
npm run test:ui           # open Playwright UI mode
npm run test:debug        # run with Playwright inspector
npm run test:chromium     # run chromium only
npm run test:report       # open last HTML report

# Run a single test file
npx playwright test tests/path/to/spec.ts

# Run a single test by title
npx playwright test -g "test title here"

# Re-authenticate (delete stale session and re-run setup)
npx playwright test --project="admin setup"
```

## Environment

Environment files live in `envs/`. Active file defaults to `.env`.

`envs/.env` is gitignored — never commit it. Required variables:

```
BASE_URL=
ADMIN_USERNAME=
ADMIN_PASSWORD=
BUYER_USERNAME=
BUYER_PASSWORD=
```

---

## Project Structure

```
docs/
  specs/          # source-of-truth spec files — one per feature, edit here
  pom-templates.md  # base classes, import paths, templates, known routes
tests/
  auth/           # setup specs — run before tests, save storageState
  fixtures/
    index.ts      # custom test + expect exports — always import from here
    routes.ts     # all URL paths — use these, never hardcode URLs
    timeouts.ts   # global timeout constants
  pages/          # page object models
    BasePage.ts
    admin/AdminBasePage.ts
    public/PublicLayoutPage.ts
    components/
  specs/          # generated .spec.ts files
utils/
  helpers.ts      # waitForToast, generateEmail, generateUniqueString, retryAction
```

---

## Authentication Architecture

Authentication uses **Playwright's storageState pattern** — login runs once per role,
not per test.

1. `tests/auth/admin.setup.ts` logs in and saves session to `playwright/.auth/admin.json`
2. `playwright.config.ts` declares `admin setup` as a dependency and sets `storageState`
3. Every test page opens already authenticated — no login code in tests

The `.auth/` directory is gitignored. Delete `playwright/.auth/*.json` and re-run setup
if authentication breaks.

---

## Writing Tests

Always import from `tests/fixtures/index.ts`, never from `@playwright/test` directly:

```ts
import { test, expect } from '../../fixtures';
import { AdminProductListPage } from '../../pages/admin/AdminProductListPage';

test.describe('Product Management', () => {
  test('admin can view the product list', async ({ authenticatedAdmin }) => {
    const page = new AdminProductListPage(authenticatedAdmin.page);
    await page.navigate();
    await expect(page.heading).toBeVisible();
  });
});
```

Available fixtures: `adminPage`, `publicPage`, `header`, `footer`, `authenticatedAdmin`.

Use `routes` from `tests/fixtures/routes.ts` for all URL paths.

---

## Page Object Model (POM) Convention

Each page has two files:

- **`_<Name>.ts`** — locator declarations only, no methods. Always regenerated.
- **`<Name>.ts`** — `navigate()` and action methods. Never overwrite after first creation.

Selector priority (highest to lowest):
1. `page.getByRole('button', { name: 'Save' })`
2. `page.getByLabel('Product name')`
3. `page.getByPlaceholder('Search...')`
4. `page.locator('#elementId')`
5. `page.locator('[data-attribute]')`
Never use CSS class selectors (e.g. `.k-button-abc123`).

Wait strategy:
- URL changes (save, redirect) → `waitForNavigation({ waitUntil: 'domcontentloaded' })`
- URL stays (AJAX, grid refresh) → `waitForResponse(resp => resp.url().includes('...'))`
- Do **not** use `waitForNetworkIdle()` — this app has persistent background connections.

---

## Spec File Format

```markdown
---
name: product-management
description: admin catalog CRUD — create, edit, search, publish, bulk delete
role: admin
---

# Product Management

- admin views product list — list loads with results
- admin searches by name — filtered results appear
```

`role: admin | buyer | public` maps to auth context and POM folder.
Each bullet becomes one `test()` in the generated spec file.

---

## Prompt Files (Reusable Workflows)

Reference these in Copilot Chat with `#generate-tests`, `#diagnose-failures`,
or `#update-spec`:

| Prompt file | What it does |
|---|---|
| `.github/prompts/generate-tests.prompt.md` | Generate POMs + spec files from a spec markdown |
| `.github/prompts/diagnose-failures.prompt.md` | Diagnose Playwright test failures from JSON report |
| `.github/prompts/update-spec.prompt.md` | Update a spec file and preview changes |

---

## CI

GitHub Actions runs on push/PR to main/master. Credentials come from GitHub Secrets
(same names as `.env` variables). CI runs chromium only, 1 worker, 2 retries.
