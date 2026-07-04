---
name: run-tests
description: Run Playwright tests, show results and explain failures
---

Run the Playwright tests and report results clearly.

## Steps

1. Ask the user which tests to run (all, specific file, or specific test name). If they don't specify, run all tests.
2. Run the appropriate command:
   - All tests: `npx playwright test`
   - Specific file: `npx playwright test tests/<file>.spec.js`
   - Headed mode (if user wants to see the browser): add `--headed`
   - Specific browser: add `--project=chromium` (or firefox, webkit)
3. Show a summary:
   - How many passed / failed
   - For each failed test: show the test name, expected vs received values, and line number
4. If any test failed, explain in plain language what went wrong and suggest a fix.
