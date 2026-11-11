/* Rental Inheritance: every calculation, done on the phone. Needs logic.js (generated from the workbook script). */
'use strict';
var CALC_VER = 1;

function sum_(a, f) { return a.reduce(function (s, x) { return s + (Number(f ? f(x) : x) || 0); }, 0); }
function settingsOf(D) { var o = {}; (D.tables.SETTINGS || []).forEach(function (r) { o[r.key] = String(r.value); }); return o; }
function heirsOf(D) {
  return (D.tables.HEIRS || []).map(function (h) { return { name: String(h.name), share: fracVal_(h.share), shareText: String(h.share), qurbani: Number(h.qurbani) || 0, note: h.note || '' }; });
}
function listOf(D, name, all) {
  return (D.tables.LISTS || []).filter(function (r) { return r.list === name && (all || String(r.active) !== 'N'); })
    .sort(function (a, b) { return (Number(a.sort) || 0) - (Number(b.sort) || 0); }).map(function (r) { return String(r.value); });
}
function closedYears(D) { return String(settingsOf(D).closed_years || '').split(/[,\s]+/).filter(Boolean); }
function fyStart(fy) { return +fy.slice(0, 4); }
function fyLabel(fy) { return 'July ' + fy.slice(0, 4) + ' to June ' + (fyStart(fy) + 1); }
function fyPrev(fy) { var s = fyStart(fy) - 1; return s + '-' + pad2_((s + 1) % 100); }
function fyNext(fy) { var s = fyStart(fy) + 1; return s + '-' + pad2_((s + 1) % 100); }
function fyMonths(fy) { var s = fyStart(fy), out = []; for (var i = 0; i < 12; i++) { var m = 7 + i, y = s + (m > 12 ? 1 : 0); out.push(y + '-' + pad2_(m > 12 ? m - 12 : m)); } return out; }
function allYears(D, today) {
  var seen = {};
  ['INCOME', 'OUTFLOWS', 'PAYMENTS', 'TBZ', 'FUND_IN', 'OPENING'].forEach(function (t) { (D.tables[t] || []).forEach(function (r) { if (r.fy) seen[r.fy] = 1; }); });
  if (today) seen[fyOfMonth_(today.slice(0, 7))] = 1;
  return Object.keys(seen).sort();
}
function tbzRate(D, mk) {
  var best = null;
  (D.tables.TBZ_RATES || []).forEach(function (r) { if (String(r.from_month) <= mk && (!best || String(r.from_month) >= String(best.from_month))) best = r; });
  return best ? Number(best.rent) : 0;
}
function groupNumR(n) { return groupNum_(Math.round(n)); }
function groupNum_(n) {
  var neg = n < 0, s = String(Math.round(Math.abs(n))), out = '';
  while (s.length > 3) { out = ',' + s.slice(-3) + out; s = s.slice(0, -3); }
  return (neg ? '-' : '') + s + out;
}
function fmtRs(n) { return 'Rs ' + groupNum_(n); }
function fmtDate(ymd) {
  if (!isYmd_(ymd)) return ymd ? String(ymd) : 'No date';
  return (+ymd.slice(8)) + ' ' + CFG.MONTHS[+ymd.slice(5, 7) - 1].slice(0, 3) + ' ' + ymd.slice(0, 4);
}
function fmtMonth(mk) { return isMonth_(mk) ? CFG.MONTHS[+mk.slice(5, 7) - 1].slice(0, 3) + ' ' + mk.slice(0, 4) : String(mk || ''); }

