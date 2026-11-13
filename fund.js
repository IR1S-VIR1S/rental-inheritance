/* Rental Inheritance: an heir's account kept by another heir (for example money given to one brother for their mother).
   Only the keeper's phone enters it; the custodian views it; other heirs never receive it (the workbook enforces this). */
'use strict';
var FUND_CATS = ['Electricity bill', 'Gas bill', 'Water bill', 'Groceries', 'Medicines', 'Doctor and tests', 'Travel', 'Kaam wali wages',
  'Mobile and internet', 'Clothes', 'House repairs', 'Gifts and Eid', 'Chicken', 'Mutton', 'Fish', 'Milk', 'Other'];
var BILL_CATS = ['Chicken', 'Mutton', 'Fish', 'Milk']; // always listed on the account page, even with no orders
// Bought by the order: each order is entered on its own. A round amount gets one friendly question before saving
// (type the exact amount, or keep it as remembered); nothing is flagged afterwards.
var BILL_RE = /meat|fish|milk|mutton|beef|chicken|gosht|machli|doodh/i;
function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
function isBillCat(c) { return BILL_RE.test(String(c || '')); }
function isRound(a) { a = Number(a) || 0; return a >= 1000 && a % 500 === 0; }
// Orders per bill category for a period: { Meat: { n: 4, amt: 9600 }, ... }
function billSummary(D, from, to) {
  var o = {};
  (D.tables.AF_EXP || []).forEach(function (r) {
    if (!isBillCat(r.category) || (from && r.date < from) || (to && r.date > to)) return;
    var k = r.category, x = o[k] || (o[k] = { n: 0, amt: 0 });
    x.n++; x.amt += Number(r.amount) || 0;
  });
  return o;
}
var AF_LIST = ['AF_EXP', 'AF_IN', 'AF_RECUR', 'AF_HELD'];

function fundCfg(D) { var s = settingsOf(D); return { who: String(s.fund_for || '').trim(), keeper: String(s.fund_keeper || '').trim() }; }
function fundOn(D) { var c = fundCfg(D); return !!(c.who && c.keeper); }
function isKeeperPhone() { return !!(T.S && T.S.data && T.S.data.keeper); }
function canSeeFund() { return !!(T.S && T.S.data && fundOn(T.S.data) && (isCust() || isKeeperPhone())); }
function fundTitle(D) { return fundCfg(D).who + '’s account'; }
function fundCats(D) {
  var used = (D.tables.AF_EXP || []).map(function (r) { return String(r.category); }).concat((D.tables.AF_RECUR || []).map(function (r) { return String(r.category); }));
  var out = FUND_CATS.slice(0, -1);
  used.forEach(function (c) { if (c && out.indexOf(c) < 0 && c !== 'Other') out.push(c); });
  return out.concat(['Other']);
}
function monthsBack(mk, n) { var y = +mk.slice(0, 4), m = +mk.slice(5, 7) - n; while (m < 1) { m += 12; y--; } return y + '-' + pad2_(m); }
function monthEnd(mk) { var y = +mk.slice(0, 4), m = +mk.slice(5, 7); return mk + '-' + pad2_(new Date(Date.UTC(y, m, 0)).getUTCDate()); }

