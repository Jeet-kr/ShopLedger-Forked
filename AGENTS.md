# ShopLedger contributor notes

## Stack
- Node.js CommonJS application using Express 4.17.1 and body-parser 1.19.0.
- Browser UI is static HTML, CSS, and JavaScript in `public/`.
- Persistent application data is stored in `data/db.json` via synchronous file reads and writes in `lib/store.js`.

## Module map
- `routes/customers.js` — lists customers and recent settlements; records customer settlements.
- `routes/orders.js` — lists and fetches orders; creates and cancels orders.
- `routes/products.js` — lists products and active coupons.
- `routes/reports.js` — pricing preview, dashboard, GST reconciliation, and admin export endpoints.
- `lib/coupons.js` — normalizes, validates, calculates, and lists coupons from config.
- `lib/dates.js` — returns today's date and normalizes date keys and fiscal years.
- `lib/inventory.js` — product lookup, sellable stock, stock checks, stock updates, and inventory summary.
- `lib/invoice.js` — computes invoice figures and renders printable invoice HTML.
- `lib/ledger.js` — customer balances, Khata order charges/reversals, and settlements.
- `lib/orders.js` — adds, finds, cancels, and filters orders.
- `lib/pricing.js` — subtotal, discount, and checkout total calculations.
- `lib/reports.js` — dashboard summary and comparison of stored order totals with invoice calculations.
- `lib/store.js` — reads/writes `data/db.json` and appends audit entries.
- `lib/tax.js` — resolves GST rate from item rate, configured HSN slab, or default; splits CGST/SGST.

## Commands
- Start the app: `npm start` (runs `node server.js`).
- Run tests: `node --test`.
- `package.json` currently defines `npm test` as a placeholder that exits with an error.

## Rules
1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket
Invoice total and GST breakdown do not match what the customer was billed.
Allowed files: `lib/invoice.js` (`lib/tax.js` only if truly needed).

