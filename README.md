# G30 Twenties

A tailor-made catalog of 20-inch wheel sets for the BMW 5 Series (G30/G31), built for shopping from the Netherlands.

The whole site is a single self-contained page: **[`docs/index.html`](docs/index.html)** — no build step, no dependencies beyond Google Fonts. Open it directly in a browser, or enable GitHub Pages (Settings → Pages → Deploy from branch → `/docs` folder) to host it.

## What's inside

- **16 curated wheel sets** that genuinely fit the G30 (5×112, hub 66.6 mm) — from budget ECE-approved alloys (MAM, Japan Racing) through the concave scene (Concaver, mbDesign, Z-Performance) up to BBS, Vossen and HRE.
- Per set: brand, model, construction, approximate weight, front/rear sizes with offsets (ET), tire sizes, **price indication in euros for a set of four** (EU/NL retail incl. VAT, excl. tires), finish options, and an APK/RDW certification note.
- Every design is **drawn programmatically on canvas** (Y-spoke, mesh, twin-five concave, directional, multi-spoke…) — stylized renderings, no licensed photography.
- An interactive hero: tap **Fit on car** on any card to see that wheel design and finish on a G30 side profile.
- Filters by style and budget, sorting by price, a G30 fitment cheat sheet, and Netherlands-specific buying notes (APK/RDW, NL webshops, Marktplaats, winter advice).
- Mobile-friendly, light and dark theme.

## Editing the catalog

All data lives in the `WHEELS` array near the top of the `<script>` block in `docs/index.html`. Each entry is one card; the `render` object controls how the wheel is drawn (`style`: `y` | `mesh` | `twin` | `double` | `multi` | `directional`, plus spoke count, width, curve, concavity and lip finish).

Prices are indications from early-2026 EU/NL retail — verify with the seller's per-license-plate fitment check before ordering.
