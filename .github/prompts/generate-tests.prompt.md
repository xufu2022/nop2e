# generate-tests

Spec-driven Playwright test generation. Processes one spec file at a time — reads
the target `docs/specs/*.md`, clarifies ambiguities in one round-trip, explores the live
app with MCP browser tools (accessibility tree snapshots — no raw HTML), then generates
page objects and spec files directly.

---

## Step 0 — Resolve target spec

### 0a. Determine which spec file to process (in priority order)

1. **Explicit argument** — user passed a path (e.g. "generate tests for docs/specs/foo.md") → use that path.
   **Immediately validate:** read the file. If it does not exist, stop, tell the user the path was not found,
   list all `docs/specs/**/*.md` matches. Do not proceed further.

2. **No argument given** — ask the user to either open a `docs/specs/*.md` file in their IDE and re-run,
   or pass the path explicitly. Do not proceed further.

### 0b. Prior generation check

Derive the output spec path:
```
docs/specs/foo.md           → tests/specs/foo.spec.ts
docs/specs/admin/foo.md     → tests/specs/admin/foo.spec.ts
docs/specs/public/foo.md    → tests/specs/public/foo.spec.ts
```

- **Output spec file exists on disk** → tell the user "Already generated. Regenerate?" and wait.
- **Output spec file does not exist** → proceed to Step 1 immediately.

---

## Step 1 — Parallel reads

Fire all reads simultaneously:

```
Read  → docs/specs/<target spec file>
Read  → docs/pom-templates.md
Glob  → tests/pages/admin/*.ts
Glob  → tests/pages/public/*.ts
Glob  → tests/pages/admin/components/*.ts   (if exists)
Read  → envs/.env  (extract BASE_URL + credentials)
```

Parse the spec file:

**Required fields:**
1. `role: admin | buyer | public` — determines auth context, base class, and output folder
2. At least one bullet line (`- description`) — each bullet becomes one `test()`

**`url:` — required for non-nopCommerce sites, optional for nopCommerce:**
- Provide the base path for the feature: `url: /orders`
- The skill appends sub-paths from bullet text: `/orders/new`, `/orders/:id`, etc.
- When absent, falls back to the nopCommerce known routes table + `/Admin/{Entity}/{Action}` convention
- Always provide `url:` when working on a non-nopCommerce app, or any page not in the known routes table

Optional elements:
- Frontmatter block (`---`) — just a wrapper, not required
- `# Heading` — used as `test.describe` name; falls back to filename if absent
- `name:`, `description:` in frontmatter — metadata only, not used during generation

`role:` maps to authState and pomDir:
- `role: admin`  → authState=admin,  pomDir=tests/pages/admin
- `role: buyer`  → authState=buyer,  pomDir=tests/pages/public
- `role: public` → authState=guest,  pomDir=tests/pages/public

Default role is `admin` if not specified.

Extract all lines starting with `-` as test cases.

Derive output paths (mirror docs/ structure under tests/specs/):
```
docs/specs/foo.md            → tests/specs/foo.spec.ts          importPrefix='..'
docs/specs/public/bar.md     → tests/specs/public/bar.spec.ts   importPrefix='../..'
docs/specs/admin/baz.md      → tests/specs/admin/baz.spec.ts    importPrefix='../..'
```

---

## Step 2 — Confirm & Clarify (one round-trip maximum)

Using the POM Globs from Step 1, identify files that would be overwritten.

Check every test case for ambiguity:
- Vague action ("manage", "handle") — what exact steps?
- Missing assertion — redirect / toast / record appears / count changes?
- Conditional logic ("if X exists") — skip gracefully or assert present?
- Auth state — anonymous guest or logged-in user?
- AJAX vs navigation — does the action change page URL or fire a background request?
- Components — should they go in a sub-folder (e.g. admin/components/)?

**If nothing to overwrite AND everything clear** → skip this step entirely.

**Otherwise** → ask everything in ONE message (max 4 questions).
Include the overwrite choice as one question. Wait for one reply, then proceed.
Never ask follow-up questions unless an answer introduces a genuinely new ambiguity.

---

## Step 3 — Resolve pages

From the clarified test cases, determine which pages need MCP exploration.

**URL resolution — in priority order:**
1. `url:` field in the spec → use as base path, derive sub-pages from bullet text
   - "view list" → `{url}/List` or `{url}`
   - "create" → `{url}/Create` or `{url}/new`
   - "edit" → `{url}/Edit/{id}` or `{url}/:id/edit`
2. Known project routes (see `docs/pom-templates.md` § Known routes)
3. App URL convention for anything not in the table (see `docs/pom-templates.md`)

If `url:` is absent and the route cannot be inferred — include it as a clarification question in Step 2.

Deduplicate — if multiple test cases or components share the same URL, explore it once
and extract all relevant elements in one snapshot session.

