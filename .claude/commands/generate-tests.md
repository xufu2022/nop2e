---
name: generate-tests
description: Use when you have a spec file in docs/specs/ and need to generate Playwright page objects and spec files from it, or when spec bullets have changed and tests need regenerating.
---

# generate-tests

Spec-driven Playwright test generation. Reads a `docs/specs/*.md` file, clarifies ambiguities in one round-trip, explores the live app via MCP browser tools, then generates page objects and spec files. One spec at a time; no manifest — existing POMs discovered via Glob.

---

## Step 0 — Resolve target spec

**Source (priority order):**
1. Explicit argument → `Read` to validate; if missing stop, Glob `docs/specs/**/*.md` and list matches.
2. Last `ide_opened_file` tag this turn, only if under `docs/specs/` → tell user "Using active file: …"
3. Neither → stop, ask user to open a spec or pass path explicitly.

**Output path** mirrors docs/ under tests/specs/ (`.md` → `.spec.ts`):
```
docs/specs/foo.md        → tests/specs/foo.spec.ts        importPrefix='..'
docs/specs/admin/foo.md  → tests/specs/admin/foo.spec.ts  importPrefix='../..'
docs/specs/public/foo.md → tests/specs/public/foo.spec.ts importPrefix='../..'
```
If the output `.spec.ts` already exists → ask "Already generated. Regenerate?" and wait.

---

## Step 1 — Parallel reads

Fire all reads simultaneously:
```
Read  → docs/specs/<target>          (skip if already read in Step 0)
Read  → docs/pom-templates.md
Glob  → tests/pages/admin/*.ts
Glob  → tests/pages/public/*.ts
Glob  → tests/pages/admin/components/*.ts
Read  → envs/.env                    (extract BASE_URL + credentials)
```

**Parse the spec:**
- `role: admin | buyer | public` (default: `admin`) → determines auth, base class, output folder
- `url:` optional for nopCommerce; required for any other app or unlisted page
- Lines starting with `-` = test cases; `# Heading` = `test.describe` name (fallback: filename)

| role | authState | pomDir |
|---|---|---|
| admin | admin | tests/pages/admin |
| buyer | buyer | tests/pages/public |
| public | guest | tests/pages/public |

---

## Step 2 — Confirm & Clarify (one round-trip maximum)

Identify POM files that would be overwritten (from Step 1 Globs).

Flag ambiguities: vague actions ("manage", "handle"), missing assertion, conditional logic, auth state, AJAX vs navigation, component sub-folders.

**If nothing to overwrite AND no ambiguities** → skip entirely.
**Otherwise** → ask everything in ONE message (max 4 questions), wait for one reply, then proceed.

---

## Step 3 — Resolve pages

Map each test case to a URL using this priority:
1. `url:` field → derive sub-paths from bullet text (`/List`, `/Create`, `/Edit/{id}`)
2. Known routes in `docs/pom-templates.md § Known routes`
3. Convention: `/Admin/{Entity}/{Action}` for unlisted admin pages

Deduplicate — explore each unique URL once. If `url:` is absent and route cannot be inferred, add it as a clarification in Step 2.

---

## Step 4 — MCP exploration

Use `browser_snapshot` (accessibility tree) — never raw HTML. Load core browser tools (navigate, snapshot, fill, click) in one `ToolSearch` call before starting.

**Before exploring error states:** grep existing `_*.ts` POMs for known error patterns. Reuse if found; only trigger errors via browser when the locator genuinely cannot be inferred.

**Filling forms:** use `browser_fill_form` (one call) not per-field `browser_type`.

### 4a. Authenticate (once, skip for guest)
Navigate to `BASE_URL/login`, fill credentials, submit. Verify URL changed away from `/login`. If still on `/login`, retry with admin credentials once.

### 4b. Navigate and snapshot each unique URL

Snapshot the minimum region that covers the test cases:

| Test case signals | Snapshot target |
|---|---|
| create / edit / fill / submit / save | `main form` |
| view list / search / filter / sort / delete | `main` (table region) |
| cart count / wishlist / header / nav | full page (no target) |
| dialog / modal / confirm | trigger first, then `[role="dialog"]` |
| mixed | `main` |

