/**
 * Rental Inheritance, workbook script.
 * Installed and updated by Loader.gs (menu "Rental Inheritance" > "Install update").
 * Kept thin on purpose: it stores rows, checks who may write, keeps the audit trail and photos,
 * and sends the ledger to the phones. Every calculation lives in the phone app.
 * Pure ASCII only (the update code is a SHA-256 of this file).
 */
var VERSION = '1.2.1';
var RELEASE_NOTE = '1.2.1: after an update the message says nothing else is needed (the deployment and phone steps show only on a new workbook). ' +
  '1.2: invitations made from the custodian\'s phone (Settings > People) with a ready message of instructions to send by WhatsApp; the Sheet menu shows the same message; the custodian\'s phone lists who has joined. Nothing removed. ' +
  '1.1: an heir\'s account kept by another heir (expenses, other money in, repeating charges, money held). The keeper\'s phone can write only those three tabs; the custodian can view them; other heirs never receive them. Adds tabs AF_EXP, AF_IN, AF_RECUR, AF_HELD and settings fund_for and fund_keeper. Nothing removed. ' +
  '1.0: first version. Ledger tabs for income, outflows, payments to heirs, TBZ months, money back to fund and opening balances; ' +
  'lists and rates kept as rows; custodian phone enters, heirs view; invitations; receipt photos in Drive; audit trail with a check; 2025-26 brought in as a closed year.';

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
//== SHARED END

// ===================== GOOGLE SERVICES (sheet side only) =====================

var MENU_ITEMS = [
  { label: 'Set up or repair', fn: 'setup' },
  { label: 'Set up my phone (custodian)', fn: 'inviteCustodian' },
  { label: 'Invite an heir (view only)', fn: 'inviteHeir' },
  { label: 'Who has access', fn: 'whoHasAccess' },
  { label: 'Remove a person', fn: 'removePerson' },
  { label: 'Change web app address', fn: 'changeWebAppUrl' },
  { label: 'Check the audit trail', fn: 'checkAudit' }
];
var PAGES_URL = 'https://ir1s-vir1s.github.io/rental-inheritance/';
var META = ['id', 'fy', 'extra', 'req_id', 'entered_at', 'entered_by', 'updated_at', 'updated_by'];
var SUPPORT = {
  FILES: ['file_id', 'tab', 'ref_id', 'drive_id', 'name', 'mime', 'bytes', 'uploaded_at', 'req_id'],
  DELETED: ['deleted_at', 'deleted_by', 'reason', 'tab', 'id', 'record'],
  AUDIT: ['time', 'who', 'role', 'action', 'tab', 'id', 'field', 'old', 'new', 'reason', 'hash'],
  SUMMARY: ['item', 'value'],
  LOG: ['time', 'event', 'detail']
};
var TEXT_FIELD_TYPES = { date: 1, month: 1, fy: 1, text: 1, frac: 1, heir: 1, yn: 1 };
var EXEC_RE = /^https:\/\/script\.google\.com\/(a\/macros\/[^\/]+|macros)\/s\/[A-Za-z0-9_-]+\/exec$/;
var REJOIN_MS = 24 * 3600 * 1000;

function head_(name) {
  if (SUPPORT[name]) return SUPPORT[name];
  var S = SCHEMA[name], fs = Object.keys(S.fields);
  return S.fyFrom ? ['id', 'fy'].concat(fs, META.slice(2)) : ['id'].concat(fs, META.slice(2));
}
function today_() {
  if (typeof __TODAY__ !== 'undefined' && __TODAY__) return __TODAY__;
  return Utilities.formatDate(new Date(), 'Asia/Karachi', 'yyyy-MM-dd');
}
function nowStamp_() { return Utilities.formatDate(new Date(), 'Asia/Karachi', 'yyyy-MM-dd HH:mm:ss'); }
function sha_(s) {
  var b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(s), Utilities.Charset.UTF_8);
  return b.map(function (x) { var h = ((x + 256) % 256).toString(16); return h.length < 2 ? '0' + h : h; }).join('');
}
function rand_(n) { return (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '').slice(0, n); }