// The whole year worked out. today (yyyy-mm-dd) decides which TBZ months should have arrived.
function yearCalc(D, fy, today, depth) {
  var set = settingsOf(D), heirs = heirsOf(D), cust = set.custodian || '', tbzBy = set.tbz_collector || '';
  var fixName = set.fixed_name || 'Fixed lease', fixSrc = String(set.fixed_source || fixName).toLowerCase(), fixFrom = String(set.fixed_taken_from || fixName.split(' ')[0]).toLowerCase();
  function inFy(t) { return (D.tables[t] || []).filter(function (r) { return r.fy === fy; }); }
  var income = inFy('INCOME'), out = inFy('OUTFLOWS'), pays = inFy('PAYMENTS'), tbz = inFy('TBZ'), fin = inFy('FUND_IN'), open = inFy('OPENING');
  var isFund = function (o) { return String(o.taken_from).trim().toLowerCase() === 'fund'; };

  // TBZ months count as received automatically at the rate on file, up to this month. A stored row only exists
  // where the custodian changed a month (not received, a different rent, a note).
  var curMonth = today ? today.slice(0, 7) : '9999-12', tbzFrom = String(set.tbz_taken_from || 'TBZ').toLowerCase();
  var isTbzOut = function (o) { return String(o.taken_from).trim().toLowerCase().indexOf(tbzFrom) === 0; };
  var auto = fyMonths(fy).filter(function (m) { return m <= curMonth && !tbz.some(function (r) { return r.month === m; }) && tbzRate(D, m) > 0; })
    .map(function (m) { return { id: '', auto: true, fy: fy, month: m, rent: tbzRate(D, m), expenses: '', received: 'Y', note: '' }; });
  var tbzAll = tbz.concat(auto).sort(function (a, b) { return a.month < b.month ? -1 : 1; });
  var T = { name: set.tbz_name || 'Monthly rent', collector: tbzBy || 'the collector', takenFrom: set.tbz_taken_from || 'TBZ',
    gross: sum_(tbzAll.filter(function (r) { return r.received === 'Y'; }), function (r) { return r.rent; }),
    expenses: sum_(tbz, function (r) { return r.expenses; }), auto: auto.length };
  T.outRows = out.filter(function (o) { return o.charged === 'Y' && !isFund(o) && isTbzOut(o); });
  T.outflows = sum_(T.outRows, function (o) { return o.amount; });
  T.net = T.gross - T.expenses - T.outflows;
  T.expected = fyMonths(fy).filter(function (m) { return m <= curMonth; }).map(function (m) {
    var row = tbzAll.filter(function (r) { return r.month === m; })[0];
    return { month: m, rate: tbzRate(D, m), row: row || null };
  });
  T.missing = T.expected.filter(function (x) { return x.row && x.row.received !== 'Y'; });

  var incomeRows = sum_(income, function (r) { return r.amount; });
  var gross = incomeRows + T.gross;
  var chargedRows = out.filter(function (o) { return o.charged === 'Y' && !isFund(o); });
  var charged = sum_(chargedRows, function (o) { return o.amount; }) + T.expenses;
  var notCharged = out.filter(function (o) { return o.charged !== 'Y' && !isFund(o); });
  var net = gross - charged;

  var H = heirs.map(function (h) {
    var p = pays.filter(function (x) { return x.heir === h.name; });
    var opening = sum_(open.filter(function (o) { return String(o.item).toLowerCase() === h.name.toLowerCase(); }), function (o) { return o.amount; });
    var tbzRet = h.name === tbzBy ? T.net : 0;
    var cash = sum_(p.filter(function (x) { return x.cash === 'Y'; }), function (x) { return x.amount; });
    var nonCash = sum_(p.filter(function (x) { return x.cash !== 'Y'; }), function (x) { return x.amount; }) + tbzRet;
    var ent = Math.round(net * h.share), received = cash + nonCash, pending = ent + opening - received;
    var carry = h.name === cust ? 'No (custodian)' : Math.abs(pending) <= 1 ? 'Settled (rounding)' : pending > 0 ? 'Yes, owed to ' + h.name : 'Overpaid';
    return { name: h.name, share: h.share, shareText: h.shareText, entitlement: ent, opening: opening, tbzRetained: tbzRet, cash: cash, nonCash: nonCash,
      received: received, pending: pending, carry: carry, custodian: h.name === cust, payments: p };
  });

  var openCashRow = open.filter(function (o) { return String(o.item).toLowerCase() === 'cash'; });
  var prevFy = fyPrev(fy), hasPrev = allYears(D).indexOf(prevFy) >= 0 && (depth || 0) < 20;
  var cashOpen = openCashRow.length ? sum_(openCashRow, function (o) { return o.amount; }) : hasPrev ? yearCalc(D, prevFy, today, (depth || 0) + 1).cash.shouldHave : 0;
  var collected = sum_(income.filter(function (r) { return r.collected_by === cust; }), function (r) { return r.amount; });
  var fundIn = sum_(fin, function (r) { return r.amount; });
  var fundOutRows = out.filter(isFund);
  var outPaid = sum_(out.filter(function (o) { return o.paid_by === cust && (o.charged === 'Y' || isFund(o)); }), function (o) { return o.amount; });
  var paidHeirs = sum_(pays.filter(function (x) { return x.cash === 'Y'; }), function (x) { return x.amount; });
  var shouldHave = cashOpen + collected + fundIn - outPaid - paidHeirs;
  var actualTxt = set['cash_actual_' + fy], actual = actualTxt === undefined || actualTxt === '' ? null : Number(actualTxt);

  var fundAll = 0;
  allYears(D).filter(function (y) { return y <= fy; }).forEach(function (y) {
    fundAll += sum_((D.tables.FUND_IN || []).filter(function (r) { return r.fy === y; }), function (r) { return r.amount; });
    fundAll -= sum_((D.tables.OUTFLOWS || []).filter(function (r) { return r.fy === y && isFund(r); }), function (r) { return r.amount; });
  });

  var patFixed = Number(set.fixed_amount) || 0;
  var patRows = income.filter(function (r) { return String(r.source).toLowerCase() === fixSrc; });
  var patRec = sum_(patRows, function (r) { return r.amount; });
  var patOut = sum_(chargedRows.filter(function (o) { return String(o.taken_from).toLowerCase().indexOf(fixFrom) === 0; }), function (o) { return o.amount; });

  var R = {
    fy: fy, closed: closedYears(D).indexOf(fy) >= 0, custodian: cust,
    income: income, outflows: out, payments: pays, tbzRows: tbzAll, fundIn: fin, opening: open,
    incomeRows: incomeRows, gross: gross, charged: charged, chargedRows: chargedRows, notCharged: notCharged, net: net, tbz: T,
    heirs: H, totals: { entitlement: sum_(H, function (h) { return h.entitlement; }), received: sum_(H, function (h) { return h.received; }), pending: sum_(H, function (h) { return h.pending; }) },
    cash: { opening: cashOpen, openingFrom: openCashRow.length ? 'entered' : hasPrev ? 'carried from ' + prevFy : 'none', collected: collected, fundIn: fundIn,
      outPaid: outPaid, paidHeirs: paidHeirs, shouldHave: shouldHave, actual: actual, diff: actual === null ? null : actual - shouldHave,
      owedOthers: sum_(H.filter(function (h) { return !h.custodian && h.pending > 1; }), function (h) { return h.pending; }),
      ownPending: sum_(H.filter(function (h) { return h.custodian; }), function (h) { return h.pending; }) },
    fund: { inYear: fundIn, outYear: sum_(fundOutRows, function (o) { return o.amount; }), balance: fundAll, outRows: fundOutRows },
    patoki: { name: fixName, fixed: patFixed, received: patRec, due: patFixed - patRec, takenOut: patOut, netIntoPool: patRec - patOut, rows: patRows },
    shareSum: sum_(heirs, function (h) { return h.share; })
  };
  R.checks = yearChecks(D, R, today);
  return R;
}

