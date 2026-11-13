/* GENERATED from script/RentalInheritance.gs by build.js. Do not edit. */
'use strict';
//== SHARED START
var CFG = {
  APP_NAME: 'Rental Inheritance',
  SCHEMA_VER: 1,
  EARLIEST: '2020-07-01',
  MAX_AMOUNT: 100000000,
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};

// Field types: date (yyyy-mm-dd), month (yyyy-mm), fy (2026-27), amt (whole rupees, above 0), samt (whole rupees, not 0, may be minus),
// yn (Y or N), text, list:NAME (a value on the LISTS tab), heir (a name on the HEIRS tab), frac (like 1/3), int.
// "fyFrom" says which field sets the financial year. "extra" holds fields added later by the phone app (JSON).
var SCHEMA = {
  INCOME: { prefix: 'I', fyFrom: 'date', label: 'Income', fields: {
    date: { t: 'date', req: 1, label: 'Date received' }, source: { t: 'list:SOURCES', req: 1, label: 'Source' },
    detail: { t: 'text', label: 'Instalment or detail' }, collected_by: { t: 'heir', req: 1, label: 'Collected by' },
    amount: { t: 'amt', req: 1, label: 'Gross (Rs)' }, mode: { t: 'text', label: 'Mode or account' }, note: { t: 'text', label: 'Note' } } },
  OUTFLOWS: { prefix: 'O', fyFrom: 'date', label: 'Outflow', fields: {
    date: { t: 'date', req: 1, label: 'Date paid' }, taken_from: { t: 'text', req: 1, label: 'Taken from' },
    paid_by: { t: 'heir', req: 1, label: 'Paid by' }, category: { t: 'list:CATEGORIES', req: 1, label: 'Category' },
    payee: { t: 'text', req: 1, label: 'Payee or purpose' }, amount: { t: 'samt', req: 1, label: 'Amount (Rs)' },
    charged: { t: 'yn', req: 1, label: 'Charged to pool' }, note: { t: 'text', label: 'Note' } } },
  PAYMENTS: { prefix: 'P', fyFrom: 'date', label: 'Payment to heir', fields: {
    date: { t: 'date', req: 1, label: 'Date' }, batch: { t: 'text', label: 'Batch' }, heir: { t: 'heir', req: 1, label: 'Heir' },
    type: { t: 'list:PAYMENT_TYPES', req: 1, label: 'Type' }, amount: { t: 'samt', req: 1, label: 'Amount (Rs)' },
    cash: { t: 'yn', req: 1, label: 'Cash' }, note: { t: 'text', label: 'Note' } } },
  TBZ: { prefix: 'T', fyFrom: 'month', label: 'TBZ month', fields: {
    month: { t: 'month', req: 1, label: 'Month' }, rent: { t: 'amt', req: 1, label: 'Rent (Rs)' },
    expenses: { t: 'int', label: 'Expenses (Rs)' }, received: { t: 'yn', req: 1, label: 'Received' }, note: { t: 'text', label: 'Note' } } },
  FUND_IN: { prefix: 'F', fyFrom: 'date', label: 'Money back to fund', fields: {
    date: { t: 'date', req: 1, label: 'Date' }, from_whom: { t: 'text', req: 1, label: 'From whom' },
    amount: { t: 'amt', req: 1, label: 'Amount (Rs)' }, note: { t: 'text', label: 'Note' } } },
  OPENING: { prefix: 'B', fyFrom: 'fy', label: 'Opening balance', fields: {
    fy: { t: 'fy', req: 1, label: 'Year' }, item: { t: 'text', req: 1, label: 'Heir or "Cash"' },
    amount: { t: 'samt', req: 1, label: 'Amount (Rs)' }, note: { t: 'text', label: 'Note' } } },
  TBZ_RATES: { prefix: 'R', label: 'TBZ rate', fields: {
    from_month: { t: 'month', req: 1, label: 'From month' }, rent: { t: 'amt', req: 1, label: 'Monthly rent (Rs)' }, note: { t: 'text', label: 'Note' } } },
  LISTS: { prefix: 'L', label: 'List item', fields: {
    list: { t: 'text', req: 1, label: 'List' }, value: { t: 'text', req: 1, label: 'Value' },
    active: { t: 'yn', req: 1, label: 'In use' }, sort: { t: 'int', label: 'Order' } } },
  HEIRS: { prefix: 'H', label: 'Heir', fields: {
    name: { t: 'text', req: 1, label: 'Name' }, share: { t: 'frac', req: 1, label: 'Inheritance share' },
    qurbani: { t: 'int', label: 'Qurbani share (of 7)' }, note: { t: 'text', label: 'Role' } } },
  AF_EXP: { prefix: 'A', fyFrom: 'date', label: 'Account expense', fields: {
    date: { t: 'date', req: 1, label: 'Date' }, category: { t: 'text', req: 1, label: 'What for' }, details: { t: 'text', req: 1, label: 'Details' },
    paid_to: { t: 'text', label: 'Paid to' }, amount: { t: 'amt', req: 1, label: 'Amount (Rs)' }, mode: { t: 'text', label: 'Cash or bank' },
    recur_id: { t: 'text', label: 'Repeating charge' }, note: { t: 'text', label: 'Note' } } },
  AF_IN: { prefix: 'N', fyFrom: 'date', label: 'Other money in', fields: {
    date: { t: 'date', req: 1, label: 'Date' }, source: { t: 'text', req: 1, label: 'From where' }, details: { t: 'text', label: 'Details' },
    amount: { t: 'amt', req: 1, label: 'Amount (Rs)' }, mode: { t: 'text', label: 'Cash or bank' }, note: { t: 'text', label: 'Note' } } },
  AF_RECUR: { prefix: 'C', label: 'Repeating charge', fields: {
    name: { t: 'text', req: 1, label: 'Name' }, category: { t: 'text', req: 1, label: 'What for' }, amount: { t: 'amt', req: 1, label: 'Usual amount (Rs)' },
    day: { t: 'day', req: 1, label: 'Day of the month' }, active: { t: 'yn', req: 1, label: 'In use' }, note: { t: 'text', label: 'Note' } } },
  AF_HELD: { prefix: 'K', label: 'Money held', fields: {
    date: { t: 'date', req: 1, label: 'Date' }, amount: { t: 'int', req: 1, label: 'Held in cash and bank (Rs)' }, note: { t: 'text', label: 'Note' } } },
  SETTINGS: { prefix: 'S', label: 'Setting', fields: {
    key: { t: 'text', req: 1, label: 'Setting' }, value: { t: 'text', label: 'Value' }, note: { t: 'text', label: 'Note' } } }
};
var LIST_NAMES = ['SOURCES', 'CATEGORIES', 'PAYMENT_TYPES', 'TAKEN_FROM', 'MODES'];
// Tabs of the heir's account kept by another heir: only the keeper's phone writes them; only keeper and custodian receive them.
var AF_TABS = ['AF_EXP', 'AF_IN', 'AF_RECUR', 'AF_HELD'];

