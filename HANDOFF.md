# Rental Inheritance: hand-over notes

- Phone app: this repository (GitHub Pages, `https://ir1s-vir1s.github.io/rental-inheritance/`). Built from a private working copy with `node build.js`.
- Workbook: Loader.gs + appsscript.json + History.gs pasted once into the Sheet's Apps Script. Menu "Install update" downloads `script/RentalInheritance.gs` from this repository.
- History.gs (private, never published) holds the heirs, shares, rates, opening balances and the 2025-26 ledger. It is read only the first time "Set up or repair" runs on an empty workbook.
- Rule agreed with the owner: changes go on the phone side wherever possible; the workbook script stays thin (stores rows, checks who may write, audit trail, photos). Calculations live in `calc.js`.
- Publishing: changes go live by default.

| Version | App build | What changed | Tests |
|---|---|---|---|
| App only | 4aa94bb7 | Settings grouped: one list (Year, Heirs and shares, Amounts and roles, rent rates, Lists, This phone) with a one-line summary each; each opens its own page with Back; Not accepted stays on top; heirs see only This phone | script 166/166, loader 15/15, phone 103/103 x3 |
| App only | b41079ad | Bank or account tags on payments to heirs (stored in the extra column as mode) and on income: Cash, ABL, MCB, Meezan Bank, HBL, UBL, Bank Alfalah, PCB transfer, JazzCash, Easypaisa, added once to the MODES list; a typed one is added too; shown in ledger, details, search and Excel | script 166/166, loader 15/15, phone 99/99 x3 |
| App only | 4e8a8816 | Qurbani entry: total split by sevenths (others optional); paid from income directly (added to gross and the fixed lease received, never in the custodian's cash, parts non-cash), or paid by the custodian (cash) or by another heir (parts non-cash, payer credited the total); the group is deleted together | script 166/166, loader 15/15, phone 86/86 x3 |
| App only | 0ed0d12f | TBZ months count as received automatically (tap a month on the grid to change it); TBZ expenses entered as outflows taken from TBZ, paid by the collector, charged to the pool and taken off what he keeps | script 159/159, loader 15/15, phone 70/70 x3 |
| Script 1.0 | 734b7070 | First version | script 148/148, loader 15/15, phone 62/62 x3 |

Not verified on a real iPhone yet: installing from Safari and joining in the Home Screen copy, Face ID, choosing photos from Photos or the camera, the share sheet for the PDF and Excel files, the bottom bar on short pages.