Build the pages list with POM output paths for each page and any component sub-files.
All pages are always explored and regenerated.

---

## Step 4 — MCP exploration

Use `browser_snapshot` for all page inspection — never request raw HTML.
The snapshot returns an accessibility tree: roles, labels, interactive elements.
Credentials are already loaded from Step 1 — do not re-read `.env`.
Only snapshot elements relevant to the test cases — do not expand tabs or accordions
unless a test case explicitly requires that section.

**Before starting:** load the core browser tools (navigate, snapshot, type, click) in a single
tool-fetch call. Load additional tools (evaluate, wait_for, network_request) only if a specific
test case requires them — do not speculate upfront.

**Before exploring error states:** grep existing `_*.ts` POMs for known project patterns
(`.message-error`, `.field-validation-error`, etc.). If found, reuse the pattern and mark as
uncertain rather than reproducing the error in the browser. Only submit forms via MCP when the
error locator genuinely cannot be inferred from existing code.

**Filling forms:** use `browser_fill_form` (one call) instead of one `browser_type` per field.

### 4a. Authenticate (once, only when needed)

Navigate to `BASE_URL/login`, fill Email and Password fields, click submit. Skip for `authState=guest`.
Verify by URL after submit: changed away from `/login` = success; still `/login` = wrong credentials
— retry with admin role once (don't try alternative selectors).

### 4b. Navigate and snapshot each unique URL

```
browser_navigate  → BASE_URL + <page path>
browser_snapshot  → target: 'main'
```

**Always scope snapshots to `target: 'main'`** — the header and footer are identical on every page
and add no locator value. Only take a full-page snapshot (omit `target`) when you specifically need
to inspect header elements such as cart count, wishlist count, or login state.

For pages that generate multiple component POMs (e.g. /Admin → Dashboard + LeftMenu + TopMenu):
- Take ONE snapshot of the page (full-page, since you need header/nav)
- Extract elements for ALL components from that single snapshot
- No need to navigate again for each component

### 4c. Explore dynamic content (only when test cases require it)

- **Tabs / accordions / panels** → expand only if a test case explicitly touches that section
- **Data tables** → note column headers + row action buttons
- **After any AJAX button click** (Add to cart, Add to wishlist, Remove, Search, Delete) — always wait
  for the network response **before** navigating away or taking a snapshot. Do not click and immediately
  navigate; the DOM update may not have completed.

  Confirm the action succeeded by checking one of:
  - A count changed in the header (e.g. wishlist qty went from 0 to 1)
  - A row appeared or disappeared in a table
  - A success notification appeared

  If the change is not visible within a snapshot taken immediately after the click, use `browser_evaluate`
  to trigger the action via the page's own JS and wait before navigating.

### 4d. Selector priority
1. `page.getByRole('button', { name: 'Save' })`
2. `page.getByLabel('Product name')`
3. `page.getByPlaceholder('Search...')`
4. `page.locator('#elementId')`
5. `page.locator('[data-attribute]')`
Never use CSS class selectors (`.k-button-abc123`)

Flag uncertain=true for any selector that may not be stable.

---

## Step 5 — Write page object files

Use `docs/pom-templates.md` for exact TypeScript structure, base class names, and import paths.

Each POM is two files:

**`_<Name>.ts` — always overwrite.** Locator declarations only, no methods. Extends the base class
for its role (see `docs/pom-templates.md`).

**`<Name>.ts` — write only if not on disk.** Contains `navigate()` and action methods.
Never overwrite — manually maintained after first creation.

**Wait strategy:**

| What happens | Use |
|---|---|
| URL changes (save, redirect) | `waitForNavigation({ waitUntil: 'domcontentloaded' })` |
| URL stays (AJAX, grid refresh) | `waitForResponse(resp => resp.url().includes('...'))` |
| Uncertain | `waitForResponse` — safe either way |

Rules:
- All locators `readonly` in the base only; all methods in the extension only
- No default exports, no CSS class selectors
- Create parent directories as needed
- On regeneration: overwrite `_<Name>.ts`, skip `<Name>.ts`

---

## Step 6 — Write spec file

Output path mirrors the docs/ subfolder:
```
docs/specs/admin/foo.md  →  tests/specs/admin/foo.spec.ts
```

Use `docs/pom-templates.md` for the spec structure, fixture names, import depth, and storageState pattern.

Rules:
- Import `test` and `expect` from fixtures, never from `@playwright/test`
- One `test.describe` per feature, one `test()` per bullet
- For conditional: `if (count === 0) { test.skip(); }`
- Create parent directory if needed

---

## Step 7 — Report

Output a brief summary: source spec path, each generated POM (`✓` new / `~` overwritten), the spec file,
any selectors flagged uncertain with a reason, and the `npx playwright test <path>` run command.
