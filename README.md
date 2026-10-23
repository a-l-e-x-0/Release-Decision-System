# Release Decision System

A small web app that looks at a list of tickets and decides whether a release should go ahead.

## What it does

- Classifies each ticket as `RELEASE_BLOCKER`, `PRIORITY`, `UNASSIGNED`, `ACTIVE` or `DONE`.
- Shows a release decision: `BLOCK`, `REVIEW` or `RELEASE`, plus counters and remaining active hours.
- Lets you search tickets by ID, and add, edit and delete tickets.
- Saves your tickets in the browser (localStorage), and the decision updates after every change.

## How to run

1. Install [Node.js](https://nodejs.org).
2. Compile the TypeScript:
   ```
   npx tsc 
   ```
   This creates `script.js`.
3. Open `index.html` in your browser.

## Reset the data

Run this in the browser console, then reload:

```js
localStorage.removeItem("tickets");
```

## Files

- `index.html` - page structure
- `style.css` - styling
- `script.ts` - app logic (compiles to `script.js`)