function pad2_(n) { return (n < 10 ? '0' : '') + n; }
function isYmd_(s) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
  if (!m) return false;
  var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}
function isMonth_(s) { return /^\d{4}-(0[1-9]|1[0-2])$/.test(String(s || '')); }
function isFy_(s) { var m = /^(\d{4})-(\d{2})$/.exec(String(s || '')); return !!m && (+m[1] + 1) % 100 === +m[2]; }
// Financial year runs 1 July to 30 June: 2026-08-01 and 2027-03 are both in "2026-27".
function fyOfMonth_(mk) { var y = +mk.slice(0, 4), m = +mk.slice(5, 7), s = m >= 7 ? y : y - 1; return s + '-' + pad2_((s + 1) % 100); }
function fyOf_(tab, r) {
  var f = SCHEMA[tab] && SCHEMA[tab].fyFrom;
  if (!f) return '';
  if (f === 'fy') return String(r.fy || '');
  var v = String(r[f] || '');
  return v.length >= 7 && isMonth_(v.slice(0, 7)) ? fyOfMonth_(v.slice(0, 7)) : '';
}
function addDays_(ymd, n) {
  var d = new Date(Date.UTC(+ymd.slice(0, 4), +ymd.slice(5, 7) - 1, +ymd.slice(8, 10) + n));
  return d.getUTCFullYear() + '-' + pad2_(d.getUTCMonth() + 1) + '-' + pad2_(d.getUTCDate());
}
function fracVal_(s) {
  var m = /^\s*(\d+)\s*\/\s*(\d+)\s*$/.exec(String(s || ''));
  if (m && +m[2] > 0) return +m[1] / +m[2];
  var n = Number(s);
  return isFinite(n) && String(s).trim() !== '' ? n : NaN;
}

