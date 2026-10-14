# Web page templates

Reusable design references collected from public URLs and interpreted by Codex.
Each source gets its own folder with a source record, visual references, adaptation
notes, and a standalone HTML/CSS starter. There is no crawler service or runtime AI.

| Reference | Preview | Notes |
| --- | --- | --- |
| [Ouros Materials](https://www.ourosmaterials.com/) | [Open template](ouros-materials/index.html) | [Source and reuse guide](ouros-materials/README.md) |

From the repository root, run `python3 -m http.server 8000 --bind 127.0.0.1`
and open `http://localhost:8000/web-templates/ouros-materials/`.
You can also open the template HTML files directly.

For the next reference, provide its URL and ask Codex to add it here using the
same structure. Capture public page structure and visual decisions; distinguish
observations from adaptations. Replace source branding, prose, imagery, claims,
and service integrations with content appropriate to the destination website.

These templates are separate from the personal homepage. GitHub Pages publishes
this repository root, so anything committed here is publicly accessible after
deployment. Templates use `noindex`; that is an indexing hint, not access control.
