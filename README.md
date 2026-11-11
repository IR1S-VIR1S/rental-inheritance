# Rental Inheritance

Offline iPhone app (web app on GitHub Pages) for a family rental-income ledger kept in a Google Sheet.
No ledger data lives in this repository: entries, names and figures are only in the owner's Sheet and Drive,
and on phones encrypted with a PIN.

- `index.html` and the `.js` files: the phone app. `logic.js` is generated from `script/RentalInheritance.gs`.
- `script/RentalInheritance.gs`: the workbook script, downloaded by the Loader's "Install update".
- `script/Loader.gs`, `script/appsscript.json`: pasted once into the Sheet's Apps Script.
