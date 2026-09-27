# The VALE – partner page

A single, static page for reaching future sponsors. It replaces the Canva partner-brief PDFs. The main audience is sponsors giving unrestricted money.

Internally we're after unrestricted funding, but the page never says "no strings attached" to sponsors. Keep that wording off the page.

There's no build step. Open `index.html` in a browser, or serve the folder with anything static:

```sh
python3 -m http.server 8000   # then visit http://localhost:8000
```

## What's in here

| Path | What it is |
|---|---|
| `index.html` | All content: hero, logo wall, numbers, why sponsorship matters, tiers, call to action |
| `styles.css` | Brand tokens (colours and fonts) at the top, then one block per section |
| `script.js` | Scroll reveals, count-up numbers and click ripples (all switched off under `prefers-reduced-motion`) |
| `assets/logos/` | Partner logos as transparent WebP, trimmed to their edges |
| `assets/fonts/` | Self-hosted Roboto and Roboto Condensed (no Google Fonts request, so no GDPR issue) |

## Common edits

- **Add a partner logo:** drop a transparent PNG or WebP into `assets/logos/`, then copy one `<li class="logo">` in `index.html`. The tile scales and greys it automatically. It turns full colour on hover.
- **Update the numbers:** edit both the `data-count` attribute and the visible text of each `.stat__n`. The visible text is what people see without JavaScript.
- **Change the tiers:** edit the three `<article class="tier">` blocks. Each button opens an email with the tier name in the subject.

## Brand

Follows The VALE Brand Guide:
- **Colours:** Main Teal `#94DED8`, Orange `#FFA023` and the light and grey supporting shades.
- **Titles:** Roboto Condensed, bold, uppercase.
- **Body:** Roboto Light.
- **Language:** British English with the Oxford comma.

The hero illustration redraws the VALE mark (mountains mirrored in water inside a circle, with a sun). The Ripple, Wave and Tide tiers show up as concentric rings throughout the page.
