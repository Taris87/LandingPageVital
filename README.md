# Vital Movement Center — Landing Page

Responsive static website in the supplied black-and-gold brand style.

## Project structure
- `index.html` — semantic page structure and content
- `styles.css` — responsive styling, animation and reduced-motion support
- `js/main.js` — accessible mobile navigation, reveal effects and safe contact rendering
- `js/config.js` — business contact details (currently blank placeholders)
- `assets/` — lightweight SVG brand artwork used by the site
- `.htaccess` — optional Apache/LiteSpeed headers and caching; GitHub Pages ignores this file

## GitHub Pages
The repository deploys automatically with GitHub Actions on pushes to `main`.
The public site is expected at https://taris87.github.io/LandingPageVital/.

## Before launch
1. Add verified phone, email, address and Facebook details to `js/config.js`.
2. Verify service descriptions and legal business details with the business owner.
3. Add the appropriate legal notice/imprint and privacy policy for the business jurisdiction.
4. Google Fonts are loaded externally; self-host them if a fully local asset setup is required.

This is a static site: no contact form, backend, database, tracking, analytics or cookies are included. The .htaccess file applies only on compatible Apache/LiteSpeed hosting, not GitHub Pages.