// Things to look at, each with a tier: 1 act now (red), 2 act soon (orange), 3 information (grey).
function yearChecks(D, R, today) {
  var c = [];
  function add(tier, text, kind, ref) { c.push({ tier: tier, text: text, kind: kind || '', ref: ref || null }); }
  if (Math.abs(R.shareSum - 1) > 1e-9) add(1, 'Shares add up to ' + R.shareSum.toFixed(4) + ', not 1. Fix them in Settings.', 'settings');
  if (R.patoki.fixed && R.patoki.received > R.patoki.fixed) add(1, R.patoki.name + ' received ' + fmtRs(R.patoki.received) + ', more than the fixed ' + fmtRs(R.patoki.fixed) + '.', 'patoki');
  R.heirs.forEach(function (h) { if (!h.custodian && h.pending < -1) add(2, h.name + ' has been paid ' + fmtRs(-h.pending) + ' more than the share.', 'heir', h.name); });
  R.notCharged.forEach(function (o) { add(2, 'Not charged to the pool: ' + o.payee + ', ' + fmtRs(o.amount) + '. Decide: charge it or delete it.', 'entry', { tab: 'OUTFLOWS', id: o.id }); });
  R.tbz.missing.forEach(function (m) { add(2, R.tbz.name + ' ' + fmtMonth(m.month) + ' marked not received.', 'tbz', m.month); });
  if (R.cash.diff !== null && R.cash.diff !== 0) add(2, 'Cash in hand is ' + fmtRs(Math.abs(R.cash.diff)) + (R.cash.diff > 0 ? ' more' : ' less') + ' than it should be.', 'cash');
  if (R.cash.actual === null && !R.closed) add(3, 'Actual bank and cash not entered for ' + R.fy + '.', 'cash');
  if (R.patoki.fixed && R.patoki.due > 0 && !R.closed) add(3, R.patoki.name + ' still due this year: ' + fmtRs(R.patoki.due) + '.', 'patoki');
  var undated = ['income', 'outflows', 'payments'].reduce(function (n, k) { return n + R[k].filter(function (r) { return !r.date; }).length; }, 0);
  if (undated) add(3, undated + ' entr' + (undated === 1 ? 'y has' : 'ies have') + ' no date (brought in from the old sheet).', 'info');
  return c.sort(function (a, b) { return a.tier - b.tier; });
}