// Money in = payments to the heir marked "given to the keeper"; out = the keeper's expenses. Running balance is over all time.
function fundCalc(D, from, to, today) {
  var c = fundCfg(D), inRange = function (d) { return (!from || (d && d >= from)) && (!to || (d && d <= to)); };
  // Money in: payments marked as given to the keeper, plus other money the keeper received for the heir (pension, rent and so on).
  var ins = (D.tables.PAYMENTS || []).filter(function (r) { return r.heir === c.who && extraOf(r).via; }).map(function (r) { return Object.assign({ kind: 'given' }, r); })
    .concat((D.tables.AF_IN || []).map(function (r) { return Object.assign({ kind: 'other' }, r); }));
  var exps = (D.tables.AF_EXP || []);
  var given = sum_(ins, function (r) { return r.amount; }), spent = sum_(exps, function (r) { return r.amount; }), left = given - spent;
  var held = (D.tables.AF_HELD || []).slice().sort(function (a, b) { return (a.date + a.id) < (b.date + b.id) ? 1 : -1; })[0] || null;
  var insP = ins.filter(function (r) { return inRange(r.date); }), expsP = exps.filter(function (r) { return inRange(r.date); });
  var byCat = {};
  expsP.forEach(function (r) { byCat[r.category] = (byCat[r.category] || 0) + Number(r.amount); });
  var before = from ? sum_(ins.filter(function (r) { return r.date && r.date < from; }), function (r) { return r.amount; }) - sum_(exps.filter(function (r) { return r.date && r.date < from; }), function (r) { return r.amount; }) : 0;
  return { who: c.who, keeper: c.keeper, given: given, spent: spent, left: left, held: held ? Number(held.amount) : null, heldDate: held ? held.date : '',
    diff: held ? Number(held.amount) - left : null, ins: insP, exps: expsP, byCat: byCat, inP: sum_(insP, function (r) { return r.amount; }),
    givenP: sum_(insP.filter(function (r) { return r.kind === 'given'; }), function (r) { return r.amount; }), otherP: sum_(insP.filter(function (r) { return r.kind === 'other'; }), function (r) { return r.amount; }),
    outP: sum_(expsP, function (r) { return r.amount; }), opening: before, closing: before + sum_(insP, function (r) { return r.amount; }) - sum_(expsP, function (r) { return r.amount; }),
    due: recurDue(D, today) };
}
// Repeating charges: this month and last month, each paid, skipped, due (its day has come) or coming.
function recurDue(D, today) {
  var cur = today.slice(0, 7), out = [];
  (D.tables.AF_RECUR || []).filter(function (r) { return String(r.active) !== 'N'; }).forEach(function (r) {
    var start = String(r.entered_at || '').slice(0, 7) || cur, skip = extraOf(r).skip || [];
    [monthsBack(cur, 1), cur].forEach(function (m) {
      if (m < start) return;
      var paid = (D.tables.AF_EXP || []).some(function (x) { return x.recur_id && (x.recur_id === r.id || x.recur_id === 'q:' + r.key) && String(x.date).slice(0, 7) === m; });
      if (paid || skip.indexOf(m) >= 0) return;
      var dd = m + '-' + pad2_(Number(r.day) || 1), status = dd > today ? 'coming' : m < cur ? 'overdue' : 'due';
      if (status === 'coming' && m !== cur) return;
      out.push({ r: r, month: m, date: dd, status: status });
    });
  });
  return out.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
}