// Opens a tab, creating it and back-filling missing header cells (new columns only ever go at the end).
function sheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName(name), head = head_(name);
  if (!sh) sh = ss.insertSheet(name);
  var lc = sh.getLastColumn(), have = lc ? sh.getRange(1, 1, 1, lc).getValues()[0] : [];
  var ok = head.every(function (h, i) { return have[i] === h; });
  if (!ok) {
    head.forEach(function (h, i) {
      if (have[i] !== undefined && have[i] !== '' && have[i] !== h) throw new Error('Tab ' + name + ', column ' + (i + 1) + ' should be "' + h + '" but is "' + have[i] + '". Fix the header, then try again.');
    });
    sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
    sh.setFrozenRows(1);
    var S = SCHEMA[name];
    head.forEach(function (h, i) {
      var F = S && S.fields[h];
      if (h === 'id' || h === 'fy' || h === 'req_id' || (F && TEXT_FIELD_TYPES[F.t]) || (SUPPORT[name] && h !== 'bytes')) {
        sh.getRange(2, i + 1, Math.max(sh.getMaxRows() - 1, 1), 1).setNumberFormat('@');
      }
    });
  }
  return sh;
}
function cell_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, 'Asia/Karachi', 'yyyy-MM-dd');
  return v === null || v === undefined ? '' : v;
}
function readRows_(name) {
  var sh = sheet_(name), head = head_(name), n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, head.length).getValues().map(function (r, i) {
    var o = { _row: i + 2 };
    head.forEach(function (h, j) { o[h] = cell_(r[j]); });
    return o;
  }).filter(function (o) { return head.some(function (h) { return o[h] !== ''; }); });
}
function append_(name, objs) {
  if (!objs.length) return;
  var sh = sheet_(name), head = head_(name);
  var vals = objs.map(function (o) { return head.map(function (h) { return o[h] === undefined ? '' : o[h]; }); });
  sh.getRange(sh.getLastRow() + 1, 1, vals.length, head.length).setValues(vals);
}
function writeRow_(name, rowNum, obj) {
  var head = head_(name);
  sheet_(name).getRange(rowNum, 1, 1, head.length).setValues([head.map(function (h) { return obj[h] === undefined ? '' : obj[h]; })]);
}
function nextId_(rows, prefix) {
  var max = rows.reduce(function (m, r) { var n = +String(r.id).replace(/\D/g, ''); return n > m ? n : m; }, 0);
  return prefix + ('0000' + (max + 1)).slice(-5);
}
function log_(event, detail) { try { append_('LOG', [{ time: nowStamp_(), event: event, detail: detail || '' }]); } catch (e) { } }

// ---------- audit trail: one row per changed field, each row chained to the one before by a hash ----------
function auditHash_(prev, r) {
  return sha_([prev, r.time, r.who, r.role, r.action, r.tab, r.id, r.field, r.old, r.new, r.reason].join('\u0001')).slice(0, 16);
}
function audit_(rows) {
  if (!rows.length) return;
  var sh = sheet_('AUDIT'), last = sh.getLastRow(), prev = last > 1 ? String(sh.getRange(last, 11).getValue()) : '';
  var t = nowStamp_();
  rows.forEach(function (r) {
    r.time = r.time || t;
    ['who', 'role', 'action', 'tab', 'id', 'field', 'old', 'new', 'reason'].forEach(function (k) { r[k] = r[k] === undefined || r[k] === null ? '' : String(r[k]); });
    r.hash = auditHash_(prev, r); prev = r.hash;
  });
  append_('AUDIT', rows);
}
function checkAuditRows_() {
  var rows = readRows_('AUDIT'), prev = '';
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i], o = {};
    ['time', 'who', 'role', 'action', 'tab', 'id', 'field', 'old', 'new', 'reason'].forEach(function (k) { o[k] = String(r[k]); });
    if (auditHash_(prev, o) !== String(r.hash)) return { ok: false, row: r._row, count: rows.length };
    prev = String(r.hash);
  }
  return { ok: true, count: rows.length };
}

// ---------- lists, heirs, settings ----------
function context_() {
  var lists = {};
  LIST_NAMES.forEach(function (n) { lists[n] = []; });
  readRows_('LISTS').forEach(function (r) {
    if (String(r.active) !== 'N') (lists[r.list] = lists[r.list] || []).push(String(r.value));
  });
  return { today: today_(), lists: lists, heirs: readRows_('HEIRS').map(function (h) { return String(h.name); }) };
}
function settings_() {
  var o = {};
  readRows_('SETTINGS').forEach(function (r) { o[r.key] = String(r.value); });
  return o;
}
function closedYears_() {
  return String(settings_().closed_years || '').split(/[,\s]+/).filter(Boolean);
}

