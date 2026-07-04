---
name: new-page-object
description: Generate a Page Object class by exploring a URL in the browser
---

Generate a Page Object class for a given URL by exploring the live page.

## Project conventions

- Page objects live in `pages/` and are named `<PageName>Page.js`
- Use CommonJS: `module.exports = { ClassName }`
- Locators are defined in the constructor
- Each user action is a separate async method
- Existing example: `pages/ZeroHomePage.js`

## Steps

1. Ask the user for:
   - URL of the page
   - Name for the Page Object class (e.g. `LoginPage`)
   - Which elements/actions are important (e.g. "login form", "submit button", "navigation menu")

2. Use the `playwright-cli` skill to explore the page:
   - Open the URL
   - Take a snapshot
   - Identify the relevant elements and their best locators (prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors when possible)
   - Interact with key elements to confirm locators are correct

3. Generate the Page Object file `pages/<ClassName>.js`:
   - Constructor with `this.page = page` and one property per locator
   - `navigate()` method with `page.goto(url)`
   - One async method per action (click, fill, select, etc.)
   - Getter methods for reading page state (title, URL, text content)

4. Show the created file and confirm it looks correct with the user.
