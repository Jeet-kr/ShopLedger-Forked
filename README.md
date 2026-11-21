# ShopLedger

ShopLedger is a Node.js and Express application for a small shop. It provides a browser-based point of sale (POS), product and inventory management, order checkout, GST calculations, printable HTML invoices, customer Khata credit and settlements, and reporting.

## Run locally

Install the dependencies and start the app:

```sh
npm install
npm start
```

By default, the app listens at [http://localhost:3000](http://localhost:3000). Set the `PORT` environment variable to use another port.

## Tests

Run the test suite with Node's built-in test runner:

```sh
node --test
```

## Data

Application data is stored in `data/db.json`. The app reads and writes this file through `lib/store.js`.