First navigation: take a full-page snapshot to identify the content region, then use that region as `target` for all remaining snapshots. Fall back to full-page only when a test case explicitly needs outside that region.

For pages generating multiple component POMs: one full-page snapshot, extract all component elements from it — no re-navigation.

### 4c. Dynamic content
- Expand tabs/accordions only if a test case explicitly touches that section.
- After AJAX clicks (Add to cart, Search, Delete): wait for network response before navigating. Confirm via count change, row change, or success notification. Use `browser_evaluate` if the DOM update isn't visible in an immediate snapshot.

### 4d. Selector priority
1. `page.getByRole('button', { name: 'Save' })`
2. `page.getByLabel('Email')`
3. `page.getByPlaceholder('Search…')`
4. `page.locator('#elementId')`
5. `page.locator('[data-attribute]')`
✗ Never CSS class selectors. Flag uncertain selectors with `uncertain=true`.

---

## Step 5 — Write page object files

Follow `docs/pom-templates.md` for TypeScript structure, base class names, and import paths.

**`_<Name>.ts` — always overwrite.** Locator declarations only; extends the role's base class.
**`<Name>.ts` — write only if not on disk.** Contains `navigate()` and action methods; never overwrite.

Wait strategy:
| Outcome | Use |
|---|---|
| URL changes | `waitForNavigation({ waitUntil: 'domcontentloaded' })` |
| URL stays (AJAX) | `waitForResponse(resp => resp.url().includes('…'))` |
| Uncertain | `waitForResponse` — safe either way |

Rules: all locators `readonly` in base only; all methods in extension only; no default exports; create parent directories as needed.

---

## Step 5b — Detect and generate data factories

Scan bullets for write actions: `create`, `submit`, `fill`, `register`, `add`, `place`, `post`, `send`, `update`, `edit`.
Skip read-only actions: `view`, `search`, `filter`, `sort`, `navigate`, `see`, `open`.
Skip cart/wishlist "add" actions — no factory needed, they use existing products.

For each write action, infer entity from the bullet noun (`order`, `user`, `product`, `contact`, `review`, etc.).

**For each entity:**
1. `Glob → utils/factories/{entity}.factory.ts` — if exists, reuse, skip to step 3.
2. Generate using form fields discovered in Step 4. Map each field label to a faker call using the table in `docs/pom-templates.md § Faker field-mapping table`. Write to `utils/factories/{entity}.factory.ts`.
3. Add a re-export line to `tests/fixtures/index.ts` under the `// Factory re-exports` comment (skip if already present):
   ```ts
   export { fake{Entity} } from '../../utils/factories/{entity}.factory';
   ```
4. Record `{ entity → fake{Entity} }` for Step 6 — no separate import path needed.

---

## Step 6 — Write spec file

Output path: `docs/specs/admin/foo.md → tests/specs/admin/foo.spec.ts` (see Step 0).
Follow `docs/pom-templates.md` for spec structure, fixture names, and storageState pattern.

Rules:
- Import `test` and `expect` from fixtures, never from `@playwright/test`
- One `test.describe` per feature, one `test()` per bullet
- For conditional: `if (count === 0) { test.skip(); }`
- Create parent directory if needed

**Factory usage:** Factories are re-exported from `tests/fixtures/index.ts`, so no separate import is needed — add factory names to the existing fixtures import:
```ts
import { test, expect, fakeUser } from '../../fixtures';
```
Inside each write test call the factory at the top: `const data = fake{Entity}()`, then use `data.fieldName` instead of inline string literals. Intentionally invalid values (wrong password, bad email, missing field) stay hardcoded — do not use factories for negative test data. Call the factory once per test, not once at describe level.

---

## Step 7 — Report

List: source spec, each POM (`✓` new / `~` overwritten), each factory (`✓` new / `→` reused), the spec file, uncertain selectors with reasons, and the `npx playwright test <path>` run command.