// Same amount to the same payee or heir on the same day: asked before saving, never refused.
function lookAlike(D, tab, rec) {
  var who = tab === 'OUTFLOWS' ? 'payee' : tab === 'PAYMENTS' ? 'heir' : tab === 'INCOME' ? 'source' : '';
  if (!who || !rec.date) return null;
  return (D.tables[tab] || []).filter(function (r) {
    return r.id !== rec.id && r.date === rec.date && Number(r.amount) === Number(rec.amount) && String(r[who]).trim().toLowerCase() === String(rec[who]).trim().toLowerCase();
  })[0] || null;
}

// Qurbani split by sevenths among heirs, as set on the HEIRS tab.
function qurbaniSplit(D, total) {
  var H = heirsOf(D), parts = sum_(H, function (h) { return h.qurbani; }) || 7;
  var out = H.filter(function (h) { return h.qurbani > 0; }).map(function (h) { return { name: h.name, sevenths: h.qurbani, amount: Math.round(total * h.qurbani / parts) }; });
  return out;
}

// Rows written to the workbook's SUMMARY tab.
function summaryRows(R) {
  var rows = [['Year', R.fy + (R.closed ? ' (closed)' : '')], ['Gross income to divide', R.gross], ['Less outflows charged to pool', R.charged], ['Net income to divide', R.net]];
  R.heirs.forEach(function (h) {
    rows.push([h.name + ': entitlement', h.entitlement]);
    if (h.opening) rows.push([h.name + ': opening balance', h.opening]);
    rows.push([h.name + ': received', h.received], [h.name + ': pending', h.pending], [h.name + ': carry forward', h.carry]);
  });
  rows.push(['Cash: opening (' + R.cash.openingFrom + ')', R.cash.opening], ['Cash: collected by ' + R.custodian, R.cash.collected], ['Cash: money back to fund', R.cash.fundIn],
    ['Cash: outflows paid by ' + R.custodian, R.cash.outPaid], ['Cash: paid to heirs', R.cash.paidHeirs], ['Cash: should be in hand', R.cash.shouldHave],
    ['Cash: actual (entered)', R.cash.actual === null ? '' : R.cash.actual], ['Fund balance', R.fund.balance],
    [R.patoki.name + ' fixed', R.patoki.fixed], [R.patoki.name + ' received', R.patoki.received], [R.patoki.name + ' still due', R.patoki.due], [R.tbz.name + ' gross', R.tbz.gross], [R.tbz.name + ' expenses', R.tbz.expenses + R.tbz.outflows], [R.tbz.name + ' kept by ' + R.tbz.collector, R.tbz.net],
    ['Items to check', R.checks.length]);
  return rows;
}

if (typeof module !== 'undefined') module.exports = { yearCalc: yearCalc, summaryRows: summaryRows, qurbaniSplit: qurbaniSplit, lookAlike: lookAlike, allYears: allYears, fyMonths: fyMonths };
