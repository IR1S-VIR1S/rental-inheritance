# Rental Inheritance: hand-over notes

- Phone app: this repository (GitHub Pages, `https://ir1s-vir1s.github.io/rental-inheritance/`). Built from a private working copy with `node build.js`.
- Workbook: Loader.gs + appsscript.json + History.gs pasted once into the Sheet's Apps Script. Menu "Install update" downloads `script/RentalInheritance.gs` from this repository.
- History.gs (private, never published) holds the heirs, shares, rates, opening balances and the 2025-26 ledger. It is read only the first time "Set up or repair" runs on an empty workbook.
- Rule agreed with the owner: changes go on the phone side wherever possible; the workbook script stays thin (stores rows, checks who may write, audit trail, photos). Calculations live in `calc.js`.
- Publishing: changes go live by default.

| Version | App build | What changed | Tests |
|---|---|---|---|
| App only | 0ed0d12f | TBZ months count as received automatically (tap a month on the grid to change it); TBZ expenses entered as outflows taken from TBZ, paid by the collector, charged to the pool and taken off what he keeps | script 159/159, loader 15/15, phone 70/70 x3 |
| Script 1.0 | 734b7070 | First version | script 148/148, loader 15/15, phone 62/62 x3 |

Not verified on a real iPhone yet: installing from Safari and joining in the Home Screen copy, Face ID, choosing photos from Photos or the camera, the share sheet for the PDF and Excel files, the bottom bar on short pages.