// One record checked against its tab. ctx: { today, lists: {SOURCES: [...]}, heirs: [...], old: previous record or null }.
// Returns '' when fine, or a plain message.
function validateRecord_(tab, rec, ctx) {
  var S = SCHEMA[tab];
  if (!S) return 'Unknown table.';
  var keys = Object.keys(S.fields);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i], F = S.fields[k], v = rec[k];
    var blank = v === undefined || v === null || String(v).trim() === '';
    if (blank) { if (F.req) return F.label + ' is needed.'; continue; }
    var e = checkField_(F, v, ctx, ctx && ctx.old ? ctx.old[k] : undefined);
    if (e) return F.label + ': ' + e;
  }
  if (rec.extra !== undefined && rec.extra !== '' && rec.extra !== null) {
    if (String(rec.extra).length > 4000) return 'Too much extra detail.';
    try { var x = JSON.parse(rec.extra); if (!x || typeof x !== 'object' || Array.isArray(x)) return 'Extra detail is damaged.'; }
    catch (err) { return 'Extra detail is damaged.'; }
  }
  return '';
}
function checkField_(F, v, ctx, oldV) {
  var s = String(v).trim(), t = F.t;
  if (s.length > 500) return 'too long (500 characters at most).';
  if (t === 'date') {
    if (!isYmd_(s)) return 'not a date.';
    if (s < CFG.EARLIEST) return 'too early.';
    if (ctx && ctx.today && s > addDays_(ctx.today, 1)) return 'cannot be in the future.';
    return '';
  }
  if (t === 'month') return isMonth_(s) ? '' : 'not a month.';
  if (t === 'fy') return isFy_(s) ? '' : 'write the year like 2026-27.';
  if (t === 'amt' || t === 'samt' || t === 'int') {
    var n = Number(s);
    if (!isFinite(n) || Math.round(n) !== n) return 'whole rupees only.';
    if (t === 'int' && n < 0) return 'cannot be minus.';
    if (Math.abs(n) > CFG.MAX_AMOUNT) return 'too large. Check it.';
    if (t === 'amt' && n <= 0) return 'must be more than 0.';
    if (t === 'samt' && n === 0) return 'cannot be 0.';
    return '';
  }
  if (t === 'yn') return s === 'Y' || s === 'N' ? '' : 'choose Y or N.';
  if (t === 'day') { var dn = Number(s); return Math.round(dn) === dn && dn >= 1 && dn <= 28 ? '' : 'a day from 1 to 28.'; }
  if (t === 'frac') { var f = fracVal_(s); return f >= 0 && f <= 1 ? '' : 'write it like 1/3.'; }
  if (t === 'heir') {
    var hs = (ctx && ctx.heirs) || [];
    return hs.indexOf(s) >= 0 || s === oldV ? '' : 'not one of the heirs.';
  }
  if (t.indexOf('list:') === 0) {
    var L = (ctx && ctx.lists && ctx.lists[t.slice(5)]) || [];
    return L.indexOf(s) >= 0 || s === oldV ? '' : 'not on the list. Add it in Settings first.';
  }
  return '';
}
// The invitation message sent by WhatsApp (same text from the phone and from the Sheet menu). Plain ASCII.
function inviteText_(name, link, line, opts) {
  opts = opts || {};
  var t = 'Assalam o alaikum ' + name + ',\n\n';
  t += opts.custodian ? 'This sets up the Rental Inheritance app on your phone, so you can enter the ledger.\n\n'
    : 'You are invited to the family Rental Inheritance app. You can see the full ledger and download the summary; you cannot change it.\n\n';
  if (opts.keeper) t += 'You also keep ' + opts.keeper + '\'s account: the app will show a ' + opts.keeper + ' tab where you enter what you receive and spend for ' + opts.keeper + '.\n\n';
  t += 'On iPhone:\n1. Open this link in Safari: ' + link + '\n2. Tap "Copy invitation".\n3. Tap the Share button, then "Add to Home Screen".\n' +
    '4. Open "Inheritance" from your Home Screen and tap "Paste invitation".\n5. Choose a PIN of 4 to 6 digits. Face ID can be switched on later under Settings.\n\n' +
    'On Android: open the link in Chrome, tap Join, then choose a PIN. Install it from the Chrome menu if you like.\n\n' +
    'If the app asks for an invitation, copy this line and tap "Paste invitation":\n' + line + '\n\n' +
    'The invitation works for 7 days and only for you. Please do not forward it. If you forget your PIN, ask for a new invitation.';
  return t;
}


var NEED_SCRIPT = '1.5';
