# Ouros Materials reference

Inspected **2026-10-11** from [the public website](https://www.ourosmaterials.com/).
This folder contains a visual reference and an original, editable static starter.

## Captured source

Public routes inspected: [home](https://www.ourosmaterials.com/),
[news](https://www.ourosmaterials.com/press), and
[contact](https://www.ourosmaterials.com/contact).
The sitemap also lists a 404 page. External articles were not crawled.

The home sequence is: oversized brand introduction, wide rounded media, numbered
overview, feature tiles, process steps, dark product section, news cards, partners,
and contact/newsletter footer. The light gray navigation has a dark pill CTA and
compact menu. Mobile stacks the title and supporting text above cropped media.
News uses an oversized title and three image cards. Contact pairs introductory
text with a three-field form, followed by FAQs.

Computed desktop styles use white, near-black, pale gray, and muted gray; headings
combine Inter with Neue Haas Grotesk. The home title measured about 106 px at a
1440 px viewport; section headings 54 px; secondary-page titles 200 px.
The original is a Framer site. Repeated DOM content includes responsive/animated
variants, rather than extra sections.

`source.json` records measured values and coverage. `reference/` contains actual
browser screenshots of the first viewport, including a mobile home capture.

## Reuse

- Open `index.html`, `news.html`, or `contact.html`; all share `styles.css`.
- Replace “Your Studio,” sample content, media placeholders, and partner labels.
- Edit the CSS variables first to change palette, spacing, and corner radius.
- Replace the CSS media blocks with your own images or video, with useful alt text.
- Set up your own contact destination before enabling the demonstration form.
- Copy the template to a new working folder when adapting it; keep this reference.

Suggested future request: “Adapt web-templates/ouros-materials for my personal
site. Use my approved content and keep the email and /meet links working.”

## Deliberate adaptations

The starter uses system fonts and original placeholder copy/artwork. It does not
bundle source photographs, logos, fonts, Framer scripts, analytics, or form endpoints.
Reference screenshots retain the source site's identity for comparison; they are
not template assets. Animation and the partner carousel become static layouts;
the menu and FAQs use native HTML disclosures. Newsletter integration is omitted.
The contact form is visibly disabled, so it cannot accidentally submit inquiries.

This is a reusable structural starting point, not an offline mirror or an exact
pixel reproduction. Keep source attribution in this reference folder. Use your
own approved content and assets when publishing an adapted site.
