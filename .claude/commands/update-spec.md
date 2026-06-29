# update-spec

Writing aid for updating spec files in `docs/specs/`. You describe what you want to
add, change, or remove in plain words — the skill translates it into proper spec
format, shows a preview, and writes the file after you confirm.

Spec files are updated manually and intentionally — run `/generate-tests` separately
when you're ready to regenerate test files.

---

## Spec file formats

**New format (with frontmatter — preferred):**
```markdown
---
name: product-management
description: admin catalog CRUD — create, edit, search, publish, bulk delete
role: admin
---

# Product Management

- test case — expected outcome
```

**Old format (no frontmatter — still supported):**
```markdown
# Product Management
role: admin

- test case — expected outcome
```

Both formats work. The `description:` field in frontmatter enables keyword matching
and documentation lookup in `/generate-tests` — add it when you update a spec.

---

## Step 0 — Locate spec file

Determine the target spec file in this priority order:

1. **Explicit argument** — user typed `/update-spec docs/specs/admin/products.md` → use that path.

2. **IDE open file** — no argument given, but a system-reminder shows a `docs/specs/` file
   open in the IDE → use it. Tell the user: "Using open file: docs/specs/..."

3. **Neither** — Glob `docs/specs/**/*.md`, read the first 15 lines of each file to extract
   frontmatter `name:` and `description:`. Match keywords from the user's message against
   those values — if one file clearly matches, use it and tell the user. Otherwise present
   the full list via AskUserQuestion and let the user pick.

---

## Step 1 — Read and display

Fire both reads in parallel:

```
Read → docs/specs/<target spec file>
Read → tests/specs/.manifest.json
```

Display the full current spec content (including frontmatter if present) so the user
has context for their edits. Note whether tests have already been generated (from manifest).

---

## Step 2 — Gather intent

Ask the user what they want to change using AskUserQuestion (one question):

> "What would you like to do with this spec?"

Options:
- **Add new test cases** — describe what you want to test in plain words
- **Refine existing wording** — a bullet is unclear or inaccurate
- **Remove a test case** — a test is no longer needed
- **Update name / description** — add or improve the frontmatter metadata
- (Other — free text for anything else)

Wait for one reply. The user's answer drives Step 3.

---

## Step 3 — Draft updated spec

### For test case changes (add / refine / remove)

Translate the user's plain description into well-formed spec bullets.

**Bullet format:** `verb phrase — expected outcome`

Good examples:
```
- admin exports product list to CSV — file downloads with correct column headers
- search returns no results — empty state message is visible
- buyer removes item from cart — cart total updates and item disappears
- admin creates product with duplicate SKU — validation error is shown
```

**Writing rules:**
- Use concrete action verbs: *navigates, clicks, fills, submits, exports, searches, creates, deletes, updates*
- Outcome must be observable: URL changes, element appears/disappears, toast shown, count updates, file downloads
- One line per test case — no sub-bullets, no parenthetical notes
- Keep it short: `subject verb object — observable result`

**What not to change:**
- Frontmatter fields the user did not mention
- The `# Feature Name` heading
- Existing bullets the user did not mention

### For frontmatter updates (name / description)

**`name:`** — kebab-case slug matching the spec filename:
- `docs/specs/admin/product-management.md` → `name: product-management`

**`description:`** — one plain-English sentence covering the key feature nouns and verbs:
- Good: `admin catalog CRUD — create, edit, search, publish, bulk delete`
- Good: `buyer checkout flow — address, payment, order confirmation`
- Bad: `this spec tests the product management page`

Help the user write the description in their own words, then rephrase it to match the
format above. Focus on: who does it (admin/buyer), what they do (verbs), what objects
are involved (nouns).

**If the spec has no frontmatter yet:**
- Add the frontmatter block at the top
- Move `role:` from the body into the frontmatter
- Show the user the full new file structure in the preview

---

## Step 4 — Preview

Show a diff-style preview of all proposed changes:

```
  ---
  name: product-management
+ description: admin catalog CRUD — create, edit, search, publish, bulk delete   (added)
  role: admin
  ---

  # Product Management

  - existing bullet (unchanged)
+ new bullet added by this update                                                  (added)
~ old wording → new wording                                                       (rephrased)
- bullet being removed                                                             (removed)
  - existing bullet (unchanged)
```

---

## Step 5 — Confirm and write

AskUserQuestion:

> "Write these changes to the spec file?"

Options:
- **Yes, write it** → write the file and report
- **No, adjust** → take the user's correction and re-draft (repeat Step 3)

---

## Step 6 — Report

```
Updated: docs/specs/admin/products.md

  + description added to frontmatter
  + 1 test case added
  ~ 1 test case rephrased

When ready to regenerate tests:
  /generate-tests docs/specs/admin/products.md
```

Use `+` for added, `~` for rephrased, `-` for removed.
