# G30 Twenties

A tailor-made catalog of 20-inch wheel sets for the BMW 5 Series (G30/G31), built for shopping from the Netherlands.

The site lives in **[`docs/`](docs/)** — plain HTML/CSS/JS, no build step. Open `docs/index.html` in a browser, or enable GitHub Pages (Settings → Pages → Deploy from branch → `/docs` folder) to host it.

## Two pages

- **`index.html` — Seen on a G30**: sets where we found real photos of the wheel mounted on an actual G30/G31, linked on each card (manufacturer galleries, forum builds, NL shop pages).
- **`options.html` — More options**: sets that fit just as well but haven't been caught on camera on a 5 Series yet; where a real photo on another car exists, it's on the card with the car named.

## What's inside

- **44 deduplicated wheel sets** confirmed available in 20" for the G30 (5×112, hub 66.6 mm) — from €950 budget ECE-approved alloys (MAM, Autec, Brock, Motec) through the concave scene (Concaver CVR1/4/5, mbDesign, Z-Performance, Yido, Elegance) to OEM/tuner metal (Style 668M/846M, Alpina Classic, AC Schnitzer, G-Power) and the premium names (BBS LM/CH-R II/CI-R, Vossen HF-3/HF-5, HRE FF04/FF10, Vorsteiner).
- Per set: brand, model, construction, weight, front/rear sizes with offsets (ET), tire sizes, **price indication in euros for a set of four** (EU/NL retail incl. VAT, excl. tires), finish options, APK/RDW certification note, and **links to real photos** of the wheel mounted (G30 links highlighted in bronze).
- **A real photo on every card** (41 of 44 sets): the wheel mounted on a car, credited to its source, with the actual car and wheel size named when it isn't a G30. The hero rotates through the verified G30 shots; *See in showcase* jumps to a set's photo.
- Filters by style and budget, text search, price sorting, a G30 fitment cheat sheet and Netherlands-specific buying notes.
- Mobile-friendly, light and dark theme.

## Editing the catalog

All data lives in [`docs/wheels-data.js`](docs/wheels-data.js). Each entry is one card; `photo: {src, creditUrl, creditName, car, isG30, size}` is the real mounted shot (or `null` for a "no photo yet" card), and `photoLinks` holds pages with more real photos. Any `isG30: true` photo or link puts the set on page 1; the hero showcase is built from the `isG30` photos.

Prices are indications from 2026 EU/NL retail research — always run the seller's per-license-plate fitment check before ordering.
