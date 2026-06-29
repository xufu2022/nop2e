# Filename suggestion tool

Simple helper to suggest existing workspace filenames from a short query.

How to run

```bash
# from workspace root
npm run suggest-filename -- "product list"
```

Notes
- The script searches the repo recursively and ignores common folders like `node_modules`, `.git`, and `playwright-report`.
- It ranks suggestions by simple fuzzy matching and returns the top matches.

Files
- tools/suggest-filename.js — the CLI tool
