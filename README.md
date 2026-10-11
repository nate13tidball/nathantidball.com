# NathanTidball.com

Static personal website. No dependencies, database, cookies, or analytics.
GitHub Pages publishes `main` from the repository root. Only public website
files belong here; never commit credentials or private records.

## Local preview

Run `python3 -m http.server 8000 --bind 127.0.0.1`, then open
http://127.0.0.1:8000. This is a local preview, not a production server.

## Meeting link

Share `https://nathantidball.com/meet`. GitHub Pages serves `meet/index.html`
(with a trailing-slash redirect), which immediately forwards visitors to Nathan's
Google Calendar booking page without JavaScript. A direct fallback link is
included. Both websites' meeting buttons use this short URL; update the Google
Calendar URLs in `meet/index.html` if the booking destination changes.

## Finish domain setup

1. Confirm ownership of nathantidball.com. Enable MFA and renewal on the registrar account.
2. Verify the domain under GitHub account Settings → Pages using GitHub’s generated DNS TXT record; keep that record.
3. Set the repository Pages custom domain to `nathantidball.com` (creates CNAME).
4. Configure DNS using the current official GitHub instructions below. Preserve mail and verification records; avoid wildcard DNS.
5. Once the certificate is issued, enable Enforce HTTPS. Verify both apex and www, redirects, sitemap, robots.txt, and a nonexistent URL (404).

https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

Until the custom domain is connected, the GitHub Pages URL is a temporary preview.
Canonical metadata and the sitemap intentionally target the final domain.

## Google Search Console

Add a Domain property for `nathantidball.com`, install Google’s generated DNS
TXT verification record, then submit `https://nathantidball.com/sitemap.xml`
and inspect/request indexing for the homepage after the domain is live.
Indexing and rankings are not guaranteed. Review existing biography/employment
claims for accuracy before promoting the site.

## Security and maintenance

GitHub serves the public site; no home router ports or workstation services
are exposed. Keep GitHub and domain accounts protected with MFA/passkeys.
The page uses a restrictive meta CSP; inline CSS is allowed for the existing
single-file design. GitHub Pages does not support arbitrary response headers,
so header-only policies such as CSP frame-ancestors require another host or proxy.
Git history supports rollback; revert and push to redeploy. Check links,
domain renewal, HTTPS, and Search Console periodically.
