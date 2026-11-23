# NathanTidball.com

Static personal website. No build step, database, cookies, or analytics.
The artwork development demo uses a locally vendored OpenSeadragon viewer.
Vercel deploys `main` to `https://www.nathantidball.com`. GitHub Pages also
publishes `main` from the repository root as a secondary preview. Only public website
files belong here; never commit credentials or private records.

## Local preview

Run `python3 -m http.server 8092 --bind 127.0.0.1`, then open
http://127.0.0.1:8092. If occupied, choose another free port in 8000–8099.
For a NUC preview viewed from the Mac, keep `nuc` connected for port forwarding.
This is a local preview, not a production server.

## Project direction and development pages

Read [NORTH_STAR.md](NORTH_STAR.md) for scope and validation limits.
`/dev/` is the directory of development pages, intentionally absent from the
homepage navigation and sitemap. Add every new experiment to that directory.
It includes the artwork viewer, `/ui/`, and the existing template previews.
Unlisted URLs and `noindex` are not access control; keep these pages public-safe.

**Artwork:** open `/dev/artwork/` for the 142-megapixel deep-zoom demo.
Read [Artwork viewing](docs/artwork-viewing.md) for the researched options,
tile preparation commands, hosting requirements, source attribution, and tests.
Keep multi-gigabyte originals and tile pyramids out of this website repository.

Run the dependency-free checks from the repo root (Python 3 and Node 18+):

```sh
python3 scripts/check-dev.py
node --test tests/artwork-viewer.test.cjs
python3 scripts/check-dev.py --remote
```

The remote check fetches the demo metadata and three sample tiles. These checks
do not replace browser testing; see the artwork guide for the interaction path.

## Design references

[Web page templates](web-templates/README.md) contains reusable site references
and standalone previews, starting with Ouros Materials.

## Meeting link

Share `https://nathantidball.com/meet`. GitHub Pages serves `meet/index.html`
(with a trailing-slash redirect), which immediately forwards visitors to Nathan's
Google Calendar booking page without JavaScript. A direct fallback link is
included. The personal site's meeting button uses a relative link so it also
works on localhost and the GitHub Pages preview. Augment links to the custom
domain, which must be connected before that button works. Update the Google
Calendar URLs in `meet/index.html` if the booking destination changes.

## Deployment

Commit and push to `origin/main` to trigger the existing Vercel production
integration. The Vercel commit status and Production deployment record report
completion. Verify the actual changed routes and assets at
`https://www.nathantidball.com` after deployment; a successful push alone does
not prove the new version is live.

GitHub Pages separately publishes to
`https://nate13tidball.github.io/nathantidball.com/`; it has no custom domain
configured as of November 23, 2026. The site uses root-relative asset/navigation
paths for its production domain, so the GitHub project-subpath preview is not
the production acceptance target. Preserve the existing Vercel domain setup.
The older `hosting/` installer targets a different domain and is not this site's
deployment command.

## Google Search Console

Add a Domain property for `nathantidball.com`, install Google’s generated DNS
TXT verification record, then submit `https://nathantidball.com/sitemap.xml`
and inspect/request indexing for the homepage after the domain is live.
Indexing and rankings are not guaranteed. Review existing biography/employment
claims for accuracy before promoting the site.

## Security and maintenance

Vercel serves the production site; no home router ports or workstation services
are exposed. Keep hosting, GitHub, and domain accounts protected with MFA/passkeys.
The page uses a restrictive meta CSP; inline CSS is allowed for the existing
single-file design. GitHub Pages does not support arbitrary response headers,
so header-only policies such as CSP frame-ancestors require another host or proxy.
Git history supports rollback; revert and push to redeploy. Check links,
domain renewal, HTTPS, and Search Console periodically.
