# Rental Inheritance: hand-over notes

- Phone app: this repository (GitHub Pages, `https://ir1s-vir1s.github.io/rental-inheritance/`). Built from a private working copy with `node build.js`.
- Workbook: Loader.gs + appsscript.json + History.gs pasted once into the Sheet's Apps Script. Menu "Install update" downloads `script/RentalInheritance.gs` from this repository.
- History.gs (private, never published) holds the heirs, shares, rates, opening balances and the 2025-26 ledger. It is read only the first time "Set up or repair" runs on an empty workbook.
- Rule agreed with the owner: changes go on the phone side wherever possible; the workbook script stays thin (stores rows, checks who may write, audit trail, photos). Calculations live in `calc.js`.
- Publishing: changes go live by default.

| Version | App build | What changed | Tests |
|---|---|---|---|
| App only | 7877bc2c | Superscript ? beside every glossary term on Home, Summary, forms, Qurbani and Settings > Year: pop-up with the meaning in bullets, Open glossary, Close (does not flip switches or lose typing). Glossary adds every Summary cash label and Qurbani split / how it works / example. Sync icon turns clockwise while syncing, always (also with reduced motion: owner's rule) | script 166/166, loader 15/15, phone 134/134 x3, update 11/11 |
| App only | e54ba3b6 | Glossary tile in Settings (everyone, heirs too): searchable terms in sections Totals, Heirs, Payments, Cash (every Summary cash label), rent and lease, Qurbani (split calculator, how an entry works, worked example), Using the app; names taken from Settings | script 166/166, phone 116/116 x3, update 11/11 |
| App only | eba0e606 | Arrows swapped: income points down (coming in), outflows point up (going out) | script 166/166, phone 104/104, update 11/11 |
| App only | c355c51f | Automatic updates: new service worker takes over at once (skipWaiting); checks on open, on return and every 5 minutes; reloads itself at a safe moment (not while typing, in a form or a panel) and stays unlocked (PIN key handed across the reload in session storage for 30 s, erased on use); 'Updated to' message | script 166/166, loader 15/15, phone 104/104 x3, update 11/11 x3 |
| App only | 6d5670ae | This phone section (Face ID, signed in as, versions, Update app, Reset) moved onto the main Settings screen below the group tiles; tile removed | script 166/166, loader 15/15, phone 104/104 x3 |
| App only | 7788855d | Settings groups and the Add menu shown as tiles, three to a row (icon, short title, one-word status); full summary at the top of each group page | script 166/166, loader 15/15, phone 103/103 x3 |
| App only | 4aa94bb7 | Settings grouped: one list (Year, Heirs and shares, Amounts and roles, rent rates, Lists, This phone) with a one-line summary each; each opens its own page with Back; Not accepted stays on top; heirs see only This phone | script 166/166, loader 15/15, phone 103/103 x3 |
| App only | b41079ad | Bank or account tags on payments to heirs (stored in the extra column as mode) and on income: Cash, ABL, MCB, Meezan Bank, HBL, UBL, Bank Alfalah, PCB transfer, JazzCash, Easypaisa, added once to the MODES list; a typed one is added too; shown in ledger, details, search and Excel | script 166/166, loader 15/15, phone 99/99 x3 |
| App only | 4e8a8816 | Qurbani entry: total split by sevenths (others optional); paid from income directly (added to gross and the fixed lease received, never in the custodian's cash, parts non-cash), or paid by the custodian (cash) or by another heir (parts non-cash, payer credited the total); the group is deleted together | script 166/166, loader 15/15, phone 86/86 x3 |
| App only | 0ed0d12f | TBZ months count as received automatically (tap a month on the grid to change it); TBZ expenses entered as outflows taken from TBZ, paid by the collector, charged to the pool and taken off what he keeps | script 159/159, loader 15/15, phone 70/70 x3 |
| Script 1.0 | 734b7070 | First version | script 148/148, loader 15/15, phone 62/62 x3 |

Not verified on a real iPhone yet: installing from Safari and joining in the Home Screen copy, Face ID, choosing photos from Photos or the camera, the share sheet for the PDF and Excel files, the bottom bar on short pages.
