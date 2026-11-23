# North Star

## Goal

Maintain Nathan's personal website and support his stated goal of displaying
extremely detailed artwork with smooth exploration, including originals that
may be gigabytes in size. Keep an unlisted `/dev/` directory for experiments
and development previews. This direction comes from Nathan's November 21, 2026
request; the existing README establishes the static personal-site scope.

## Scope

- Keep the main site static and lightweight, with no build step or analytics.
- Use established open-source tools for tiled image viewing and preparation.
- Keep public-facing content distinct from development experiments. Development
  URLs are public, even when unlisted or marked noindex.
- Store large artwork originals and production tiles outside the website deployment.
  Do not establish paid hosting, upload artwork, or publish without task authorization.

## Implemented

The personal homepage, meeting redirect, blog placeholder, and design references
remain available. `/dev/` catalogs experimental pages; `/dev/artwork/` uses
OpenSeadragon with a remote 142-megapixel sample, zoom/pan, keyboard controls,
fullscreen, loading feedback, retries, and basic tile diagnostics.
[Artwork viewing](docs/artwork-viewing.md) is the durable research and operating guide.

## Validation and open gaps

Checks passed November 21, 2026: local page links and development-page discovery,
remote DZI metadata and three representative tiles with CORS, and six viewer
controller tests. These checks do not establish
browser rendering quality or real-device performance. Chrome access was
unavailable during initial development. Browser acceptance, touch testing,
and a representative gigabyte-scale artwork test remain necessary.

Nathan's original artwork, production tile host, export color profile/quality,
and measured performance targets have not been supplied or selected. Confirm
them when preparing actual artwork; the third-party sample is not a production
hosting dependency to adopt for Nathan's images.
