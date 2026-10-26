# blueorange.com (2026)

Static site. No build step: plain HTML, one stylesheet, one script.

## Pages

| File | Page |
|---|---|
| `index.html` | Home |
| `sgs-as.html` | Sutherland · Agent Success |
| `sortly.html` | Sortly |
| `sgs.html` | Sutherland Labs |
| `hired.html` | Hired |
| `tripadvisor.html` | Tripadvisor |
| `udemy.html` | Udemy |

File names match the old site, so existing links keep working. `mzuckman-resume.pdf` stays at the root for the same reason.

## Assets

- `assets/css/site.css`: tokens (3 grays, 8-based spacing, 2 radii, 3 typefaces) and every component.
- `assets/js/site.js`: smooth scroll, rise-in blocks, scroll-scrubbed figures, outcome count-up, fixed logo tiles, sentence highlight. Respects reduced motion.
- `assets/img/objects/`: the clay objects, normalized to the same visual size on #238DD7.
- `assets/img/work/`, `assets/img/sgs-as/`: case study images as WebP.

## Editing

Copy lives in the HTML. The source of truth for copy is the copy deck in the Personal Portfolio project.

- Section: `<h2 class="m-rise">` inside `.prose`.
- Image block: `<figure class="figure m-settle">` with one image, or a `.row` (`r2`, `r3`, `r4`; add `stack` to stack on phones, `phones` to cap width for portrait screens), then a `<figcaption>`.
- Outcomes: `.outcomes` with `.stat` items; `data-to` drives the count-up.
- The project cards at the bottom of each page are identical except for the `here` class on the current page's card. Change a card line in all seven files.

## Fonts and scripts

Lora 600, Inter 400/500/600, IBM Plex Mono 500 from Google Fonts. Lenis 1.1.13 from jsDelivr. GA4 tag `G-4ZLMVN0MZH`.