// ---------- the tab ----------
function billCard(D, P) {
  var Sm = billSummary(D, P.from, P.to), cats = BILL_CATS.concat(Object.keys(Sm).filter(function (k) { return BILL_CATS.indexOf(k) < 0; }));
  return el('div', { id: 'billcheck' }, el('h2', null, svg('doc'), 'Chicken, mutton, fish and milk', qm('Order by order')),
    el('div', { class: 'card' }, el('div', { class: 'kv', id: 'billsum' }, cats.map(function (k) {
      var x = Sm[k] || { n: 0, amt: 0 };
      return [el('div', { text: k + ', ' + P.label }), el('div', { class: x.n ? '' : 'muted', text: x.n ? plural(x.n, 'order') + ' · ' + groupNum_(x.amt) : 'No orders' })];
    }))));
}
function fundPeriod() {
  var t = todayPk(), cur = t.slice(0, 7), p = T.fundPeriod || 'month';
  if (p === 'month') return { k: p, from: cur + '-01', to: monthEnd(cur), label: fmtMonth(cur) };
  if (p === 'last') { var lm = monthsBack(cur, 1); return { k: p, from: lm + '-01', to: monthEnd(lm), label: fmtMonth(lm) }; }
  if (p === 'year') { var fy = curFy(); return { k: p, from: fyStart(fy) + '-07-01', to: (fyStart(fy) + 1) + '-06-30', label: fy }; }
  return { k: 'all', from: '', to: '', label: 'All time' };
}
SCREENS.fund = function () {
  var D = view(), c = fundCfg(D), keep = isKeeperPhone(), P = fundPeriod(), F = fundCalc(D, P.from, P.to, todayPk());
  var cats = Object.keys(F.byCat).sort(function (a, b) { return F.byCat[b] - F.byCat[a]; });
  return el('div', null, keep ? topBar(c.who) : backBar(fundTitle(D), T.fundFrom || 'home'),
    keep ? null : el('div', { class: 'note', id: 'fundviewnote', text: 'Kept by ' + c.keeper + '. You can view it; only ' + c.keeper + ' makes entries here.' }),
    el('div', { class: 'card hero', id: 'fundhero' },
      el('div', { class: 'lbl' }, 'Should be left with ' + c.keeper, qm('Should be left')),
      el('div', { class: 'big', id: 'fundleft', text: fmtRs(F.left) }),
      el('div', { class: 'sub', text: 'Money in ' + groupNum_(F.given) + ' less spent ' + groupNum_(F.spent) })),
    el('div', { class: 'card list', id: 'fundheld' },
      el('div', { class: 'row' }, el('div', { class: 'grow' }, el('b', null, 'Money held (actual)', qm('Money held (actual)')),
        el('div', { class: 'sm', text: F.held === null ? 'Not entered yet' : fmtRs(F.held) + (F.heldDate ? ' on ' + fmtDate(F.heldDate) : '') })),
        F.diff === null ? null : el('span', { class: 'chip ' + (F.diff === 0 ? 'ok' : 'due') }, F.diff === 0 ? 'Matches' : 'Off by ' + groupNum_(F.diff))),
      keep ? btn('wide', 'edit', 'Enter money held', openHeld, 'heldbtn') : null),
    billCard(D, P),
    F.due.length ? el('div', { id: 'funddue' }, el('h2', null, svg('clock'), 'Repeating charges due', qm(['Repeating charge', 'Due and skip'])),
      el('div', { class: 'card list' }, F.due.map(function (x) {
        return el('div', { class: 'row', 'data-due': x.r.id || x.r.key },
          el('div', { class: 'grow' }, el('b', { text: x.r.name }), el('div', { class: 'sm', text: x.r.category + ' · usual ' + groupNum_(x.r.amount) })),
          el('div', { class: 'right' }, el('span', { class: 'chip ' + (x.status === 'overdue' ? 'bad' : x.status === 'due' ? 'due' : 'wait'), text: (x.status === 'coming' ? 'On ' : x.status === 'overdue' ? 'Overdue ' : 'Due ') + fmtDate(x.date).replace(/ \d{4}$/, '') }),
            keep && x.r.id ? el('div', { class: 'duebtns' },
              btn('small primary', 'check', 'Paid', function () { openFundExp(null, { category: x.r.category, details: x.r.name + ', ' + fmtMonth(x.month), amount: isBillCat(x.r.category) ? '' : String(x.r.amount), recur_id: x.r.id, date: x.date > todayPk() ? todayPk() : x.date }); }),
              btn('small', 'x', 'Skip', function () { skipRecur(x.r, x.month); })) : keep ? el('div', { class: 'sm', text: 'Waiting to send' }) : null));
      }))) : null,
    el('h2', null, svg('cal'), 'Spending'),
    el('div', { class: 'seg', id: 'fundseg' }, [['month', 'This month'], ['last', 'Last month'], ['year', 'This year'], ['all', 'All']].map(function (x) {
      return el('button', { type: 'button', class: P.k === x[0] ? 'on' : '', 'data-p': x[0], onclick: function () { T.fundPeriod = x[0]; render(); } }, x[1]);
    })),
    el('div', { class: 'card' }, el('div', { class: 'kv', id: 'fundcats' },
      cats.map(function (k) { return [el('div', { text: k }), el('div', { text: groupNum_(F.byCat[k]) })]; }),
      el('div', { class: 'tot', text: 'Spent, ' + P.label }), el('div', { class: 'tot', id: 'fundspentp', text: fmtRs(F.outP) }),
      el('div', { text: 'Given to ' + c.keeper + ', ' + P.label }), el('div', { text: groupNum_(F.givenP) }),
      F.otherP ? [el('div', { text: 'Other money in, ' + P.label }), el('div', { text: groupNum_(F.otherP) })] : null)),
    el('div', { class: 'card list', id: 'fundexps' }, F.exps.length ? F.exps.slice().sort(function (a, b) { return (a.date || '') < (b.date || '') ? 1 : -1; }).map(function (r) {
      return el('button', { class: 'row', type: 'button', onclick: function () { openEntry('AF_EXP', r); } },
        el('span', { class: 'rowic' }, svg('out')),
        el('div', { class: 'grow' }, el('div', { text: r.category + (r.details ? ': ' + r.details : '') }),
          el('div', { class: 'sm', text: [fmtDate(r.date), r.paid_to ? 'paid to ' + r.paid_to : '', r.mode].filter(Boolean).join(' · ') }),
          r.pending ? el('div', { class: 'pending' + (r.error ? ' bad' : ''), text: r.error ? 'Not accepted: ' + r.error : 'Waiting to send' }) : null),
        el('div', { class: 'amt', text: groupNum_(r.amount) }));
    }) : el('p', { class: 'muted', text: 'No spending in ' + P.label + '.' })),
    el('h2', null, svg('income'), 'Money in', qm(['Given to ' + c.keeper + ' for ' + c.who, 'Other money in'])),
    el('div', { class: 'card list', id: 'fundins' }, F.ins.length ? F.ins.slice().sort(function (a, b) { return (a.date || '') < (b.date || '') ? 1 : -1; }).map(function (r) {
      var other = r.kind === 'other';
      return el(other && keep ? 'button' : 'div', { class: 'row', type: other && keep ? 'button' : null, onclick: other ? function () { openEntry('AF_IN', r); } : null },
        el('span', { class: 'rowic' }, svg('income')),
        el('div', { class: 'grow' }, el('div', { text: other ? r.source + (r.details ? ': ' + r.details : '') : (r.batch || 'Payment') + ' from ' + (settingsOf(D).custodian || 'the custodian') }),
          el('div', { class: 'sm', text: [fmtDate(r.date), other ? r.mode : extraOf(r).mode].filter(Boolean).join(' · ') }),
          r.pending ? el('div', { class: 'pending' + (r.error ? ' bad' : ''), text: r.error ? 'Not accepted: ' + r.error : 'Waiting to send' }) : null),
        el('div', { class: 'right' }, el('div', { class: 'amt', text: groupNum_(r.amount) }), el('span', { class: 'chip wait', text: other ? 'Other' : 'Given' })));
    }) : el('p', { class: 'muted', text: 'No money in during ' + P.label + '.' + (isCust() ? ' Mark a payment to ' + c.who + ' as "Given to ' + c.keeper + '".' : '') })),
    keep ? btn('wide', 'plus', 'Add other money in', function () { openFundIn(null); }, 'addfundin') : null,
    el('h2', null, svg('sync'), 'Repeating charges', qm('Repeating charge')),
    el('div', { class: 'card list', id: 'recurlist' }, (D.tables.AF_RECUR || []).length ? D.tables.AF_RECUR.map(function (r) {
      return el(keep ? 'button' : 'div', { class: 'row', type: keep ? 'button' : null, onclick: keep ? function () { openRecur(r); } : null },
        el('div', { class: 'grow' }, el('b', { text: r.name }), el('div', { class: 'sm', text: r.category + ' · day ' + r.day + (String(r.active) === 'N' ? ' · stopped' : '') })),
        el('div', { class: 'amt', text: groupNum_(r.amount) }));
    }) : el('p', { class: 'muted', text: 'None set up.' })),
    keep ? btn('wide', 'plus', 'Add a repeating charge', function () { openRecur(null); }, 'addrecur') : null,
    el('h2', null, svg('doc'), 'Statement', qm('Account statement')),
    btn('primary wide', 'doc', 'Statement for ' + P.label + ' (PDF)', function () {
      shareFile(new Blob([pdfFundStatement(D, P)], { type: 'application/pdf' }), (fundCfg(D).who + '_account_' + P.label).replace(/[^A-Za-z0-9-]+/g, '_') + '.pdf');
      noteAct('statement_pdf', P.label);
    }, 'fundpdf'));
};
function openHeld() {
  var F = fundCalc(view(), '', '', todayPk());
  editSheet('Money held for ' + F.who, [{ k: 'v', label: 'Held now in cash and bank (Rs)', num: true, value: F.held === null ? '' : String(F.held), hint: 'Should be left: ' + fmtRs(F.left) + '.' }, { k: 'note', label: 'Note (optional)' }], function (v) {
    var n = v.v.replace(/[^\d]/g, '');
    if (n === '') return 'Type the amount (0 if nothing is held).';
    return upsert('AF_HELD', { date: todayPk(), amount: n, note: v.note }, null);
  });
}
function openRecur(r) {
  var D = view();
  editSheet(r ? 'Repeating charge' : 'New repeating charge', [
    { k: 'name', label: 'Name', value: r ? r.name : '', hint: 'For example: kaam wali wages, electricity bill' },
    { k: 'category', label: 'What for', value: r ? r.category : '', hint: 'One of: ' + fundCats(D).join(', ') },
    { k: 'amount', label: 'Usual amount (Rs)', num: true, value: r ? String(r.amount) : '' },
    { k: 'day', label: 'Day of the month it is due (1 to 28)', num: true, value: r ? String(r.day) : '1' },
    { k: 'active', label: 'In use', type: 'switch', value: r ? String(r.active) !== 'N' : true }
  ], function (v) {
    if (!v.name || !v.category) return 'Give a name and what it is for.';
    var rec = { name: v.name, category: v.category, amount: v.amount.replace(/[^\d]/g, ''), day: v.day.replace(/[^\d]/g, ''), active: v.active ? 'Y' : 'N', note: r ? r.note || '' : '' };
    if (r && r.extra) rec.extra = r.extra;
    return upsert('AF_RECUR', rec, r);
  });
}
function skipRecur(r, month) {
  if (!confirm('Skip ' + r.name + ' for ' + fmtMonth(month) + '?')) return;
  var ex = extraOf(r); ex.skip = (ex.skip || []).filter(function (m) { return m >= monthsBack(month, 12); }).concat([month]);
  var e = upsert('AF_RECUR', { name: r.name, category: r.category, amount: String(r.amount), day: String(r.day), active: r.active || 'Y', note: r.note || '', extra: JSON.stringify(ex) }, r);
  if (e) { toast(e); return; }
  saveState().then(function () { render(); toast('Skipped for ' + fmtMonth(month) + '.', true); sync(true); });
}

