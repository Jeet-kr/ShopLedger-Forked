'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function calculateBoth(items, coupon) {
  const order = { items, coupon };
  return {
    invoice: invoice.computeInvoiceFigures(order),
    checkout: pricing.computeTotals(items, coupon)
  };
}

test('invoice matches checkout HSN slabs and capped pre-tax coupon discount', function () {
  const items = [
    { name: 'Groundnut Oil', sku: 'OIL-002', hsn: '1508', price: 1120, qty: 2 },
    { name: 'Ghee', sku: 'DRY-001', hsn: '0405', price: 450, qty: 1 }
  ];
  const result = calculateBoth(items, 'SAVE10');

  assert.deepEqual({
    subtotal: result.invoice.subtotal,
    discount: result.invoice.discount,
    tax: result.invoice.tax,
    cgst: result.invoice.cgst,
    sgst: result.invoice.sgst,
    total: result.invoice.total,
    rows: result.invoice.rows.map(function (row) {
      return { hsn: row.hsn, gstPercent: row.gstPercent, lineTax: row.lineTax };
    })
  }, {
    subtotal: result.checkout.subtotal,
    discount: result.checkout.discount,
    tax: result.checkout.tax,
    cgst: result.checkout.cgst,
    sgst: result.checkout.sgst,
    total: result.checkout.total,
    rows: [
      { hsn: '1508', gstPercent: 5, lineTax: 105.75 },
      { hsn: '0405', gstPercent: 12, lineTax: 50.99 }
    ]
  });
});

test('CURRENT BEHAVIOUR: #1001-style 5% and 12% items without a coupon', function () {
  const items = [
    { name: 'Toor Dal', sku: 'GRN-002', hsn: '0713', gstRate: 5, price: 165, qty: 2 },
    { name: 'Ghee', sku: 'DRY-001', hsn: '0405', gstRate: 12, price: 450, qty: 1 }
  ];
  const result = calculateBoth(items, '');

  assert.deepEqual({
    subtotal: result.invoice.subtotal,
    discount: result.invoice.discount,
    tax: result.invoice.tax,
    cgst: result.invoice.cgst,
    sgst: result.invoice.sgst,
    total: result.invoice.total,
    rows: result.invoice.rows.map(function (row) {
      return { hsn: row.hsn, gstPercent: row.gstPercent, lineTax: row.lineTax };
    })
  }, {
    subtotal: 780,
    discount: 0,
    tax: 70.5,
    cgst: 35.25,
    sgst: 35.25,
    total: 850.5,
    rows: [
      { hsn: '0713', gstPercent: 5, lineTax: 16.5 },
      { hsn: '0405', gstPercent: 12, lineTax: 54 }
    ]
  });
  assert.equal(result.checkout.tax, 70.5);
  assert.equal(result.checkout.total, 850.5);
});

test('CURRENT BEHAVIOUR: #1002-style SAVE10 matches checkout discount before tax', function () {
  const items = [
    { name: 'Rice', sku: 'GRN-001', hsn: '1006', gstRate: 5, price: 640, qty: 1 },
    { name: 'Sunflower Oil', sku: 'OIL-001', hsn: '1512', gstRate: 5, price: 190, qty: 2 }
  ];
  const result = calculateBoth(items, 'SAVE10');

  assert.deepEqual({
    subtotal: result.invoice.subtotal,
    discount: result.invoice.discount,
    tax: result.invoice.tax,
    cgst: result.invoice.cgst,
    sgst: result.invoice.sgst,
    total: result.invoice.total
  }, {
    subtotal: 1020,
    discount: 102,
    tax: 45.9,
    cgst: 22.95,
    sgst: 22.95,
    total: 963.9
  });
  assert.equal(result.checkout.discount, 102);
  assert.equal(result.checkout.tax, 45.9);
  assert.equal(result.checkout.total, 963.9);
});

test('CURRENT BEHAVIOUR: #1004-style SAVE10 applies the ₹150 cap before tax', function () {
  const items = [
    { name: 'Groundnut Oil', sku: 'OIL-002', hsn: '1508', gstRate: 5, price: 1120, qty: 2 }
  ];
  const result = calculateBoth(items, 'SAVE10');

  assert.deepEqual({
    subtotal: result.invoice.subtotal,
    discount: result.invoice.discount,
    tax: result.invoice.tax,
    cgst: result.invoice.cgst,
    sgst: result.invoice.sgst,
    total: result.invoice.total
  }, {
    subtotal: 2240,
    discount: 150,
    tax: 104.5,
    cgst: 52.25,
    sgst: 52.25,
    total: 2194.5
  });
  assert.equal(result.checkout.discount, 150);
  assert.equal(result.checkout.tax, 104.5);
  assert.equal(result.checkout.total, 2194.5);
});

test('CURRENT BEHAVIOUR: #1008-style all-18% items without a coupon', function () {
  const items = [
    { name: 'Packaged Tea', sku: 'BEV-001', hsn: '0902', gstRate: 18, price: 140, qty: 1 },
    { name: 'Sherbet Concentrate', sku: 'BEV-003', hsn: '2106', gstRate: 18, price: 180, qty: 2 }
  ];
  const result = calculateBoth(items, '');

  assert.deepEqual({
    subtotal: result.invoice.subtotal,
    discount: result.invoice.discount,
    tax: result.invoice.tax,
    cgst: result.invoice.cgst,
    sgst: result.invoice.sgst,
    total: result.invoice.total,
    gstPercent: result.invoice.rows.map(function (row) { return row.gstPercent; })
  }, {
    subtotal: 500,
    discount: 0,
    tax: 90,
    cgst: 45,
    sgst: 45,
    total: 590,
    gstPercent: [18, 18]
  });
  assert.equal(result.checkout.tax, 90);
  assert.equal(result.checkout.total, 590);
});

