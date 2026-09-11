# Music Cue Generator

A simple static web app for performers.

## What it does

1. A performer selects their instrumental part.
2. They press Start.
3. The app displays each number in that part's configured range exactly once, in a random order.
4. The wait between cues is randomized within the configured minimum and maximum.
5. At the end of the cycle, the performer can press Start again.

## Changing settings

Open `app.js` and edit the `PARTS` list near the top.

Example:

```js
{ name: "Violin 1", min: 1, max: 10, intervalMin: 5, intervalMax: 9 }
```

means Violin 1 will use numbers 1 through 10, with 5–9 seconds between cues.

## Files

- `index.html` – page structure
- `style.css` – appearance
- `app.js` – settings and behaviour
