# Vital Movement Center

Responsive static landing page for Vital Movement Center, built with plain HTML, CSS and JavaScript.
No build step or package installation is required.

## Files
- `index.html` — page structure and content
- `style.css` — layout, light and dark theme, hero entrance, pop-up styles
- `head.js` — small script loaded first in `<head>`: applies a saved light/dark choice before the page is drawn and starts the hero entrance
- `app.js` — mobile menu, sticky header, light/dark button, back-to-top button and the "Learn more" pop-up
- `motion.js` — scroll reveals, the moving golden band and the hero collage depth
- `service-info.js` — content of the "Learn more" pop-ups (see below)
- `fonts/` — self-hosted web fonts (DM Sans, Fraunces Italic, Barlow Condensed ExtraBold) with their SIL Open Font License files
- `logo-320.jpg` — logo for the header, hero seal and footer
- `favicon-32.png`, `apple-touch-icon.png` — browser and home-screen icons
- `logo.png` — full-size logo (source file for the smaller versions)
- `welcome-bg.jpg` — welcome banner shown in the hero
- `PLACEHOLDERS.md` — content that is still missing before going live

## Editing the "Learn more" pop-ups
All pop-up texts live in `service-info.js`, one entry per service:

```js
taping: {
  title: "Kinesiology Taping",
  summary: "Short introduction …",
  points: ["Supports movement", "…"],
  sectionsTitle: "How kinesiology tape is used",
  sections: [
    { heading: "Allowing motion", text: "…" }
  ],
  source: "Where the information comes from (optional)"
}
```

- To add information, add blocks to `sections` (and set `sectionsTitle` if it is empty).
- Empty `sections`, `sectionsTitle` or `source` are simply not shown.
- The key (`taping`, `training`, `massage`) matches `data-info="…"` on the "Learn more" button in `index.html`. A new service needs a new key and a button with the same value.
- Use US spelling and plain text (no HTML).
- After any change to `style.css`, `head.js`, `app.js`, `motion.js` or `service-info.js`, raise the `?v=` number in `index.html` so browsers load the new version.

## Light and dark mode
On the first visit the page follows the device setting. The sun/moon button in the navigation (inside the menu on small screens) switches the mode; the choice is stored in the browser (`localStorage`, no cookie) and used on later visits. Colors are defined once in `style.css` as `light-dark(light, dark)` pairs.

## Hosting
This project is deployed with GitHub Pages on every push to `main`; the whole repository folder is published. It can also be uploaded to a standard Apache/LiteSpeed host such as Hostinger. The included `.htaccess` is intended for Apache/LiteSpeed hosting and is not used by GitHub Pages.

The page has a strict Content Security Policy (`index.html`, `<meta http-equiv="Content-Security-Policy">`): only files from the site itself are loaded, so styles and scripts must stay in their own files (no inline `<style>`, `<script>` or `style="…"`).

## Before going live
See `PLACEHOLDERS.md` for missing content (legal notice, privacy policy, opening hours, domain).