// ---------- other money in (pension, rent and so on, received by the keeper for the heir) ----------
function openFundIn(r) {
  var D = view(), c = fundCfg(D);
  editSheet(r ? 'Other money in' : 'Other money in for ' + c.who, [
    { k: 'source', label: 'From where', value: r ? r.source : '', hint: 'For example: pension, rent, profit on savings, gift' },
    { k: 'details', label: 'Details (optional)', value: r ? r.details || '' : '' },
    { k: 'amount', label: 'Amount (Rs)', num: true, value: r ? String(r.amount) : '' },
    { k: 'date', label: 'Date (yyyy-mm-dd)', value: r ? r.date : todayPk() },
    { k: 'mode', label: 'Cash or bank (optional)', value: r ? r.mode || '' : '' }
  ], function (v) {
    if (!v.source) return 'Say where the money came from.';
    return upsert('AF_IN', { date: v.date, source: v.source, details: v.details, amount: v.amount.replace(/[^\d]/g, ''), mode: v.mode, note: r ? r.note || '' : '' }, r);
  });
}

// ---------- expense form ----------
function openFundExp(r, preset) {
  var p = r ? { category: r.category, details: r.details, paid_to: r.paid_to || '', amount: String(r.amount), date: r.date, mode: r.mode || '', note: r.note || '', recur_id: r.recur_id || '' }
    : Object.assign({ category: '', details: '', paid_to: '', amount: '', date: todayPk(), mode: '', note: '', recur_id: '' }, preset || {});
  T.form = { tab: 'AF_EXP', orig: r || null, fe: p, photos: [] };
  T.sheet = null; go('fundexp');
}
SCREENS.fundexp = function () {
  var D = view(), F = T.form, P = F.fe, err = el('div', { class: 'err', id: 'feerr' }), c = fundCfg(D);
  var catInput = el('input', { id: 'fe-cat', autocomplete: 'off', value: P.category, placeholder: 'Or type what it was for', oninput: function (e) { P.category = e.target.value; } });
  var modeInput = el('input', { id: 'fe-mode', autocomplete: 'off', value: P.mode, placeholder: 'Or type another bank or account', oninput: function (e) { P.mode = e.target.value; } });
  var hint = el('div', { class: 'hint', id: 'fe-amount-hint', text: Number(P.amount) ? fmtRs(Number(P.amount)) : '' });
  var ask = el('div', { class: 'note hidden', id: 'fe-round' });
  function save(asIs) {
    var rec = { date: P.date, category: String(P.category || '').trim(), details: String(P.details || '').trim(), paid_to: String(P.paid_to || '').trim(),
      amount: String(P.amount || ''), mode: String(P.mode || '').trim(), recur_id: P.recur_id || '', note: String(P.note || '').trim() };
    if (F.orig && F.orig.id) rec.id = F.orig.id;
    if (!rec.category) { err.textContent = 'Choose what it was for.'; return; }
    if (!rec.details) { err.textContent = 'Write the details, for example which bill or what was bought.'; return; }
    var e = validateRecord_('AF_EXP', rec, ctxOf(D, F.orig));
    var fy = isYmd_(rec.date) ? fyOfMonth_(rec.date.slice(0, 7)) : '';
    if (!e && fy && closedYears(D).indexOf(fy) >= 0) e = fy + ' is closed.';
    if (e) { err.textContent = e; return; }
    if (!asIs && isBillCat(rec.category) && isRound(rec.amount)) {
      err.textContent = '';
      ask.replaceChildren(el('div', { text: fmtRs(Number(rec.amount)) + ' is a round figure. If you have the bill, type the exact amount.' }),
        el('div', { class: 'actions2' },
          btn('primary', 'edit', 'Type exact amount', function () { ask.classList.add('hidden'); var a = document.getElementById('fe-amount'); a.focus(); a.select(); }, 'fe-exact'),
          btn('', 'check', 'From memory, save', function () { save(true); }, 'fe-asis')));
      ask.classList.remove('hidden'); ask.scrollIntoView({ block: 'center' });
      return;
    }
    var S2 = T.S, req;
    if (F.orig && !F.orig.id) { var q = S2.outbox.filter(function (o) { return o.req_id === F.orig.key; })[0]; if (q) { q.rec = rec; q.error = ''; req = q.req_id; } }
    else { req = uuid(); if (rec.id) S2.outbox = S2.outbox.filter(function (o) { return !(o.op === 'save' && o.rec.id === rec.id && o.error); }); S2.outbox.push({ op: 'save', tab: 'AF_EXP', req_id: req, rec: rec }); }
    var photos = F.photos; T.form = null;
    addPhotos('AF_EXP', rec.id || req, photos).then(function () { return saveState(); })
      .then(function () { go('fund'); toast('Saved: ' + fmtRs(Number(rec.amount)) + ' for ' + rec.category + '.', true); sync(true); });
  }
  return el('div', null, backBar(F.orig ? 'Edit expense' : 'Expense for ' + c.who, 'fund'),
    el('p', { class: 'muted' }, 'Paid by ' + c.keeper + ' out of the money given to him for ' + c.who + '.', qm(fundTitle(D))),
    el('label', { class: 'f', text: 'What was it for?' }),
    chips(fundCats(D), P.category, function (x) { var was = isBillCat(P.category); P.category = x; catInput.value = x; if (was !== isBillCat(x)) render(); }, 'fe-cat-chips'), catInput,
    isBillCat(P.category) ? el('div', { class: 'note', id: 'fe-billnote' }, 'One order at a time, with the amount on the bill if you have it.', qm('Order by order')) : null,
    el('label', { class: 'f', for: 'fe-details', text: isBillCat(P.category) ? 'What was ordered' : 'Details' }),
    el('textarea', { id: 'fe-details', maxlength: '300', placeholder: isBillCat(P.category) ? 'For example: 2 kg mutton from the butcher; 30 litres milk, 1 to 15 Nov' : 'For example: LESCO bill for November; medicines from Fazal Din', oninput: function (e) { P.details = e.target.value; } }, P.details),
    el('label', { class: 'f', for: 'fe-amount', text: isBillCat(P.category) ? 'Amount on the bill (Rs)' : 'Amount (Rs)' }),
    el('input', { id: 'fe-amount', inputmode: 'numeric', autocomplete: 'off', value: P.amount, placeholder: 'Rupees', oninput: function (e) {
      var v = e.target.value.replace(/[^\d]/g, ''); e.target.value = v; P.amount = v; hint.textContent = Number(v) ? fmtRs(Number(v)) : ''; } }), hint,
    el('label', { class: 'f', for: 'fe-date', text: 'Date' }),
    el('input', { id: 'fe-date', type: 'date', value: P.date, max: todayPk(), oninput: function (e) { P.date = e.target.value; } }),
    el('label', { class: 'f', for: 'fe-paidto', text: 'Paid to (optional)' }),
    el('input', { id: 'fe-paidto', autocomplete: 'off', value: P.paid_to, placeholder: 'Shop, company or person', oninput: function (e) { P.paid_to = e.target.value; } }),
    el('label', { class: 'f' }, 'Paid by (cash or bank)', qm('Paid by (cash or bank)')),
    chips(modeList(D), P.mode, function (x) { P.mode = x; modeInput.value = x; }, 'fe-mode-chips'), modeInput,
    el('label', { class: 'f', for: 'fe-note', text: 'Note (optional)' }),
    el('textarea', { id: 'fe-note', maxlength: '500', oninput: function (e) { P.note = e.target.value; } }, P.note),
    F.orig ? null : pickPhotosField(F),
    ask, btn('primary wide', 'check', 'Save', function () { save(false); }, 'fesave'), err);
};

