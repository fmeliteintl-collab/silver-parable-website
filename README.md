# SILVER PARABLE website

Static site (HTML, CSS, JS). No build step. Hosted on Cloudflare Pages.

## Before launch: fill these in
1. **Formspree (done):** the Contact page has two tabs, each posting to its own form:
   - General Contact: `https://formspree.io/f/xgaoyydz`
   - Business & Licensing: `https://formspree.io/f/xaeqjjkw` (fields: name, email, company, inquiry_type, message)
   Both use a hidden honeypot field (`_gotcha`), HTML validation and a lock against double submits. In each Formspree form's settings, also enable spam filtering/reCAPTCHA and set the notification email.
   **Newsletter: pending.** The signup on the home page is intentionally disabled and shows "Coming soon". It does not use Formspree. When you choose an email marketing service, replace that form with the service's embed or API endpoint.
2. **Audio:** add the RISE preview as `assets/rise.mp3` (confirm your Suno plan allows commercial use first). Until then the player shows a "not available" note.
3. **Streaming and social links:** replace `href="#"` on links marked `data-soon`. Links left as `#` automatically show dimmed as "coming soon".
4. **Cover art:** `assets/rise-cover.jpg` is 1254px. Streaming services need 3000x3000 px, so upscale a copy for distribution.
5. **Email:** set up hello@silverparable.ca (Cloudflare Email Routing is free).
6. **Copy:** read the About text and edit it to your own voice.

## Test after deploying
Send one message from each Contact tab and confirm it arrives in Formspree and your inbox. Open `/contact.html#business` to link directly to the Business & Licensing tab.

## Deploy
1. Create a GitHub repository (e.g. `silverparable-site`) and upload everything in this folder to the root.
2. Cloudflare dashboard > Workers & Pages > Create > Pages > Connect to Git > select the repo.
3. Build command: leave empty. Build output directory: `/` (root). Save and deploy.
4. Pages project > Custom domains > add `silverparable.ca` (the domain's DNS must be on Cloudflare, or follow the CNAME instructions shown).
5. Every push to `main` redeploys automatically.

## Notes
- Trademark clearance is still open. Keep spending on the brand light until CIPO/USPTO checks are done.
- Replace `assets/logo.png` with an SVG version when you have one.
- Deployment platform: Cloudflare Pages. Automatic deployment from the main branch.
