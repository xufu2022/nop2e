---
name: diagnose-failures
description: Use when Playwright tests have failed and you need to identify root causes, map failures to spec bullets, and get actionable fix suggestions without re-running the full suite.
---

# diagnose-failures

Reads the latest Playwright JSON test results, categorizes each failure by root cause,
maps it back to the originating spec bullet, and suggests a concrete fix or next command.

---

## Step 0 — Enable JSON reporter (one-time setup if needed)

Check for `playwright-report/results.json`. If it does not exist:

1. Read `playwright.config.ts`
2. Add `['json', { outputFile: 'playwright-report/results.json' }]` to the `reporter` array
3. Tell the user:
   ```
   JSON reporter added to playwright.config.ts.
   Re-run your tests, then call /diagnose-failures again.

   To re-run only failed tests:
     npx playwright test --only-failures
   ```
4. Stop — do not proceed until the file exists.

---

## Step 1 — Parse failures

Read `playwright-report/results.json`.

Walk the `suites` tree recursively. For each `spec` where any
`tests[].results[].status` is `'failed'` or `'timedOut'`, collect:

- `title` — test name
- `file` — spec file path (e.g. `tests/specs/shopping-cart.spec.ts`)
- `error.message` — first line of the error
- `error.stack` — full stack (extract POM file + line number from first `at` line inside `tests/pages/`)
- `attachments` — screenshot / trace paths
- retry count — if the last result is `passed`, mark as flaky

Group by spec file.

---

## Step 2 — Map each failure to a spec bullet

For each failed test:

1. Derive the spec path:
   ```
   tests/specs/foo.spec.ts         → docs/specs/foo.md
   tests/specs/admin/foo.spec.ts   → docs/specs/admin/foo.md
   tests/specs/public/foo.spec.ts  → docs/specs/public/foo.md
   ```
2. Read the spec file.
3. Find the bullet whose text best matches the test `title` (fuzzy — ignore case,
   articles, punctuation). Note the line number.
4. If no spec file found, mark `spec: unknown`.

---

## Step 3 — Categorize each failure

| Category | Signals |
|----------|---------|
| **Stale selector** | `strict mode violation`, `locator … not found`, `resolved to N elements` |
| **Timeout** | `Timeout XXXms exceeded`, `waiting for locator`, `waitForSelector` |
| **Wrong assertion** | `expect(received).toBe(expected)`, `toHaveURL`, `toHaveText` mismatch |
| **Auth / session** | redirect to `/login` in stack, `storageState` missing, `401` |
| **Navigation error** | `net::ERR_`, `ERR_CONNECTION_REFUSED`, `404` |
| **Flaky** | last retry `status: passed` — not a hard failure |

Apply first matching category top-to-bottom.

---

## Step 4 — Suggest a fix per category

**Stale selector** → Re-snapshot the page and regenerate the POM.
Run: `/generate-tests docs/specs/<spec>.md`

**Timeout** → Element never appeared. Check if it requires a prior action (expand
panel, wait for load). Add `await page.waitForLoadState('networkidle')` before the
step, or raise `actionTimeout` in `tests/fixtures/timeouts.ts`.

**Wrong assertion** → Verify expected value against the live app.
If app changed: update `docs/specs/<spec>.md` line N → re-run `/generate-tests`.

**Auth / session** → Delete stale auth files and re-authenticate:
```bash
# bash
rm playwright/.auth/*.json
npx playwright test --project="admin setup"

# PowerShell
Remove-Item playwright/.auth/*.json
npx playwright test --project="admin setup"
```

**Navigation error** → Confirm `BASE_URL` in `envs/.env` is reachable.

**Flaky** → No immediate fix needed. If it recurs, add
`await page.waitForLoadState('networkidle')` before the unstable step.

---

## Step 5 — Report

```
Failures: X of Y tests  (Z flaky — passed on retry)

┌─ tests/specs/shopping-cart.spec.ts
│  Spec: docs/specs/shopping-cart.md
│
│  ✗ buyer can add product to cart             [spec line 4]
│    Category : Stale selector
│    Error    : locator('#add-to-cart') resolved to 0 elements
│    POM      : tests/pages/public/ShoppingCartPage.ts:12
│    Fix      : /generate-tests docs/specs/shopping-cart.md
│    Assets   : test-results/buyer-can-add-product/screenshot.png
│
│  ✗ cart total updates after quantity change  [spec line 9]
│    Category : Wrong assertion
│    Error    : expect('$24.00').toBe('$12.00')
│    Fix      : Verify price → update docs/specs/shopping-cart.md line 9

Quick actions:
  Stale selectors  → /generate-tests docs/specs/<spec>.md
  Auth issues      → rm playwright/.auth/*.json && npx playwright test --project="admin setup"
  Re-run failures  → npx playwright test --only-failures
  Open traces      → npx playwright show-trace test-results/<name>/trace.zip
```

Use `✗` for hard failures, `~` for flaky. List asset paths only when the file exists.