// ---------- statement PDF ----------
function pdfFundStatement(D, P) {
  var F = fundCalc(D, P.from, P.to, todayPk()), N = groupNum_;
  return pdfDoc(F.who + '’s account', 'Statement for ' + P.label + ', kept by ' + F.keeper, function (d) {
    d.section('Summary');
    if (P.from) d.kv('Balance at the start', N(F.opening));
    d.kv('Given to ' + F.keeper, N(F.givenP)); if (F.otherP) d.kv('Other money in', N(F.otherP)); d.kv('Spent', N(-F.outP));
    d.kv(P.from ? 'Balance at the end' : 'Should be left', 'Rs ' + N(P.from ? F.closing : F.left), true);
    if (F.held !== null) { d.kv('Money held (entered ' + fmtDate(F.heldDate) + ')', N(F.held)); d.kv('Difference', N(F.diff), true); }
    var cats = Object.keys(F.byCat).sort(function (a, b) { return F.byCat[b] - F.byCat[a]; });
    if (cats.length) { d.section('Spent by what for'); cats.forEach(function (k) { d.kv(k, N(F.byCat[k])); }); d.kv('Total', N(F.outP), true); }
    d.section('Expenses');
    if (!F.exps.length) d.line('None in this period.');
    F.exps.slice().sort(function (a, b) { return (a.date || '') < (b.date || '') ? -1 : 1; }).forEach(function (r) {
      d.kv(fmtDate(r.date) + '  ' + r.category + (r.details ? ': ' + r.details : '') + (r.paid_to ? ' (' + r.paid_to + ')' : ''), N(r.amount));
    });
    d.section('Money in');
    if (!F.ins.length) d.line('None in this period.');
    F.ins.slice().sort(function (a, b) { return (a.date || '') < (b.date || '') ? -1 : 1; }).forEach(function (r) {
      var m = r.kind === 'other' ? r.mode : extraOf(r).mode;
      d.kv(fmtDate(r.date) + '  ' + (r.kind === 'other' ? r.source + (r.details ? ': ' + r.details : '') : (r.batch || 'Payment') + ', given to ' + F.keeper) + (m ? ' (' + m + ')' : ''), N(r.amount));
    });
  });
}