// ---------- first-run content ----------
// Family names, rates, opening balances and earlier years are NOT in this published file. They come from History.gs,
// a private file pasted once into the same Apps Script project (it defines RI_HISTORY). Without it the workbook starts empty.
var HIST = (typeof RI_HISTORY !== 'undefined') ? RI_HISTORY : null;
function seed_() {
  var stamp = nowStamp_(), n = 0;
  function base(o, req) { o.entered_at = stamp; o.entered_by = 'setup'; o.req_id = req; return o; }
  function ids(prefix, list, req) { return list.map(function (o, i) { return base(Object.assign({ id: prefix + ('0000' + (i + 1)).slice(-5) }, o), req + i); }); }
  if (!readRows_('HEIRS').length && HIST && HIST.heirs) append_('HEIRS', ids('H', HIST.heirs, 'seed-H'));
  if (!readRows_('SETTINGS').length) {
    var S = [
      { key: 'custodian', value: '', note: 'Collects income and pays everyone. Own pending is not carried forward' },
      { key: 'tbz_collector', value: '', note: 'Collects the monthly rent and keeps it as part of his share' },
      { key: 'tbz_name', value: 'Monthly rent', note: 'Name shown for the TBZ tab' },
      { key: 'fixed_name', value: 'Fixed lease', note: 'Name of the income with a fixed yearly amount' },
      { key: 'fixed_source', value: '', note: 'Income source that counts toward the fixed amount' },
      { key: 'fixed_taken_from', value: '', note: 'Outflows "taken from" starting with this word come out of it' },
      { key: 'fixed_amount', value: '', note: 'Fixed yearly amount (Rs)' },
      { key: 'closed_years', value: '', note: 'Years that cannot be changed (comma separated)' }
    ];
    ((HIST && HIST.settings) || []).forEach(function (h) {
      var cur = S.filter(function (x) { return x.key === h.key; })[0];
      if (cur) { cur.value = h.value; if (h.note) cur.note = h.note; } else S.push(h);
    });
    append_('SETTINGS', ids('S', S, 'seed-S'));
  }
  if (!readRows_('LISTS').length) {
    var L = [];
    function add(list, vals, active) { vals.forEach(function (v, i) { L.push({ list: list, value: v, active: active || 'Y', sort: i + 1 }); }); }
    add('PAYMENT_TYPES', ['Cash', 'Qurbani', 'Adjustment']);
    add('CATEGORIES', ['Zakat', 'Charity', 'Other help', 'Property', 'Loan given', 'Qurbani', 'Unexplained']);
    add('TAKEN_FROM', ['Fund']);
    add('MODES', ['Cash']);
    if (HIST && HIST.lists) HIST.lists.forEach(function (x) { add(x.list, x.values, x.active); });
    if (!L.some(function (x) { return x.list === 'SOURCES'; })) add('SOURCES', ['Other']);
    append_('LISTS', ids('L', L, 'seed-L'));
  }
  if (!readRows_('TBZ_RATES').length && HIST && HIST.rates) append_('TBZ_RATES', ids('R', HIST.rates, 'seed-R'));
  if (!readRows_('OPENING').length && HIST && HIST.opening) {
    append_('OPENING', ids('B', HIST.opening.map(function (o) { return Object.assign({}, o); }), 'seed-B'));
  }
  if (HIST && HIST.years && !readRows_('INCOME').length && !readRows_('PAYMENTS').length) {
    var c = { INCOME: 0, OUTFLOWS: 0, PAYMENTS: 0, TBZ: 0, FUND_IN: 0 };
    HIST.years.forEach(function (Y) {
      Object.keys(c).forEach(function (t) {
        var rows = (Y[t] || []).map(function (o) {
          c[t]++;
          return base(Object.assign({ id: SCHEMA[t].prefix + ('0000' + c[t]).slice(-5), fy: Y.fy, date: '' }, o), 'import-' + Y.fy + '-' + t + c[t]);
        });
        if (rows.length) append_(t, rows);
      });
      log_('import', Y.fy + ' brought in from History.gs');
    });
  }
}

// Setting rows added in later versions are created on an existing workbook (blank, or from History.gs when it has them).
var LATER_SETTINGS = [
  { key: 'fund_for', note: 'Heir whose account is kept by another heir (name)' },
  { key: 'fund_keeper', note: 'Heir who keeps that account and enters its expenses (name)' }
];
function addMissingSettings_() {
  var rows = readRows_('SETTINGS'), have = rows.map(function (r) { return String(r.key); }), add = [], stamp = nowStamp_();
  var max = rows.reduce(function (m, r) { var k = +String(r.id).replace(/\D/g, ''); return k > m ? k : m; }, 0);
  LATER_SETTINGS.forEach(function (x) {
    if (have.indexOf(x.key) >= 0) return;
    var h = ((HIST && HIST.settings) || []).filter(function (y) { return y.key === x.key; })[0];
    max++;
    add.push({ id: 'S' + ('0000' + max).slice(-5), key: x.key, value: h ? h.value : '', note: x.note, entered_at: stamp, entered_by: 'setup', req_id: 'later-' + x.key });
  });
  if (add.length) append_('SETTINGS', add);
}
function keeperOf_(set) { return String(set.fund_keeper || '').trim().toLowerCase(); }
function isKeeper_(who, set) { var k = keeperOf_(set || settings_()); return !!k && String(who.name || '').trim().toLowerCase() === k; }

