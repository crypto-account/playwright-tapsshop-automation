---
name: new-test
description: Create a new Playwright test file using the Page Object Pattern
---

Create a new Playwright test file following the project conventions.

## Project conventions

- Test files live in `tests/` and are named `TC<number>_<Description>.spec.js`
- Page objects live in `pages/` and are named `<PageName>Page.js`
- Project uses CommonJS (`require`/`module.exports`), NOT ES modules
- Existing example: `tests/TC001_ZeroKontakt.spec.js` and `pages/ZeroHomePage.js`

## Steps

1. Ask the user for:
   - Test ID (e.g. TC-002)
   - Short description of what the test does
   - URL of the page to test
   - Steps to perform (navigate, click, fill, assert, etc.)

2. Use the `playwright-cli` skill to open the page in a browser and explore its structure:
   - Navigate to the URL
   - Take a snapshot to identify element locators
   - Interact with relevant elements to confirm locators work

3. Create or update the Page Object in `pages/`:
   - Add locators as constructor properties
   - Add one method per action

4. Create the test file in `tests/TC<number>_<Description>.spec.js`:
   - Import `test` and `expect` from `@playwright/test`
   - Import the Page Object(s)
   - Write the test using page object methods
   - Add assertions at the end

5. Run the test with `npx playwright test tests/<file>.spec.js --project=chromium` to verify it passes.
