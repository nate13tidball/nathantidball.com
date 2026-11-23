# Detailed artwork: viewing and preparation

Research date: November 21, 2026. Entry points: `/dev/` and `/dev/artwork/`.
This is the maintained implementation guide for future agents, not a deployment log.

## Recommendation

Use **OpenSeadragon + a precomputed Deep Zoom Image (DZI) pyramid**, prepared
with **libvips** and served as static files from object storage/CDN. Keep the
small viewer on this static site. This is deep zoom, like map tiles: request
only visible image regions at a resolution appropriate to the current zoom.
An ordinary full-resolution `<img>` or a lightbox still transfers/decodes the
large image and is unsuitable as the primary gigabyte-scale viewing path.

| Option | Fit and tradeoff |
| --- | --- |
| [OpenSeadragon](https://openseadragon.github.io/) + DZI | Selected. Image-focused desktop/mobile pan and zoom, navigator, built-in DZI/IIIF support; BSD-3-Clause. No runtime image server required for prepared DZI files. |
| [OpenLayers Zoomify](https://openlayers.org/en/latest/examples/zoomify.html) | Maintained map-oriented alternative with tiled image support. Prefer if maps, projections, or geographic overlays become requirements; extra concepts for a single artwork. |
| [IIIF Image API](https://iiif.io/api/image/3.0/) + OpenSeadragon | A protocol, not a competing viewer. Useful for museum interoperability or a shared image service. Precomputed level-0 implementations can be static; dynamic region/size services require additional infrastructure. |
| [OpenSeadragon single-file plugins](https://openseadragon.github.io/examples/creating-zooming-images/) | SZI/GeoTIFF can reduce file-count management. Evaluate plugin compatibility and HTTP Range support if tile-object counts become troublesome; not needed for the first static implementation. |

[libvips' pyramid guide](https://www.libvips.org/API/8.17/making-image-pyramids.html)
documents memory-efficient pyramid creation; its
[dzsave reference](https://www.libvips.org/API/8.17/method.Image.dzsave.html)
documents format, quality, tile size, and overlap. It is a preparation dependency,
not something visitors install or execute. Actual export memory/time depends on
input format, dimensions, decoder, and the machine; measure with a real original.

## Current demo

- Library: OpenSeadragon **6.1.1**, vendored in
  `assets/vendor/openseadragon/6.1.1/` with its BSD license and source map.
  [Official release](https://github.com/openseadragon/openseadragon/releases/tag/v6.1.1).
  The minified JavaScript's SHA-256 is
  `14d587cd3ee7c4861f1a41077ce642029364a21029956ba635bd8fb1202cf9ad`.
  To upgrade, take the minified JS, matching map, and license from an official
  release archive into a new version directory, update the HTML script path,
  and rerun the checks and browser acceptance path below.
- Sample: [Duomo DZI](https://openseadragon.github.io/example-images/duomo/duomo.dzi),
  **13,920 × 10,200 = 141,984,000 pixels**, JPEG tiles, tile size 254, overlap 1.
- Credit: © 2012 [Dario Morelli](https://www.flickr.com/photos/projectese/), as
  credited on the [OpenSeadragon demo](https://openseadragon.github.io/).
  The photograph remains on its upstream demo host. Its copyright is separate
  from the viewer's license; do not assume redistribution rights or copy it
  into a production art collection. No original or tile pyramid is vendored.
- This sample is **not a measured multi-gigabyte source file**. Pixel count is
  known; original compressed file size is not. A hypothetical RGBA decode alone
  would occupy about 568 MB, before other buffers.
- Six concurrent image loads; 160 cached tiles configured. Cache count is not
  a strict total RAM cap (navigator, canvas, decoded data, and browser caches
  also consume memory). Canvas rendering supports the first-tile-drawn metric.
- First-draw time starts at viewer initialization and ends at the first drawn
  tile. It is not time to a fully sharp viewport. The tile counter records load
  events in this viewer session, not network bytes. Retry resets both.
- On metadata failure, tile failure, or a long initial wait, show feedback and
  a retry button. Retry destroys the previous viewer and starts afresh.

The CSP allows local JavaScript and the specific demo host for metadata/images.
Inline styles are allowed for the viewer's generated layout. No arbitrary image
URL form, credentials, or external script CDN is required.

## Prepare Nathan's artwork

1. Keep the master outside this checkout. Export a flattened, correctly oriented
   image in the intended display color space (usually sRGB). Preserve the master
   profile, bit depth, layers, and original separately. Compare fine lines,
   gradients, transparency, and colors with a reference export before publishing.
2. Install libvips tools through the normal OS package manager if absent
   (`libvips-tools` on Debian/Ubuntu; `vips` through Homebrew on macOS).
3. Choose a **new, nonexistent output basename** on storage with adequate space.
   Example CLI, run outside the repo after substituting real paths:

   ```sh
   vips dzsave /absolute/path/artwork-srgb.tif /absolute/path/export/artwork-v1 \
     --layout dz --tile-size 512 --overlap 1 --suffix '.jpg[Q=90]'
   ```

   This produces `artwork-v1.dzi` and `artwork-v1_files/` containing resolution
   levels. Parent directory must exist. Do not overwrite an existing export.
   JPEG is lossy and lacks alpha; use `--suffix '.png'` for lossless or transparent
   tiles and measure the larger transfer/storage cost. Start with 512-pixel tiles;
   compare 256/512 and JPEG quality against real artwork and mobile connections.
   The demo's upstream tile size is independent of this recommendation.
4. Check the DZI dimensions, lowest-level tile, full-resolution center and edge
   tiles, seams at multiple zoom levels, orientation, and color. Each downsampled
   level has about a quarter as many pixels as the previous level, so a full
   pyramid approaches 4/3 of base-level pixels before compression/overlap/overhead.
   Disk bytes depend heavily on content and encoding; measure the actual export.
5. Publish the DZI and tile directory together under an immutable versioned path
   on the selected tile host. This command only prepares files; it does not upload.
6. Set `tileSource` in `dev/artwork/viewer.js` to the new `.dzi` URL and update
   the CSP's `connect-src` and `img-src` to the exact HTTPS host. Update the image
   title, accessible description, attribution, resolution copy, and sample checks.
   A relative DZI URL also works for a small local test pyramid.

For large files that intentionally belong in Git, follow the user's Git LFS
instructions, including verifying the mounted configured store. LFS is not a
replacement for a browser tile CDN. Do not add masters or production tile trees
to this website repository by default.

## Hosting contract

[GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
include a **1 GB published site** and **100 GB/month soft bandwidth limit** at
research time. These apply to the secondary GitHub Pages preview, not the live
custom domain, which uses Vercel's existing production integration from `main`
(confirmed November 23, 2026). Check the actual hosting plan's storage, request,
and transfer limits before publishing large artwork. Keep the viewer here and
host production tiles separately.

- Serve HTTPS GETs for the `.dzi` descriptor and all `_files/{level}/{x}_{y}` tiles.
- Allow CORS for the website origin and authorized localhost previews on **both
  metadata and images**. For wholly public, credential-free tiles, wildcard
  `Access-Control-Allow-Origin: *` works. The demo requests anonymous images.
- Use correct MIME types, cache immutable versioned tile paths for a long time,
  and support parallel requests. DZI does not require HTTP byte ranges.
- Measure object count, storage, requests, and egress before choosing a provider.
  No account, paid service, or production upload has been configured here.
- `hosting/` is an older, separate augment-wh.com deployment path that copies
  only an allowlist and blocks scripts via a header CSP. It does **not** deploy
  these dev pages. Do not run its installer to deploy this demo; push to `main`
  for the existing Vercel deployment as described in the README.

## Validation and future acceptance

From the repo root:

```sh
python3 scripts/check-dev.py
node --test tests/artwork-viewer.test.cjs
python3 scripts/check-dev.py --remote
python3 -m http.server 8092 --bind 127.0.0.1
```

Use a free port in 8000–8099 if 8092 is occupied and keep the Mac's `nuc` connection
open. Check `/dev/` → Artwork → fit → 1:1 → drag → fullscreen → exit → retry.
Test keyboard-only controls, narrow/mobile layout, pinch zoom, reduced motion,
offline/blocked metadata, and missing tiles. In browser network tools, verify
that new tile levels load as you zoom, without a full-image download. Repeat with
a cold cache and a slow connection; record initial bytes, time to overview and
sharp detail, panning responsiveness, and memory on desktop and a real phone.

Automated checks cover static links/metadata, representative remote tiles, and
controller state/error paths with a simulated viewer. They do **not** test the
real canvas, gestures, GPU, or fullscreen. Chrome's access host was unavailable
during initial implementation; visual/browser acceptance remains open. No
multi-gigabyte original or real-phone performance benchmark has been completed.

## Maintaining the dev directory

Add every new development HTML page to `/dev/index.html`. Keep `/dev/` off the
homepage and sitemap, and mark new dev pages `noindex,nofollow`. The existing
`/ui/` and template pages are linked from the directory without relocating them.
Extend `scripts/check-dev.py` if experiments are introduced under a new root.