// ---------- menu actions ----------
function setup() {
  Object.keys(SCHEMA).concat(Object.keys(SUPPORT)).forEach(function (t) { sheet_(t); });
  var ss = SpreadsheetApp.getActiveSpreadsheet(), s1 = ss.getSheetByName('Sheet1');
  if (s1 && s1.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(s1);
  var p = PropertiesService.getScriptProperties();
  if (!p.getProperty('PI_EMAIL')) {
    var me = ''; try { me = Session.getEffectiveUser().getEmail(); } catch (e) { }
    p.setProperty('PI_EMAIL', me);
  }
  seed_();
  addMissingSettings_();
  p.setProperty('SCHEMA_VER', String(CFG.SCHEMA_VER));
  log_('setup', 'version ' + VERSION);
  // First time only: the deployment and phone steps. After an update nothing else is needed (the Loader keeps the same web app address).
  var firstTime = !p.getProperty('WEBAPP_URL') && !tokens_().length;
  SpreadsheetApp.getUi().alert(firstTime
    ? CFG.APP_NAME + ' ' + VERSION + ' is ready.\n\nNext: Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone), then "Set up my phone (custodian)".'
    : CFG.APP_NAME + ' ' + VERSION + ' is installed.\n\nNothing else to do: no new deployment is needed and phones keep working. They pick up the change at their next sync.');
}

function webAppUrl_(ui, ask) {
  var p = PropertiesService.getScriptProperties(), saved = p.getProperty('WEBAPP_URL');
  if (saved && !ask) return saved;
  var auto = '';
  try { auto = ScriptApp.getService().getUrl() || ''; } catch (e) { }
  if (!ask && EXEC_RE.test(auto)) { p.setProperty('WEBAPP_URL', auto); return auto; }
  var r = ui.prompt('Web app address',
    'In Apps Script: Deploy > Manage deployments. Copy the Web app URL (it ends in /exec) and paste it here.\n' +
    'If there is no deployment yet: Deploy > New deployment > Web app, Execute as: Me, Who has access: Anyone.', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return '';
  var v = String(r.getResponseText() || '').trim();
  if (!EXEC_RE.test(v)) { ui.alert('That is not the web app address. It starts with https://script.google.com/macros/s/ and ends with /exec. Nothing was changed.'); return ''; }
  p.setProperty('WEBAPP_URL', v);
  log_('web app address set', '');
  return v;
}
function changeWebAppUrl() {
  var ui = SpreadsheetApp.getUi();
  if (webAppUrl_(ui, true)) ui.alert('Saved. Phones keep working only if the address did not change; otherwise invite them again.');
}
function makeInvite_(name, role, byWho) {
  var url = byWho ? webAppUrlNoUi_() : webAppUrl_(SpreadsheetApp.getUi(), false);
  if (!url) return null;
  var code = rand_(14).toUpperCase();
  PropertiesService.getScriptProperties().setProperty('APPJOIN_' + sha_(code),
    JSON.stringify({ exp: Date.now() + 7 * 864e5, name: name, role: role, first: 0, tok: '' }));
  log_('invitation made', name + ' (' + role + ')');
  audit_([{ who: byWho ? byWho.name : me_(), role: byWho ? byWho.role : 'owner', action: 'invite', tab: 'ACCESS', id: name, field: 'role', old: '', new: role }]);
  var line = 'RI1.' + Utilities.base64EncodeWebSafe(url).replace(/=+$/, '') + '.' + code;
  var link = PAGES_URL + '#join=' + line, set = settings_();
  var keeper = String(set.fund_keeper || '').trim().toLowerCase() === String(name).trim().toLowerCase() && set.fund_for ? String(set.fund_for) : '';
  return { line: line, link: link, text: inviteText_(name, link, line, { custodian: role === 'custodian', keeper: keeper }) };
}
function webAppUrlNoUi_() {
  var p = PropertiesService.getScriptProperties(), saved = p.getProperty('WEBAPP_URL');
  if (saved) return saved;
  var auto = ''; try { auto = ScriptApp.getService().getUrl() || ''; } catch (e) { }
  return EXEC_RE.test(auto) ? auto : '';
}
function me_() { try { return Session.getEffectiveUser().getEmail() || 'owner'; } catch (e) { return 'owner'; } }
function isOwner_() {
  var pi = PropertiesService.getScriptProperties().getProperty('PI_EMAIL') || '';
  return !pi || me_() === pi;
}
function showInvite_(inv, name, role) {
  var ui = SpreadsheetApp.getUi();
  var html = HtmlService.createHtmlOutput(
    '<div style="font-family:Arial;font-size:14px">' +
    '<p><b>' + name + '</b> (' + (role === 'custodian' ? 'custodian, can enter' : 'view only') + ')</p>' +
    '<p>1. Send this link by WhatsApp. On the iPhone open it in <b>Safari</b>, tap Share, then <b>Add to Home Screen</b>.</p>' +
    '<textarea readonly style="width:100%;height:70px" onclick="this.select()">' + inv.link + '</textarea>' +
    '<p>2. Open the app from the Home Screen. If it asks for an invitation, copy this line and tap "Paste invitation":</p>' +
    '<textarea readonly style="width:100%;height:60px" onclick="this.select()">' + inv.line + '</textarea>' +
    '<p>Valid for 7 days. After first use it works again for 24 hours (for the Home Screen copy), then never.</p>' +
    '<p><b>Or send this ready message</b> (instructions included):</p>' +
    '<textarea readonly style="width:100%;height:150px" onclick="this.select()">' + String(inv.text).replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</textarea></div>')
    .setWidth(480).setHeight(560);
  ui.showModalDialog(html, 'Invitation');
}
function inviteCustodian() {
  if (!isOwner_()) { SpreadsheetApp.getUi().alert('Only the owner of this workbook can do this.'); return; }
  var name = settings_().custodian || 'Custodian';
  var inv = makeInvite_(name, 'custodian');
  if (inv) showInvite_(inv, name, 'custodian');
}
function inviteHeir() {
  var ui = SpreadsheetApp.getUi();
  if (!isOwner_()) { ui.alert('Only the owner of this workbook can do this.'); return; }
  var heirs = readRows_('HEIRS').map(function (h) { return String(h.name); });
  var r = ui.prompt('Invite an heir (view only)', 'Type the name (' + heirs.join(', ') + ', or any other name):', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  var name = String(r.getResponseText() || '').trim().slice(0, 40);
  if (!name) return;
  var inv = makeInvite_(name, 'viewer');
  if (inv) showInvite_(inv, name, 'viewer');
}
function tokens_() {
  var all = PropertiesService.getScriptProperties().getProperties(), out = [];
  Object.keys(all).forEach(function (k) {
    if (k.indexOf('APP_') === 0) { try { var v = JSON.parse(all[k]); v.key = k; out.push(v); } catch (e) { } }
  });
  return out;
}
function whoHasAccess() {
  var t = tokens_();
  SpreadsheetApp.getUi().alert(t.length ? t.map(function (x) { return x.name + ' (' + (x.role === 'custodian' ? 'custodian' : 'view only') + '), joined ' + x.at + (x.seen ? ', last synced ' + x.seen : ''); }).join('\n') : 'No phones yet.');
}
function removePerson() {
  var ui = SpreadsheetApp.getUi();
  if (!isOwner_()) { ui.alert('Only the owner of this workbook can do this.'); return; }
  var t = tokens_(), names = t.map(function (x) { return x.name; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
  if (!names.length) { ui.alert('No phones have joined yet.'); return; }
  var r = ui.prompt('Remove a person', 'Type the name to cut off (' + names.join(', ') + '). Their phone stops at its next sync.', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  var name = String(r.getResponseText() || '').trim(), p = PropertiesService.getScriptProperties(), n = 0;
  t.forEach(function (x) { if (x.name.toLowerCase() === name.toLowerCase()) { p.deleteProperty(x.key); n++; } });
  var all = p.getProperties();
  Object.keys(all).forEach(function (k) {
    if (k.indexOf('APPJOIN_') === 0) { try { if (JSON.parse(all[k]).name.toLowerCase() === name.toLowerCase()) p.deleteProperty(k); } catch (e) { } }
  });
  if (n) audit_([{ who: me_(), role: 'owner', action: 'remove access', tab: 'ACCESS', id: name, field: 'phones', old: String(n), new: '0' }]);
  log_('access removed', name + ': ' + n + ' phone(s)');
  ui.alert(n ? 'Removed ' + name + ' (' + n + ' phone' + (n > 1 ? 's' : '') + ').' : 'Nobody called "' + name + '" has a phone joined.');
}
function checkAudit() {
  var r = checkAuditRows_();
  SpreadsheetApp.getUi().alert(r.ok ? 'Audit trail is intact (' + r.count + ' rows).' : 'The audit trail was changed by hand at row ' + r.row + ' of the AUDIT tab (or a row before it was removed).');
}

// ---------- web app ----------
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function doGet(e) { return ContentService.createTextOutput(CFG.APP_NAME + ' ' + VERSION + ' is running.'); }
function doPost(e) {
  var out;
  try { out = api_(JSON.parse(e.postData.contents)); }
  catch (err) { out = { ok: false, code: 400, error: 'Bad request: ' + String(err && err.message || err) }; }
  return json_(out);
}
function api_(b) {
  var props = PropertiesService.getScriptProperties();
  if (String(props.getProperty('SCHEMA_VER')) !== String(CFG.SCHEMA_VER)) {
    return { ok: false, code: 409, error: 'The workbook is being updated. Open the Sheet and run "Set up or repair".' };
  }
  if (b.op === 'join') return join_(b);
  var who = b.token ? props.getProperty('APP_' + sha_(b.token)) : null;
  if (!who) return { ok: false, code: 401, error: 'This phone has no access. Ask for a new invitation.' };
  who = JSON.parse(who);
  if (b.op === 'hello') return { ok: true, role: who.role, name: who.name, version: VERSION };
  if (b.op === 'pull') return pull_(who, b.token);
  if (b.op === 'file') return getFile_(b, who);
  var keeper = who.role !== 'custodian' && isKeeper_(who);
  if (who.role !== 'custodian' && !keeper) return { ok: false, code: 403, error: 'This phone can view only.' };
  if (b.op === 'push') return push_(b.items || [], who, keeper);
  if (b.op === 'invite' && !keeper) return apiInvite_(b, who);
  if (b.op === 'people' && !keeper) return { ok: true, people: people_() };
  if (b.op === 'upload') return upload_(b, who, keeper);
  if (keeper) return { ok: false, code: 403, error: 'This phone can enter only the account it keeps.' };
  if (b.op === 'snapshot') return snapshot_(b);
  return { ok: false, code: 400, error: 'unknown operation' };
}
function join_(b) {
  var code = String(b.code || '').trim().toUpperCase(), props = PropertiesService.getScriptProperties();
  var key = 'APPJOIN_' + sha_(code), raw = props.getProperty(key);
  if (!code || !raw) return { ok: false, code: 403, error: 'That invitation is not valid. Ask for a new one.' };
  var inv = JSON.parse(raw), now = Date.now();
  if (inv.exp < now && !inv.first) { props.deleteProperty(key); return { ok: false, code: 403, error: 'That invitation has expired. Ask for a new one.' }; }
  if (inv.first && now - inv.first > REJOIN_MS) { props.deleteProperty(key); return { ok: false, code: 403, error: 'That invitation was already used. Ask for a new one.' }; }
  var again = !!inv.first;
  if (inv.tok) props.deleteProperty('APP_' + inv.tok);
  var token = rand_(40), tsha = sha_(token);
  props.setProperty('APP_' + tsha, JSON.stringify({ name: inv.name, role: inv.role, at: nowStamp_() }));
  inv.first = inv.first || now; inv.tok = tsha;
  props.setProperty(key, JSON.stringify(inv));
  log_(again ? 'invitation used again (earlier copy cut off)' : 'phone joined', inv.name + ' (' + inv.role + ')');
  audit_([{ who: inv.name, role: inv.role, action: again ? 'joined again' : 'joined', tab: 'ACCESS', id: inv.name }]);
  return { ok: true, token: token, role: inv.role, name: inv.name };
}
function clean_(tab, r) {
  var o = {};
  head_(tab).forEach(function (h) { if (h !== 'req_id') o[h] = r[h]; });
  return o;
}
function pull_(who, token) {
  var set = settings_(), seesAF = who.role === 'custodian' || isKeeper_(who, set);
  var D = { version: VERSION, today: today_(), role: who.role, name: who.name, keeper: who.role !== 'custodian' && isKeeper_(who, set), tables: {} };
  Object.keys(SCHEMA).forEach(function (t) { D.tables[t] = AF_TABS.indexOf(t) >= 0 && !seesAF ? [] : readRows_(t).map(function (r) { return clean_(t, r); }); });
  D.files = readRows_('FILES').filter(function (f) { return seesAF || AF_TABS.indexOf(String(f.tab)) < 0; }).map(function (f) { return { file_id: f.file_id, tab: f.tab, ref_id: String(f.ref_id), name: f.name, bytes: +f.bytes }; });
  var p = PropertiesService.getScriptProperties(), k = 'APP_' + sha_(token), raw = p.getProperty(k);
  if (raw) { var v = JSON.parse(raw), d = today_(); if (v.seen !== d) { v.seen = d; p.setProperty(k, JSON.stringify(v)); } }
  return { ok: true, data: D };
}

function push_(items, who, keeper) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  var results = [];
  try {
    var ctx = context_(), closed = closedYears_(), stamp = nowStamp_();
    items.forEach(function (it) {
      var res;
      var af = it && AF_TABS.indexOf(it.tab) >= 0;
      try { res = keeper && !af ? { ok: false, error: 'This phone can enter only the account it keeps.' } : !keeper && af ? { ok: false, error: 'Only the account keeper enters this account.' } : pushOne_(it, who, ctx, closed, stamp); }
      catch (err) { res = { ok: false, error: 'Server error: ' + String(err && err.message || err) }; }
      res.req_id = it && it.req_id;
      results.push(res);
      if (res.ok && !res.dup && (it.tab === 'LISTS' || it.tab === 'HEIRS')) ctx = context_();
      if (res.ok && !res.dup && it.tab === 'SETTINGS') closed = closedYears_();
    });
  } finally { lock.releaseLock(); }
  return { ok: true, results: results };
}
function pushOne_(it, who, ctx, closed, stamp) {
  if (!it || !it.req_id) return { ok: false, error: 'Missing request id.' };
  var tab = it.tab, S = SCHEMA[tab];
  if (!S) return { ok: false, error: 'Unknown table.' };
  var rows = readRows_(tab);
  if (it.op === 'save') {
    var rec = it.rec || {}, fields = Object.keys(S.fields);
    var cur = rec.id ? rows.filter(function (r) { return r.id === rec.id; })[0] : null;
    var dupe = rows.filter(function (r) { return String(r.req_id) === String(it.req_id); })[0];
    if (dupe && !cur) return { ok: true, dup: true, id: dupe.id };
    if (rec.id && !cur) return { ok: false, gone: true, error: 'This entry was deleted from the workbook.' };
    var c2 = { today: ctx.today, lists: ctx.lists, heirs: ctx.heirs, old: cur };
    var e = validateRecord_(tab, rec, c2);
    if (e) return { ok: false, error: e };
    if (tab === 'HEIRS' && !cur && ctx.heirs.indexOf(String(rec.name).trim()) >= 0) return { ok: false, error: 'That heir is already listed.' };
    if (tab === 'SETTINGS') {
      var same = rows.filter(function (r) { return r.key === String(rec.key).trim() && (!cur || r.id !== cur.id); })[0];
      if (same) return { ok: false, error: 'That setting already exists.' };
    }
    var fy = S.fyFrom ? fyOf_(tab, rec) : '';
    if (fy && closed.indexOf(fy) >= 0) return { ok: false, error: fy + ' is closed. Reopen it in Settings first.' };
    if (cur && cur.fy && closed.indexOf(String(cur.fy)) >= 0) return { ok: false, error: cur.fy + ' is closed. Reopen it in Settings first.' };
    var row = cur ? JSON.parse(JSON.stringify(cur)) : { id: nextId_(rows, S.prefix), req_id: it.req_id, entered_at: stamp, entered_by: who.name };
    var changes = [];
    fields.forEach(function (k) {
      var nv = rec[k] === undefined || rec[k] === null ? '' : String(rec[k]).trim();
      var F = S.fields[k];
      if (nv !== '' && (F.t === 'amt' || F.t === 'samt' || F.t === 'int')) nv = Number(nv);
      if (String(row[k] === undefined ? '' : row[k]) !== String(nv)) changes.push({ field: k, old: row[k] === undefined ? '' : row[k], nv: nv });
      row[k] = nv;
    });
    var ex = rec.extra === undefined || rec.extra === null ? '' : String(rec.extra);
    if (String(row.extra || '') !== ex) changes.push({ field: 'extra', old: row.extra || '', nv: ex });
    row.extra = ex;
    if (S.fyFrom) row.fy = fy;
    if (cur && !changes.length) return { ok: true, dup: true, id: cur.id };
    if (cur) { row.updated_at = stamp; row.updated_by = who.name; writeRow_(tab, cur._row, row); }
    else append_(tab, [row]);
    audit_(changes.map(function (c) {
      return { who: who.name, role: who.role, action: cur ? 'edit' : 'add', tab: tab, id: row.id, field: c.field, old: cur ? c.old : '', new: c.nv, reason: it.reason || '' };
    }));
    return { ok: true, id: row.id, fy: row.fy || '' };
  }
  if (it.op === 'del') {
    var d = rows.filter(function (r) { return r.id === it.id; })[0];
    if (!d) return { ok: true, dup: true, gone: true };
    if (!String(it.reason || '').trim()) return { ok: false, error: 'Give a reason for deleting.' };
    if (d.fy && closed.indexOf(String(d.fy)) >= 0) return { ok: false, error: d.fy + ' is closed. Reopen it in Settings first.' };
    var copy = clean_(tab, d);
    append_('DELETED', [{ deleted_at: stamp, deleted_by: who.name, reason: String(it.reason).slice(0, 300), tab: tab, id: d.id, record: JSON.stringify(copy) }]);
    sheet_(tab).deleteRow(d._row);
    audit_([{ who: who.name, role: who.role, action: 'delete', tab: tab, id: d.id, field: '(whole entry)', old: JSON.stringify(copy), new: '', reason: String(it.reason).slice(0, 300) }]);
    return { ok: true, deleted: d.id };
  }
  return { ok: false, error: 'Unknown change.' };
}

// The custodian's phone sends its worked-out summary so it can also be read in the workbook.
function snapshot_(b) {
  var rows = (b.rows || []).slice(0, 400).map(function (r) { return { item: String(r[0]).slice(0, 200), value: typeof r[1] === 'number' ? r[1] : String(r[1]).slice(0, 200) }; });
  var sh = sheet_('SUMMARY');
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 2).clearContent();
  if (rows.length) append_('SUMMARY', rows);
  return { ok: true };
}

function photosFolder_() {
  var p = PropertiesService.getScriptProperties(), id = p.getProperty('PHOTOS_FOLDER');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) { } }
  var f = DriveApp.createFolder('Rental Inheritance photos');
  p.setProperty('PHOTOS_FOLDER', f.getId());
  return f;
}
function upload_(b, who, keeper) {
  if (!SCHEMA[b.tab]) return { ok: false, error: 'Unknown attachment.' };
  if (keeper ? (b.tab !== 'AF_EXP' && b.tab !== 'AF_IN') : AF_TABS.indexOf(b.tab) >= 0) return { ok: false, code: 403, error: keeper ? 'This phone can attach photos only to its account.' : 'Only the account keeper attaches photos there.' };
  if (!/^image\/(jpeg|png)$/.test(b.mime || '')) return { ok: false, error: 'Only photos can be attached.' };
  if (!b.b64 || b.b64.length > 8 * 1024 * 1024) return { ok: false, error: 'That photo is too large.' };
  if (!b.req_id || !b.ref) return { ok: false, error: 'Missing details.' };
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var files = readRows_('FILES');
    var dup = files.filter(function (f) { return String(f.req_id) === String(b.req_id); })[0];
    if (dup) return { ok: true, dup: true, file_id: dup.file_id };
    var parent = readRows_(b.tab).filter(function (r) { return r.id === b.ref || String(r.req_id) === String(b.ref); })[0];
    if (!parent) return { ok: false, retry: true, error: 'The entry for this photo has not reached the workbook yet.' };
    var bytes = Utilities.base64Decode(b.b64);
    var n = files.filter(function (f) { return f.ref_id === parent.id; }).length + 1;
    var name = parent.id + '_' + (parent.date || parent.month || parent.fy || '') + '_' + n + (b.mime === 'image/png' ? '.png' : '.jpg');
    var file = photosFolder_().createFile(Utilities.newBlob(bytes, b.mime, name));
    var max = files.reduce(function (m, f) { var k = +String(f.file_id).replace(/\D/g, ''); return k > m ? k : m; }, 0);
    var row = { file_id: 'X' + ('0000' + (max + 1)).slice(-5), tab: b.tab, ref_id: parent.id, drive_id: file.getId(), name: name, mime: b.mime,
      bytes: bytes.length, uploaded_at: nowStamp_(), req_id: b.req_id };
    append_('FILES', [row]);
    audit_([{ who: who.name, role: who.role, action: 'photo', tab: b.tab, id: parent.id, field: 'photo', new: name }]);
    return { ok: true, file_id: row.file_id, ref_id: parent.id };
  } finally { lock.releaseLock(); }
}
function getFile_(b, who) {
  var f = readRows_('FILES').filter(function (x) { return x.file_id === b.file_id; })[0];
  if (!f) return { ok: false, error: 'Photo not found.' };
  if (AF_TABS.indexOf(String(f.tab)) >= 0 && who && who.role !== 'custodian' && !isKeeper_(who)) return { ok: false, code: 403, error: 'Photo not found.' };
  var blob = DriveApp.getFileById(f.drive_id).getBlob();
  return { ok: true, mime: f.mime, b64: Utilities.base64Encode(blob.getBytes()) };
}

// Invitation made from the custodian's phone. View-only, for anyone the custodian names.
function apiInvite_(b, who) {
  var name = String(b.name || '').trim().slice(0, 40);
  if (!name) return { ok: false, error: 'Type a name.' };
  if (name.toLowerCase() === String(who.name || '').toLowerCase()) return { ok: false, error: 'That is you. Use "Set up my phone" in the Sheet to set up another phone of yours.' };
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var inv = makeInvite_(name, 'viewer', who);
    if (!inv) return { ok: false, error: 'The web app address is not saved yet. In the Sheet use "Change web app address" once.' };
    return { ok: true, name: name, link: inv.link, line: inv.line, text: inv.text };
  } finally { lock.releaseLock(); }
}
// Who has joined (names only; no codes or tokens leave the workbook).
function people_() {
  var set = settings_(), k = String(set.fund_keeper || '').trim().toLowerCase();
  return tokens_().map(function (x) { return { name: x.name, role: x.role, joined: x.at || '', seen: x.seen || '', keeper: x.role !== 'custodian' && !!k && String(x.name).toLowerCase() === k }; })
    .sort(function (a, b) { return a.name < b.name ? -1 : 1; });
}

// Everything the loader may call.
function exports_() {
  return {
    VERSION: VERSION, RELEASE_NOTE: RELEASE_NOTE, MENU_ITEMS: MENU_ITEMS,
    setup: setup, inviteCustodian: inviteCustodian, inviteHeir: inviteHeir, whoHasAccess: whoHasAccess,
    removePerson: removePerson, changeWebAppUrl: changeWebAppUrl, checkAudit: checkAudit, doPost: doPost, doGet: doGet
  };
}
