# Dealiva website

This is a static website made of plain HTML, CSS and JavaScript. It needs no build step and no database, and it runs on any web host.

## Files

| Path | What it is |
|---|---|
| `index.html` | Home page |
| `how-it-works.html`, `deals.html`, `about.html`, `contact.html` | Main pages |
| `privacy-policy.html`, `terms.html`, `cashback-terms.html`, `refund-policy.html`, `cookie-policy.html` | Policies |
| `404.html` | "Page not found" page |
| `assets/js/config.js` | **Settings**: support email, form key, Meta Pixel ID |
| `data/deals.js` | **Offers list**: add your approved affiliate offers here |
| `assets/css/style.css` | All styles (brand colours are at the top) |
| `assets/js/main.js` | Menu, offers, Click IDs, contact form and cookie consent |
| `assets/img/` | Logo (`logo.svg`, `logo-white.svg`, `mark.svg`), app icons, social share image |
| `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `site.webmanifest` | Browser and phone icons |
| `sitemap.xml`, `robots.txt` | For search engines |
| `_headers` (Netlify/Cloudflare) and `.htaccess` (Apache/Hostinger) | Security headers, HTTPS redirect, 404 page |

## Publish it

Upload the **contents** of this folder (not the folder itself) to the root of `dealiva.in`.

- **Netlify:** drag the folder onto app.netlify.com/drop, then add the custom domain `dealiva.in`.
- **Cloudflare Pages:** create a project, choose "Direct upload" and upload the folder.
- **Hostinger or cPanel:** upload everything into `public_html`. The `.htaccess` file handles HTTPS and the 404 page. Enable SSL for the domain first.

After it's live, submit `https://dealiva.in/sitemap.xml` in Google Search Console.

## Contact form

The form works as soon as the site is live. Without a key, it opens the visitor's email app with the message already filled in and addressed to support@dealiva.in.

To have messages sent straight from the page:

1. Go to https://web3forms.com and create a free access key for `support@dealiva.in`.
2. Paste the key into `web3formsKey` in `assets/js/config.js`.

## Adding offers

Only list an offer after the retailer's affiliate programme (direct, or through a network such as Cuelinks, INRDeals, vCommission or Admitad) has approved Dealiva.

1. Open `data/deals.js`. The comment at the top lists every field and shows the format.
2. Add one `{ ... }` block per offer inside `window.DEALIVA_DEALS = [ ... ];`, separated by commas.
3. In the `url`, put `{clickid}` where your network expects a sub-ID (for example `&subid={clickid}`). Dealiva replaces it with the shopper's Click ID, so the network's report shows which click led to which order and you can match claims.
4. Offers with a past `validTill` date hide automatically.

The search box, category filters and sorting appear automatically once there is at least one offer.

## Meta Pixel (optional)

Add your Pixel ID to `metaPixelId` in `assets/js/config.js`. A consent banner then appears, and the pixel loads only for visitors who click **Allow**. The Cookie Policy already describes this.

## Processing claims

Claims arrive by email with the order ID, Click ID and UPI ID. For each claim:

1. Find the Click ID in your affiliate network's sub-ID report to confirm the order was tracked, then email the shopper that it's **Pending**.
2. When the network marks the commission as approved, pay the cashback by UPI within 7 working days and email the shopper the UPI reference.
3. If the network rejects the order, email the shopper the reason (status **Declined**).

## Before Meta Business verification

- Meta checks that the business details on your website match your verification documents. If Dealiva is run by a registered company, add its legal name and registered address to the footer and the Contact page. Many verifications also need a working phone number.
- Name a Grievance Officer on the Contact page and in the Privacy Policy. The IT Rules expect a named officer.
- Set up the support@dealiva.in mailbox and make sure it receives mail.
- Add at least a few real, approved offers to `data/deals.js`.
- Have a lawyer review the policy pages, especially if your process differs from the one described. The 10-day claim window, 7-working-day payout, no minimum payout and UPI-only payouts are all stated in the policies, so change them there if your process is different.
