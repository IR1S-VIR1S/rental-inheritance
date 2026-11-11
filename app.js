/* Rental Inheritance: offline iPhone app. Checks come from logic.js (generated from the workbook script); sums from calc.js. */
'use strict';
var BUILD_ID = '7788855d';
var STORE = 'ri.v1';
var BIO = 'ri.bio';
var IDLE_MS = 5 * 60 * 1000;
var KINDS = ['INCOME', 'OUTFLOWS', 'PAYMENTS', 'TBZ', 'FUND_IN'];

var T = { screen: 'boot', key: null, S: null, syncing: false, form: null, sheet: null, kind: 'ALL', q: '', idleAt: Date.now(), thumbs: {}, fold: {}, slide: false };

// ---------- helpers ----------
function el(tag, attrs) {
  var e = document.createElement(tag), kids = Array.prototype.slice.call(arguments, 2);
  if (attrs) Object.keys(attrs).forEach(function (k) {
    var v = attrs[k];
    if (v === null || v === undefined || v === false) return;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'value') e.value = v;
    else if (k === 'checked') e.checked = !!v;
    else e.setAttribute(k, v === true ? '' : v);
  });
  kids.forEach(function add(k) {
    if (k === null || k === undefined || k === false) return;
    if (Array.isArray(k)) return k.forEach(add);
    e.appendChild(typeof k === 'string' || typeof k === 'number' ? document.createTextNode(String(k)) : k);
  });
  return e;
}
var ICONS = {
  home: 'M3 11l9-8 9 8|M5 10v10h14V10',
  ledger: 'M4 4h16v16H4z|M8 8h8|M8 12h8|M8 16h5',
  summary: 'M4 20V10|M10 20V4|M16 20v-7|M22 20H2',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z|M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  plus: 'M12 5v14|M5 12h14',
  sync: 'M21 12a9 9 0 1 1-3-6.7L21 8|M21 3v5h-5',
  income: 'M12 19V5|M5 12l7-7 7 7',
  out: 'M12 5v14|M19 12l-7 7-7-7',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2|M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z|M23 21v-2a4 4 0 0 0-3-3.9|M16 3.1a4 4 0 0 1 0 7.8',
  building: 'M4 21V5l8-3v19|M12 8l8 3v10|M8 9v.01|M8 13v.01|M8 17v.01|M16 14v.01|M16 18v.01|M2 21h20',
  fund: 'M12 2v20|M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  cash: 'M2 6h20v12H2z|M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z|M6 12h.01|M18 12h.01',
  alert: 'M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z|M12 9v4|M12 17h.01',
  check: 'M20 6L9 17l-5-5',
  x: 'M18 6L6 18|M6 6l12 12',
  back: 'M15 18l-6-6 6-6',
  next: 'M9 18l6-6-6-6',
  down: 'M6 9l6 6 6-6',
  trash: 'M3 6h18|M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6|M10 11v6|M14 11v6|M9 6V4h6v2',
  edit: 'M12 20h9|M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  camera: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z|M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  doc: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z|M14 2v6h6|M8 13h8|M8 17h8',
  sheet: 'M3 3h18v18H3z|M3 9h18|M3 15h18|M9 3v18',
  lock: 'M5 11h14v10H5z|M8 11V7a4 4 0 0 1 8 0v4',
  unlockic: 'M5 11h14v10H5z|M8 11V7a4 4 0 0 1 7.5-2',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z|M12 6v6l4 2',
  cal: 'M3 4h18v18H3z|M16 2v4|M8 2v4|M3 10h18',
  faceid: 'M7 3H5a2 2 0 0 0-2 2v2|M17 3h2a2 2 0 0 1 2 2v2|M7 21H5a2 2 0 0 1-2-2v-2|M17 21h2a2 2 0 0 0 2-2v-2|M9 9v1|M15 9v1|M12 9v4h-1|M9 16c1.7 1.3 4.3 1.3 6 0',
  update: 'M12 3v12|M7 10l5 5 5-5|M5 21h14',
  copy: 'M9 9h11v11H9z|M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1',
  share: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8|M16 6l-4-4-4 4|M12 2v13',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z|M21 21l-4.3-4.3',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z|M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  list: 'M8 6h13|M8 12h13|M8 18h13|M3 6h.01|M3 12h.01|M3 18h.01',
  wait: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z|M12 8v4|M12 16h.01'
};
var KIND_ICON = { INCOME: 'income', OUTFLOWS: 'out', PAYMENTS: 'users', TBZ: 'building', FUND_IN: 'fund', OPENING: 'list' };
var KIND_LABEL = { ALL: 'All', INCOME: 'Income', OUTFLOWS: 'Outflows', PAYMENTS: 'Payments', TBZ: 'TBZ', FUND_IN: 'Back to fund' };
function svg(name) {
  var ns = 'http://www.w3.org/2000/svg', s = document.createElementNS(ns, 'svg');
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true');
  (ICONS[name] || '').split('|').forEach(function (d) { var p = document.createElementNS(ns, 'path'); p.setAttribute('d', d); s.appendChild(p); });
  return s;
}
function btn(cls, icon, label, onclick, id) {
  return el('button', { class: 'btn ' + (cls || ''), id: id, type: 'button', onclick: onclick }, icon ? svg(icon) : null, el('span', { text: label }));
}
function toast(t, tick) {
  var old = document.querySelector('.toast'); if (old) old.remove();
  var d = el('div', { class: 'toast', role: 'status' }, tick ? svg('check') : null, t);
  if (tick) d.firstChild.setAttribute('class', 'ic');
  document.body.appendChild(d);
  setTimeout(function () { d.remove(); }, 2800);
}
function todayPk() {
  var f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi', year: 'numeric', month: '2-digit', day: '2-digit' });
  var p = {}; f.formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
  return p.year + '-' + p.month + '-' + p.day;
}
function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  var a = crypto.getRandomValues(new Uint8Array(16));
  return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
}
function isCust() { return T.S && T.S.role === 'custodian'; }
function rowKey(r) { return r.id || 'q:' + r.key; }
function amtCls(n) { return Number(n) < 0 ? 'amt neg' : 'amt'; }

// ---------- encrypted storage ----------
function b64(buf) { var s = '', a = new Uint8Array(buf); for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s); }
function unb64(s) { var b = atob(s), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
function deriveKey(pin, salt) {
  return crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveKey']).then(function (base) {
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt, iterations: 150000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  });
}
function stored() { try { return JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) { return null; } }
function saveState() {
  if (!T.key || !T.S) return Promise.resolve();
  var iv = crypto.getRandomValues(new Uint8Array(12)), st = stored();
  return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, T.key, new TextEncoder().encode(JSON.stringify(T.S))).then(function (ct) {
    localStorage.setItem(STORE, JSON.stringify({ v: 1, salt: st.salt, n: st.n || 0, iv: b64(iv), ct: b64(ct) }));
  });
}
function unlock(pin) {
  var st = stored();
  return deriveKey(pin, unb64(st.salt)).then(function (key) {
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(st.iv) }, key, unb64(st.ct)).then(function (pt) {
      T.key = key; T.S = JSON.parse(new TextDecoder().decode(pt));
      T.S.uploads = T.S.uploads || []; T.S.outbox = T.S.outbox || [];
    });
  });
}
function lock() {
  T.bioTried = false;
  T.key = null; T.S = null; T.form = null; T.sheet = null; T.thumbs = {};
  T.screen = stored() ? 'unlock' : 'join'; render();
}
function resetPhone() {
  localStorage.removeItem(STORE); localStorage.removeItem(BIO);
  return photoWipe().then(lock);
}

// ---------- server ----------
function api(body) {
  var ctl = new AbortController(), timer = setTimeout(function () { ctl.abort(); }, 45000);
  return fetch(T.S ? T.S.api : T.joinApi, { method: 'POST', body: JSON.stringify(body), redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, signal: ctl.signal })
    .then(function (r) { return r.json(); })
    .finally(function () { clearTimeout(timer); });
}
function sync(quiet) {
  if (T.syncing) { T.syncAgain = true; return T.syncP || Promise.resolve(); }
  if (!T.S || !T.S.token) return Promise.resolve();
  if (!navigator.onLine) { if (!quiet) toast('No signal. Saved on this phone.'); softRender(); return Promise.resolve(); }
  T.syncing = true; renderTop();
  var S = T.S, items = S.outbox.filter(function (x) { return !x.error; }), done = {};
  var p = items.length && isCust() ? api({ op: 'push', token: S.token, items: items }) : Promise.resolve({ ok: true, results: [] });
  var chain = p.then(function (r) {
    if (!r.ok) throw r;
    (r.results || []).forEach(function (res) {
      var o = S.outbox.filter(function (x) { return x.req_id === res.req_id; })[0];
      if (!o) return;
      if (res.ok) { done[res.req_id] = 1; if (res.id) S.uploads.forEach(function (u) { if (u.ref === o.req_id) u.ref = res.id; }); }
      else { o.error = res.error || 'Refused.'; o.gone = !!res.gone; }
    });
    return isCust() ? sendPhotos(S) : null;
  }).then(function () {
    return api({ op: 'pull', token: S.token });
  }).then(function (r) {
    if (!r.ok) throw r;
    if (T.S !== S) return;
    S.data = r.data; S.role = r.data.role; S.name = r.data.name; S.lastSync = Date.now(); S.syncErr = '';
    S.outbox = S.outbox.filter(function (x) { return !done[x.req_id]; });
    if (!S.modesSeeded) { seedModes(S); if (S.outbox.length) T.syncAgain = true; }
    return saveState().then(function () { return snapshot(S); });
  }).catch(function (e) {
    if (T.S !== S) return;
    S.outbox = S.outbox.filter(function (x) { return !done[x.req_id]; });
    S.syncErr = (e && e.error) || 'Could not reach the workbook. Will try again.';
    if (e && e.code === 401) S.syncErr = 'This phone no longer has access. Ask for a new invitation.';
    if (e && e.error === 'unknown operation') S.syncErr = 'The workbook script is older than this app. Use "Install update" in the workbook.';
    return saveState();
  }).finally(function () {
    T.syncing = false; T.syncP = null;
    if (T.S === S) softRender(); else renderTop();
    if (T.syncAgain && T.S === S) { T.syncAgain = false; return sync(true); }
    T.syncAgain = false;
  });
  T.syncP = chain;
  return chain;
}
// The custodian's phone writes its worked-out summary into the workbook's SUMMARY tab when it changes.
function snapshot(S) {
  if (S.role !== 'custodian' || !S.data) return null;
  var fy = fyOfMonth_(todayPk().slice(0, 7)), rows = summaryRows(yearCalc(S.data, fy, todayPk()));
  var sig = JSON.stringify(rows);
  if (sig === S.snapSig) return null;
  return api({ op: 'snapshot', token: S.token, rows: rows }).then(function (r) { if (r.ok) { S.snapSig = sig; return saveState(); } }).catch(function () { });
}
function sendPhotos(S) {
  return S.uploads.slice().reduce(function (chain, u) {
    return chain.then(function () {
      if (T.S !== S || u.error) return;
      return photoGet(u.id, T.key).then(function (buf) {
        if (!buf) { S.uploads = S.uploads.filter(function (x) { return x.id !== u.id; }); return; }
        return api({ op: 'upload', token: S.token, req_id: u.id, tab: u.tab, ref: u.ref, mime: 'image/jpeg', b64: bufToB64(buf) }).then(function (r) {
          if (r.ok) { S.uploads = S.uploads.filter(function (x) { return x.id !== u.id; }); T.thumbs['F:' + r.file_id] = T.thumbs['U:' + u.id]; return photoDel(u.id); }
          if (!r.retry) u.error = r.error;
        });
      });
    });
  }, Promise.resolve()).then(function () { return saveState(); });
}
function queue(item) { T.S.outbox.push(item); return saveState(); }

// ---------- data view: server copy plus unsent changes ----------
function view() {
  var S = T.S, D = JSON.parse(JSON.stringify(S.data || { tables: {}, files: [] }));
  Object.keys(SCHEMA).forEach(function (t) { D.tables[t] = D.tables[t] || []; });
  D.files = D.files || [];
  S.outbox.forEach(function (o) {
    var rows = D.tables[o.tab];
    if (!rows) return;
    var mark = { pending: true, error: o.error || '', req: o.req_id };
    if (o.op === 'del') { D.tables[o.tab] = rows.filter(function (r) { return r.id !== o.id; }); return; }
    if (o.rec.id) {
      var cur = rows.filter(function (r) { return r.id === o.rec.id; })[0];
      if (cur) { Object.assign(cur, o.rec, mark); if (SCHEMA[o.tab].fyFrom) cur.fy = fyOf_(o.tab, cur); }
      return;
    }
    var n = Object.assign({}, o.rec, { id: '', key: o.req_id }, mark);
    if (SCHEMA[o.tab].fyFrom) n.fy = fyOf_(o.tab, n);
    rows.push(n);
  });
  S.uploads.forEach(function (u) { D.files.push({ file_id: '', upload: u.id, tab: u.tab, ref_id: u.ref, pending: true, error: u.error }); });
  return D;
}
function ctxOf(D, old) {
  var lists = {};
  LIST_NAMES.forEach(function (n) { lists[n] = listOf(D, n); });
  return { today: todayPk(), lists: lists, heirs: heirsOf(D).map(function (h) { return h.name; }), old: old || null };
}
function curFy() { return T.S.fy || fyOfMonth_(todayPk().slice(0, 7)); }
function calcNow() { var D = view(); return { D: D, R: yearCalc(D, curFy(), todayPk()) }; }

// ---------- rendering ----------
var BAR = [['home', 'home', 'Home'], ['ledger', 'ledger', 'Ledger'], ['summary', 'summary', 'Summary'], ['settings', 'gear', 'Settings']];
function render() {
  var app = document.getElementById('app');
  var bar = T.S && T.S.data && BAR.some(function (b) { return b[0] === T.screen; });
  app.className = bar ? '' : 'nobar';
  var fn = SCREENS[T.screen] || SCREENS.boot, main = el('main', { class: T.slide ? 'slide' : '' }, fn());
  T.slide = false;
  app.replaceChildren(main);
  document.querySelectorAll('.bar,.fab,.sheet-bg').forEach(function (x) { x.remove(); });
  if (bar) document.body.appendChild(barEl());
  var fab = bar && isCust() && FAB[T.screen] && FAB[T.screen]();
  if (fab) document.body.appendChild(el('button', { class: 'fab', id: 'fab', type: 'button', onclick: fab[2] }, svg(fab[0]), fab[1]));
  if (T.sheet) document.body.appendChild(T.sheet());
}
var FAB = {
  home: function () { return ['plus', 'Add', openAddChooser]; },
  ledger: function () { return ['plus', 'Add', openAddChooser]; }
};
function softRender() {
  var ae = document.activeElement, typing = ae && ae.matches && ae.matches('#app input, #app textarea');
  if (['unlock', 'join', 'setpin'].indexOf(T.screen) >= 0) return;
  if (T.screen === 'form' || T.screen === 'qurbani' || T.sheet || typing) { renderTop(); return; }
  var y = window.scrollY; render(); window.scrollTo(0, y);
}
function renderTop() { var s = document.getElementById('syncpill'); if (s && T.S) s.replaceWith(syncPill()); }
function go(screen) { if (['home', 'ledger', 'summary'].indexOf(screen) >= 0) T.setGroup = null; T.screen = screen; T.sheet = null; T.slide = true; render(); window.scrollTo(0, 0); }
function barEl() {
  return el('nav', { class: 'bar' }, BAR.map(function (b) {
    var n = b[0] === 'settings' && T.S.outbox.some(function (o) { return o.error; }) ? el('span', { class: 'dot' }) : null;
    return el('button', { class: T.screen === b[0] ? 'on' : '', type: 'button', id: 'bar-' + b[0], 'aria-label': b[2], onclick: function () { if (b[0] === 'settings') T.setGroup = null; go(b[0]); } }, svg(b[1]), b[2], n);
  }));
}
function syncPill() {
  var S = T.S, n = S.outbox.filter(function (o) { return !o.error; }).length + S.uploads.length, t;
  if (T.syncing) t = 'Syncing';
  else if (!navigator.onLine) t = n ? 'Offline, ' + n + ' waiting' : 'Offline';
  else if (S.syncErr) t = 'Not synced';
  else if (n) t = n + ' waiting';
  else t = S.lastSync ? new Date(S.lastSync).toTimeString().slice(0, 5) : 'Not synced';
  return el('button', { class: 'pill', id: 'syncpill', type: 'button', 'aria-label': 'Sync now', title: 'Last synced', onclick: function () { sync(); } }, svg('sync'), t);
}
function yearPill() {
  return el('button', { class: 'pill year', id: 'yearpill', type: 'button', onclick: openYearPicker }, curFy(), svg('down'));
}
function topBar(title) {
  return el('div', { class: 'top' }, el('div', { class: 'brand' }, el('img', { src: 'logo-160.png', alt: '', class: 'logo' }), el('div', { class: 'title', text: title })),
    el('div', { class: 'pills' }, yearPill(), syncPill()));
}
function backBar(title, to) {
  return el('div', { class: 'top' },
    el('button', { class: 'back', type: 'button', id: 'back', onclick: function () { T.form = null; go(to || 'home'); } }, svg('back'), 'Back'),
    el('div', { class: 'title small', text: title }), el('span'));
}
function chips(list, cur, onPick, id, labelFn) {
  return el('div', { class: 'chips', id: id }, list.map(function (x) {
    return el('button', { class: cur === x ? 'on' : '', type: 'button', 'data-v': x, onclick: function (e) {
      onPick(x); e.currentTarget.parentNode.querySelectorAll('button').forEach(function (b) { b.className = b.getAttribute('data-v') === x ? 'on' : ''; });
    } }, labelFn ? labelFn(x) : x);
  }));
}
function sheetOpen(build) { T.sheet = build; render(); }
function sheetClose() { T.sheet = null; render(); }
function sheetWrap(label, kids) {
  return el('div', { class: 'sheet-bg', onclick: function (e) { if (e.target === e.currentTarget) sheetClose(); } },
    el('div', { class: 'sheet', role: 'dialog', 'aria-label': label }, kids));
}
function closedNote(fy) { return el('div', { class: 'closed', id: 'closednote' }, svg('lock'), fy + ' is closed. Entries can be viewed but not changed.'); }
function openYearPicker() {
  var D = view(), years = allYears(D, todayPk()), nx = fyNext(years[years.length - 1]);
  sheetOpen(function () {
    return sheetWrap('Choose year', [el('h2', { text: 'Financial year' }), el('p', { class: 'muted', text: '1 July to 30 June.' }),
      el('div', { class: 'card list' }, years.concat(isCust() ? [nx] : []).reverse().map(function (y) {
        var closed = closedYears(D).indexOf(y) >= 0;
        return el('button', { class: 'row', type: 'button', 'data-fy': y, onclick: function () { T.S.fy = y; saveState(); T.sheet = null; render(); } },
          el('div', null, el('b', { text: y }), el('div', { class: 'sm', text: fyLabel(y) })),
          y === curFy() ? el('span', { class: 'chip ok' }, svg('check'), 'Showing') : closed ? el('span', { class: 'chip wait' }, svg('lock'), 'Closed') : null);
      })),
      btn('wide', 'x', 'Close', sheetClose)]);
  });
}

var SCREENS = {};
SCREENS.boot = function () { return el('p', { class: 'muted', text: 'Loading' }); };

// ---------- joining ----------
function isIos() { return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
function isStandalone() { return !!navigator.standalone || (window.matchMedia && matchMedia('(display-mode: standalone)').matches); }
function parseInvite(v) {
  var m = /RI1\.([A-Za-z0-9_-]+)\.([A-Za-z0-9]+)/.exec(String(v || ''));
  if (!m) return null;
  var url = '';
  try { url = atob(m[1].replace(/-/g, '+').replace(/_/g, '/')); } catch (e) { }
  return /^https?:\/\//.test(url) ? { api: url, code: m[2], line: m[0] } : null;
}
SCREENS.join = function () {
  var hashInv = parseInvite(decodeURIComponent(location.hash || '')), ta, err = el('div', { class: 'err', id: 'joinerr' });
  function connect(inv) {
    inv = inv || parseInvite(ta.value);
    if (!inv) { err.textContent = 'That does not look like an invitation. Copy the whole line that starts with RI1.'; return; }
    if (/\/dev$/.test(inv.api)) { err.textContent = 'This invitation points to the test address (ending /dev). In the workbook use "Change web app address", then make a new invitation.'; return; }
    T.joinApi = inv.api; err.textContent = 'Connecting';
    api({ op: 'join', code: inv.code }).then(function (r) {
      if (!r.ok) { err.textContent = r.error || 'Could not join.'; return; }
      try { history.replaceState(null, '', location.pathname); } catch (e) { }
      T.pending = { api: inv.api, token: r.token, role: r.role, name: r.name }; go('setpin');
    }).catch(function () {
      err.textContent = navigator.onLine ? 'The workbook did not answer. In Apps Script check Deploy > Manage deployments: Web app, Execute as Me, Who has access Anyone.' : 'No internet on this phone. Connect and try again.';
    });
  }
  var head = [el('img', { src: 'logo-160.png', alt: 'ALAM', class: 'biglogo' }), el('h1', { text: 'Rental Inheritance' })];
  if (hashInv && isIos() && !isStandalone() && !T.joinHere) {
    return el('div', null, head,
      el('p', { text: 'Install the app first, then join from it.' }),
      el('div', { class: 'card' },
        el('div', { class: 'row' }, el('b', { text: '1' }), el('div', { class: 'grow', text: 'Tap Copy invitation below.' })),
        el('div', { class: 'row' }, el('b', { text: '2' }), el('div', { class: 'grow', text: 'Tap the Share button in Safari, then Add to Home Screen.' })),
        el('div', { class: 'row' }, el('b', { text: '3' }), el('div', { class: 'grow', text: 'Open Rental Inheritance from the Home Screen and tap Paste invitation.' }))),
      btn('primary wide', 'copy', 'Copy invitation', function () {
        navigator.clipboard.writeText(hashInv.line).then(function () { toast('Copied. Now Share > Add to Home Screen.'); }, function () { toast('Could not copy. Press and hold the line below.'); });
      }, 'copyinv'),
      el('p', { class: 'hint', text: hashInv.line }),
      el('button', { class: 'linkbtn', type: 'button', onclick: function () { T.joinHere = true; render(); } }, 'Use it here in Safari instead'));
  }
  if (hashInv) setTimeout(function () { if (T.screen === 'join' && !T.joinTried) { T.joinTried = true; connect(hashInv); } }, 0);
  return el('div', null, head,
    el('p', { text: 'Join with the invitation sent to you.' }),
    el('label', { class: 'f', for: 'code', text: 'Invitation' }),
    ta = el('textarea', { id: 'code', placeholder: 'RI1.', autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false' }, hashInv ? hashInv.line : ''),
    btn('wide', 'copy', 'Paste invitation', function () {
      if (navigator.clipboard && navigator.clipboard.readText) navigator.clipboard.readText().then(function (t) { ta.value = t.trim(); if (parseInvite(ta.value)) connect(); }).catch(function () { });
    }, 'paste'),
    btn('primary wide', 'check', 'Join', function () { connect(); }, 'connect'), err);
};
SCREENS.setpin = function () {
  var a, b, err = el('div', { class: 'err' });
  function done() {
    if (!/^\d{4,6}$/.test(a.value)) { err.textContent = 'Use 4 to 6 digits.'; return; }
    if (a.value !== b.value) { err.textContent = 'The two PINs do not match.'; return; }
    var salt = crypto.getRandomValues(new Uint8Array(16));
    deriveKey(a.value, salt).then(function (key) {
      localStorage.setItem(STORE, JSON.stringify({ v: 1, salt: b64(salt), n: a.value.length, iv: '', ct: '' }));
      T.key = key;
      T.S = { api: T.pending.api, token: T.pending.token, role: T.pending.role, name: T.pending.name, data: null, outbox: [], uploads: [], lastSync: 0, syncErr: '', fy: '' };
      T.pending = null;
      return saveState();
    }).then(function () { T.screen = 'loading'; render(); return sync(true); }).then(function () { go(T.S && T.S.data ? 'home' : 'loading'); });
  }
  return el('div', null, el('h1', { text: 'Choose a PIN' }),
    el('p', { text: 'The PIN locks the ledger on this phone. It is never sent anywhere. If you forget it, you will need a new invitation.' }),
    el('label', { class: 'f', for: 'pin1', text: 'PIN (4 to 6 digits)' }),
    a = el('input', { id: 'pin1', class: 'pin', type: 'password', inputmode: 'numeric', autocomplete: 'off', maxlength: '6' }),
    el('label', { class: 'f', for: 'pin2', text: 'Type it again' }),
    b = el('input', { id: 'pin2', class: 'pin', type: 'password', inputmode: 'numeric', autocomplete: 'off', maxlength: '6' }),
    btn('primary wide', 'check', 'Save PIN', done, 'savepin'), err);
};
SCREENS.loading = function () {
  var S = T.S;
  return el('div', null, el('img', { src: 'logo-160.png', alt: 'ALAM', class: 'biglogo' }), el('h1', { text: 'Rental Inheritance' }),
    el('p', { text: S && S.syncErr ? S.syncErr : 'Downloading the ledger' }),
    S && S.syncErr ? btn('primary wide', 'sync', 'Try again', function () { sync().then(function () { if (T.S.data) go('home'); }); }) : null);
};
SCREENS.unlock = function () {
  var pin = '', st = stored() || {}, n = +st.n || 0, err = el('div', { class: 'err', id: 'pinerr', role: 'alert' });
  var dots = el('div', { class: 'dots', id: 'dots', 'aria-label': 'PIN' });
  function drawDots() {
    var k = Math.max(n || 4, pin.length);
    dots.replaceChildren.apply(dots, Array.apply(null, Array(k)).map(function (_, i) { return el('span', { class: i < pin.length ? 'on' : '' }); }));
  }
  function opened() { T.fails = 0; T.idleAt = Date.now(); go(T.S.data ? 'home' : 'loading'); sync(true); }
  function tryIt() {
    if (T.waitUntil && Date.now() < T.waitUntil) { err.textContent = 'Wait a few seconds and try again.'; pin = ''; drawDots(); return; }
    var p = pin;
    unlock(p).then(opened).catch(function () {
      T.fails = (T.fails || 0) + 1; pin = ''; drawDots();
      if (T.fails >= 5) T.waitUntil = Date.now() + 30000;
      err.textContent = 'Wrong PIN.';
      dots.classList.remove('shake'); void dots.offsetWidth; dots.classList.add('shake');
    });
  }
  function press(k) {
    T.unlockPresses = (T.unlockPresses || 0) + 1; err.textContent = '';
    if (k === 'del') pin = pin.slice(0, -1); else if (pin.length < 6) pin += k;
    drawDots();
    if (n && pin.length === n) tryIt();
  }
  function face(auto) {
    if (!bioReady() || T.bioBusy) return;
    if (auto === true && (pin || T.unlockPresses !== startPresses)) return;
    var typed = T.unlockPresses = T.unlockPresses || 0;
    bioUnlock().then(function () { if (T.screen === 'unlock') opened(); }).catch(function (e) {
      if (T.screen !== 'unlock' || T.unlockPresses !== typed) return;
      err.textContent = e && e.message === 'cancel' ? 'Tap the Face ID key or type your PIN.' : 'Face ID did not work. Type your PIN.';
    });
  }
  drawDots();
  var keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', bioReady() ? 'face' : (n ? '' : 'ok'), '0', 'del'];
  var pad = el('div', { class: 'keypad', id: 'keypad' }, keys.map(function (k) {
    if (!k) return el('span');
    if (k === 'face') return el('button', { class: 'key fn', type: 'button', id: 'bioUnlock', 'aria-label': 'Unlock with Face ID', onclick: face }, svg('faceid'));
    if (k === 'del') return el('button', { class: 'key fn', type: 'button', 'aria-label': 'Delete', 'data-k': 'del', onclick: function () { press('del'); } }, svg('back'));
    if (k === 'ok') return el('button', { class: 'key fn', type: 'button', id: 'unlockbtn', 'aria-label': 'Unlock', onclick: tryIt }, svg('check'));
    return el('button', { class: 'key', type: 'button', 'data-k': k, onclick: function () { press(k); } }, k);
  }));
  function onKey(e) {
    if (T.screen !== 'unlock') { document.removeEventListener('keydown', onKey); return; }
    if (/^\d$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('del'); else if (e.key === 'Enter') tryIt();
  }
  document.removeEventListener('keydown', T.unlockKeys || function () { });
  T.unlockKeys = onKey; document.addEventListener('keydown', onKey);
  var startPresses = T.unlockPresses = T.unlockPresses || 0;
  if (bioReady() && !T.bioTried) { T.bioTried = true; setTimeout(function () { face(true); }, 350); }
  return el('div', { class: 'unlock' },
    el('img', { src: 'logo-160.png', alt: 'ALAM', class: 'biglogo' }), el('h1', { text: 'Rental Inheritance' }),
    el('p', { class: 'muted', text: bioReady() ? 'Face ID or your PIN' : 'Enter your PIN' }),
    dots, err, pad,
    el('button', { class: 'linkbtn', type: 'button', id: 'forgot', onclick: function () {
      if (confirm('Forgot your PIN? Nothing on this phone can be opened without it. This removes the ledger from this phone; ask for a new invitation to set it up again. Entries not yet sent will be lost.')) resetPhone();
    } }, 'Forgot PIN'));
};

// ---------- home ----------
function stripChips(R) {
  var S = T.S, refused = S.outbox.filter(function (o) { return o.error; }).length + S.uploads.filter(function (u) { return u.error; }).length;
  var waiting = S.outbox.filter(function (o) { return !o.error; }).length + S.uploads.filter(function (u) { return !u.error; }).length;
  var t1 = R.checks.filter(function (c) { return c.tier === 1; }).length, t2 = R.checks.filter(function (c) { return c.tier === 2; }).length;
  var out = [];
  if (refused) out.push(el('button', { class: 'schip t1', type: 'button', id: 'chip-refused', onclick: function () { T.setGroup = null; go('settings'); } }, svg('alert'), refused + ' not accepted'));
  if (t1) out.push(el('button', { class: 'schip t1', type: 'button', id: 'chip-t1', onclick: function () { scrollToId('checks'); } }, svg('alert'), t1 + ' to fix'));
  if (t2) out.push(el('button', { class: 'schip t2', type: 'button', id: 'chip-t2', onclick: function () { T.fold.checks = true; render(); scrollToId('checks'); } }, svg('alert'), t2 + ' to check'));
  if (waiting) out.push(el('button', { class: 'schip t3', type: 'button', id: 'chip-wait', onclick: function () { sync(); } }, svg('wait'), waiting + ' waiting to send'));
  return out.length ? el('div', { class: 'strip', id: 'strip' }, out) : null;
}
function scrollToId(id) { var e = document.getElementById(id); if (e) e.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
function heirCard(h) {
  var cls = h.custodian ? '' : h.pending > 1 ? ' owed' : h.pending < -1 ? ' over' : '';
  return el('button', { class: 'card heir' + cls, type: 'button', 'data-heir': h.name, onclick: function () { openHeir(h); } },
    el('div', { class: 'nm' }, h.name, el('span', { text: h.shareText })),
    el('div', { class: 'sm', text: 'Pending' }),
    el('div', { class: 'val' + (h.pending < 0 ? ' neg' : ''), text: fmtRs(h.pending) }),
    el('div', { class: 'sm', text: h.carry }));
}
SCREENS.home = function () {
  var c = calcNow(), R = c.R, D = c.D;
  var t1 = R.checks.filter(function (x) { return x.tier < 3; }), info = R.checks.filter(function (x) { return x.tier === 3; });
  var recent = KINDS.reduce(function (a, k) { return a.concat(R[{ INCOME: 'income', OUTFLOWS: 'outflows', PAYMENTS: 'payments', TBZ: 'tbzRows', FUND_IN: 'fundIn' }[k]].filter(function (r) { return !r.auto; }).map(function (r) { return { tab: k, r: r }; })); }, [])
    .sort(byNewest).slice(0, 5);
  var showChecks = T.fold.checks || R.checks.some(function (x) { return x.tier === 1; });
  return el('div', null,
    topBar('Inheritance'),
    stripChips(R),
    T.S.syncErr ? el('div', { class: 'note', id: 'syncerr', text: T.S.syncErr }) : null,
    R.closed ? closedNote(R.fy) : null,
    el('div', { class: 'card hero', id: 'hero' },
      el('div', { class: 'lbl', text: 'Net income to divide, ' + R.fy }),
      el('div', { class: 'big', id: 'net', text: fmtRs(R.net) }),
      el('div', { class: 'sub', text: 'Gross ' + groupNum_(R.gross) + ' less outflows ' + groupNum_(R.charged) })),
    el('h2', null, svg('users'), 'Heirs'),
    el('div', { class: 'heirs', id: 'heirs' }, R.heirs.map(heirCard)),
    el('button', { class: 'card list', type: 'button', id: 'cashcard', onclick: function () { go('summary'); } },
      el('div', { class: 'row' }, el('div', { class: 'grow' }, el('b', { text: 'Cash with ' + R.custodian }), el('div', { class: 'sm', text: 'Should be in hand now' })),
        el('div', { class: 'amt', id: 'cashhand', text: fmtRs(R.cash.shouldHave) })),
      el('div', { class: 'row' }, el('div', { class: 'sm grow', text: 'Of which owed to others' }), el('div', { class: 'amt', text: fmtRs(R.cash.owedOthers) })),
      R.cash.actual !== null ? el('div', { class: 'row' }, el('div', { class: 'sm grow', text: 'Actual bank and cash: ' + fmtRs(R.cash.actual) }),
        el('span', { class: 'chip ' + (R.cash.diff === 0 ? 'ok' : 'due') }, R.cash.diff === 0 ? 'Matches' : 'Off by ' + groupNum_(R.cash.diff))) : null),
    el('div', { class: 'card', id: 'patokicard' },
      el('div', { class: 'row' }, el('div', { class: 'grow' }, el('b', { text: R.patoki.name }), el('div', { class: 'sm', text: 'Received ' + groupNum_(R.patoki.received) + ' of ' + groupNum_(R.patoki.fixed) })),
        el('span', { class: 'chip ' + (R.patoki.due <= 0 ? 'ok' : 'wait') }, R.patoki.due <= 0 ? 'All received' : groupNum_(R.patoki.due) + ' due'))),
    el('div', { class: 'card', id: 'tbzcard' },
      el('div', { class: 'row' }, el('div', { class: 'grow' }, el('b', { text: R.tbz.name }),
          el('div', { class: 'sm', id: 'tbzline', text: 'Rent ' + groupNum_(R.tbz.gross) + ', expenses ' + groupNum_(R.tbz.expenses + R.tbz.outflows) + ', ' + R.tbz.collector + ' keeps ' + groupNum_(R.tbz.net) })),
        el('span', { class: 'chip ' + (R.tbz.missing.length ? 'due' : 'ok') }, R.tbz.missing.length ? R.tbz.missing.length + ' not received' : 'Received')),
      monthGrid(R),
      isCust() && !R.closed ? el('p', { class: 'hint', text: 'Months count as received automatically. Tap a month to change it.' }) : null,
      isCust() && !R.closed ? btn('wide', 'out', 'Add ' + R.tbz.name + ' expense', function () { openTbzExpense(); }, 'addtbzexp') : null),
    R.checks.length ? el('div', { id: 'checks' },
      el('h2', null, svg('alert'), 'Items to check (' + R.checks.length + ')'),
      showChecks ? el('div', { class: 'card checks' }, R.checks.slice(0, T.fold.allChecks ? 99 : 6).map(checkRow),
        R.checks.length > 6 && !T.fold.allChecks ? el('button', { class: 'fold', type: 'button', onclick: function () { T.fold.allChecks = true; render(); } }, 'See all ' + R.checks.length) : null)
        : el('button', { class: 'fold', type: 'button', id: 'showchecks', onclick: function () { T.fold.checks = true; render(); } }, 'Show ' + t1.length + ' to check' + (info.length ? ' and ' + info.length + ' notes' : ''))) : null,
    el('h2', null, svg('clock'), 'Latest entries'),
    el('div', { class: 'card list', id: 'recent' }, recent.length ? recent.map(function (x) { return entryRow(x.tab, x.r); }) : el('p', { class: 'muted', text: 'Nothing entered for ' + R.fy + ' yet.' })));
};
function monthGrid(R) {
  var cur = todayPk().slice(0, 7);
  var can = isCust() && !R.closed;
  return el('div', { class: 'months', id: 'tbzmonths' }, fyMonths(R.fy).map(function (m) {
    var row = R.tbzRows.filter(function (r) { return r.month === m; })[0];
    var cls = row && row.received === 'Y' ? 'ok' : row ? 'miss' : 'fut';
    var lab = !row ? '' : row.received !== 'Y' ? 'No' : row.auto ? 'Auto' : 'Yes';
    return el(can ? 'button' : 'div', { class: 'mo ' + cls + (row && !row.auto ? ' set' : ''), type: can ? 'button' : null, 'data-m': m,
      onclick: can ? function () { openTbzMonth(m); } : null }, el('b', { text: fmtMonth(m).slice(0, 3) }), lab);
  }));
}
function openTbzMonth(m) {
  var D = view(), row = D.tables.TBZ.filter(function (r) { return r.month === m; })[0];
  if (row) openForm('TBZ', row); else openForm('TBZ', null, { month: m, rent: tbzRate(D, m) });
}
function openTbzExpense() {
  var set = settingsOf(view());
  openForm('OUTFLOWS', null, { taken_from: set.tbz_taken_from || 'TBZ', paid_by: set.tbz_collector || '', category: 'Property' });
}
function checkRow(c) {
  return el('button', { class: 'row t' + c.tier, type: 'button', onclick: function () {
    if (c.kind === 'entry') { var D = view(); var r = D.tables[c.ref.tab].filter(function (x) { return x.id === c.ref.id; })[0]; if (r) openEntry(c.ref.tab, r); }
    else if (c.kind === 'tbz' && isCust() && !curClosed()) openForm('TBZ', null, { month: c.ref });
    else if (c.kind === 'cash' && isCust()) openCashActual();
    else if (c.kind === 'settings') go('settings');
    else if (c.kind === 'heir') { var h = calcNow().R.heirs.filter(function (x) { return x.name === c.ref; })[0]; if (h) openHeir(h); }
  } }, el('div', { class: 'grow', text: c.text }));
}
function byNewest(a, b) {
  var x = a.r.date || (a.r.month ? a.r.month + '-01' : ''), y = b.r.date || (b.r.month ? b.r.month + '-01' : '');
  if (a.r.pending !== b.r.pending) return a.r.pending ? -1 : 1;
  return x < y ? 1 : x > y ? -1 : String(b.r.id) < String(a.r.id) ? -1 : 1;
}
function curClosed() { return closedYears(view()).indexOf(curFy()) >= 0; }

// ---------- entry rows and details ----------
function entryText(tab, r) {
  if (tab === 'INCOME') return { t: r.source + (r.detail ? ', ' + r.detail : ''), chip: isDirect(r) ? ['wait', 'Not in cash'] : null, s: [fmtDate(r.date), isDirect(r) ? 'paid directly' : 'by ' + r.collected_by, r.mode].filter(Boolean).join(' · ') };
  if (tab === 'OUTFLOWS') {
    var tw = String(settingsOf(T.S.data || { tables: {} }).tbz_taken_from || 'TBZ').toLowerCase();
    return { t: r.payee, s: [r.category, r.taken_from, fmtDate(r.date)].filter(Boolean).join(' · '),
      chip: String(r.taken_from).toLowerCase() === 'fund' ? ['wait', 'From fund'] : r.charged !== 'Y' ? ['due', 'Not charged'] : String(r.taken_from).toLowerCase().indexOf(tw) === 0 ? ['wait', 'From ' + r.taken_from] : null };
  }
  if (tab === 'PAYMENTS') return { t: r.heir + ': ' + r.type, s: [r.batch, fmtDate(r.date), extraOf(r).mode, r.cash === 'Y' ? 'cash' : 'not cash'].filter(Boolean).join(' · ') };
  if (tab === 'TBZ') return { t: 'TBZ ' + fmtMonth(r.month), s: r.auto ? 'Counted automatically at the rate on file' : [r.received === 'Y' ? 'Received' : 'Not received', Number(r.expenses) ? 'expenses ' + groupNum_(r.expenses) : '', r.note].filter(Boolean).join(' · '),
    chip: r.auto ? ['wait', 'Auto'] : r.received === 'Y' ? null : ['due', 'Not received'] };
  if (tab === 'FUND_IN') return { t: 'Back to fund: ' + r.from_whom, s: fmtDate(r.date) };
  return { t: r.item, s: r.fy };
}
function entryRow(tab, r) {
  var x = entryText(tab, r), amount = tab === 'TBZ' ? r.rent : r.amount;
  return el('button', { class: 'row', type: 'button', 'data-tab': tab, 'data-id': r.id || '', onclick: function () { openEntry(tab, r); } },
    el('span', { class: 'rowic' }, svg(KIND_ICON[tab])),
    el('div', { class: 'grow' }, el('div', { text: x.t }), el('div', { class: 'sm', text: x.s }),
      r.pending ? el('div', { class: 'pending' + (r.error ? ' bad' : ''), text: r.error ? 'Not accepted: ' + r.error : 'Waiting to send' }) : null),
    el('div', { class: 'right' }, el('div', { class: amtCls(amount), text: groupNum_(amount) }), x.chip ? el('span', { class: 'chip ' + x.chip[0], text: x.chip[1] }) : null));
}
function fieldText(tab, k, v) {
  var F = SCHEMA[tab].fields[k];
  if (v === '' || v === undefined || v === null) return '';
  if (F.t === 'date') return fmtDate(v);
  if (F.t === 'month') return fmtMonth(v);
  if (F.t === 'amt' || F.t === 'samt' || F.t === 'int') return fmtRs(Number(v));
  if (F.t === 'yn') return v === 'Y' ? 'Yes' : 'No';
  return String(v);
}
function openEntry(tab, r) {
  if (tab === 'TBZ' && r.auto) { if (isCust() && !curClosed()) openTbzMonth(r.month); return; }
  var D = view(), closed = closedYears(D).indexOf(r.fy) >= 0, group = extraOf(r).qurbani || '';
  var groupRows = group ? ['INCOME', 'PAYMENTS'].reduce(function (a, t) { return a.concat(D.tables[t].filter(function (x) { return extraOf(x).qurbani === group; }).map(function (x) { return { tab: t, r: x }; })); }, []) : [];
  sheetOpen(function () {
    var reason;
    var kv = Object.keys(SCHEMA[tab].fields).map(function (k) { var v = fieldText(tab, k, r[k]); return v ? [el('div', { text: SCHEMA[tab].fields[k].label }), el('div', { text: v })] : null; });
    var vf = VFIELDS[tab] || {}, ex0 = extraOf(r);
    Object.keys(vf).forEach(function (k) { if (ex0[vf[k].key]) kv.push([el('div', { text: vf[k].label }), el('div', { text: ex0[vf[k].key] })]); });
    return sheetWrap(SCHEMA[tab].label, el('div', { class: 'detail' }, [
      el('h2', null, svg(KIND_ICON[tab]), SCHEMA[tab].label + (r.id ? ' ' + r.id : '')),
      r.pending ? el('div', { class: 'pending' + (r.error ? ' bad' : ''), text: r.error ? 'Not accepted: ' + r.error : 'Waiting to send' }) : null,
      el('div', { class: 'kv' }, kv, el('div', { text: 'Year' }), el('div', { text: r.fy || '' })),
      photoStrip(tab, r, closed),
      closed ? closedNote(r.fy) : null,
      group ? el('div', { class: 'note', id: 'groupnote', text: 'Part of one Qurbani (' + groupRows.length + ' entries' + (extraOf(r).direct ? ', paid directly from ' + (r.source || 'income') : '') + '). Deleting removes all of them.' }) : null,
      isCust() && !closed ? el('div', { class: 'actions2' },
        group ? el('span') : btn('primary', 'edit', 'Edit', function () { openForm(tab, r); }, 'editbtn'),
        btn('danger', 'trash', 'Delete', function () { document.getElementById('delbox').classList.remove('hidden'); reason.focus(); }, 'delbtn')) : null,
      isCust() && !closed ? el('div', { id: 'delbox', class: 'hidden' },
        el('label', { class: 'f', for: 'delreason', text: 'Why delete it?' }),
        reason = el('input', { id: 'delreason', placeholder: 'For example: typed twice' }),
        btn('danger wide', 'trash', 'Delete this entry', function () {
          if (!reason.value.trim()) { toast('Give a reason first.'); reason.focus(); return; }
          var S = T.S;
          (group ? groupRows : [{ tab: tab, r: r }]).forEach(function (g) {
            if (!g.r.id) S.outbox = S.outbox.filter(function (o) { return o.req_id !== g.r.key; });
            else { S.outbox = S.outbox.filter(function (o) { return !(o.op === 'save' && o.rec.id === g.r.id); }); S.outbox.push({ op: 'del', tab: g.tab, req_id: uuid(), id: g.r.id, reason: reason.value.trim() }); }
          });
          T.sheet = null; saveState().then(function () { render(); toast('Deleted.', true); sync(true); });
        }, 'delconfirm')) : null,
      btn('wide', 'x', 'Close', sheetClose)]));
  });
}
function openHeir(h) {
  var D = view();
  sheetOpen(function () {
    return sheetWrap(h.name, [
      el('h2', null, svg('users'), h.name + ', share ' + h.shareText),
      el('div', { class: 'kv' },
        el('div', { text: 'Entitlement' }), el('div', { text: fmtRs(h.entitlement) }),
        h.opening ? [el('div', { text: 'Opening balance' }), el('div', { text: fmtRs(h.opening) })] : null,
        h.tbzRetained ? [el('div', { text: 'TBZ retained' }), el('div', { text: fmtRs(h.tbzRetained) })] : null,
        el('div', { text: 'Paid in cash' }), el('div', { text: fmtRs(h.cash) }),
        el('div', { text: 'Other (adjustments)' }), el('div', { text: fmtRs(h.nonCash - h.tbzRetained) }),
        el('div', { text: 'Received in all' }), el('div', { text: fmtRs(h.received) }),
        el('div', { class: 'tot', text: 'Pending' }), el('div', { class: 'tot', text: fmtRs(h.pending) }),
        el('div', { text: 'Carry forward' }), el('div', { text: h.carry })),
      el('h2', { text: 'Payments' }),
      el('div', { class: 'card list' }, h.payments.length ? h.payments.map(function (p) { return entryRow('PAYMENTS', p); }) : el('p', { class: 'muted', text: 'None this year.' })),
      isCust() && !curClosed() ? btn('primary wide', 'plus', 'Add payment to ' + h.name, function () { openForm('PAYMENTS', null, { heir: h.name }); }) : null,
      btn('wide', 'x', 'Close', sheetClose)]);
  });
}

// ---------- ledger ----------
SCREENS.ledger = function () {
  var D = view(), fy = curFy();
  var seg = el('div', { class: 'seg', id: 'seg' }, ['ALL'].concat(KINDS).map(function (k) {
    return el('button', { type: 'button', class: T.kind === k ? 'on' : '', 'data-k': k, onclick: function () { T.kind = k; render(); } }, KIND_LABEL[k]);
  }));
  var search = el('input', { id: 'search', type: 'search', placeholder: 'Search payee, heir, source or amount', value: T.q, autocomplete: 'off',
    oninput: function (e) { T.q = e.target.value; var l = document.getElementById('ledgerlist'); if (l) l.replaceWith(ledgerList(view(), fy)); } });
  return el('div', null, topBar('Ledger'), closedYears(D).indexOf(fy) >= 0 ? closedNote(fy) : null, seg, search, ledgerList(D, fy));
};
function ledgerList(D, fy) {
  var q = T.q.trim().toLowerCase(), qd = q.replace(/[,\s]/g, '');
  var items = (T.kind === 'ALL' ? KINDS : [T.kind]).reduce(function (a, k) {
    var rows = k === 'TBZ' ? yearCalc(D, fy, todayPk()).tbzRows : D.tables[k].filter(function (r) { return r.fy === fy; });
    return a.concat(rows.map(function (r) { return { tab: k, r: r }; }));
  }, []).filter(function (x) {
    if (!q) return true;
    var t = entryText(x.tab, x.r), amt = String(x.tab === 'TBZ' ? x.r.rent : x.r.amount);
    return (t.t + ' ' + t.s + ' ' + (x.r.note || '')).toLowerCase().indexOf(q) >= 0 || (/^\d+$/.test(qd) && amt.indexOf(qd) >= 0);
  }).sort(byNewest);
  var total = items.reduce(function (s, x) { return s + Number(x.tab === 'TBZ' ? x.r.rent : x.r.amount); }, 0);
  return el('div', { id: 'ledgerlist' },
    el('p', { class: 'muted', id: 'ledgercount', text: items.length + ' entr' + (items.length === 1 ? 'y' : 'ies') + (T.kind !== 'ALL' ? ', ' + fmtRs(total) : '') }),
    el('div', { class: 'card list' }, items.length ? items.map(function (x) { return entryRow(x.tab, x.r); }) : el('p', { class: 'muted', text: 'Nothing here.' })));
}

// ---------- adding and editing ----------
function openAddChooser() {
  if (curClosed()) { toast(curFy() + ' is closed. Choose another year or reopen it in Settings.'); return; }
  sheetOpen(function () {
    return sheetWrap('Add', [el('h2', { text: 'Add to ' + curFy() }),
      el('div', { class: 'tiles three' },
        tile('INCOME', 'Income', 'Thaika, kiraya, mall'), tile('OUTFLOWS', 'Outflow', 'Zakat, charity, loans, costs'),
        tile('PAYMENTS', 'Payment to heir', 'Cash, Qurbani, adjustment'), tile('TBZ', 'Change a TBZ month', 'Months count as received unless changed'),
        el('button', { class: 'tile', type: 'button', id: 'add-TBZEXP', onclick: openTbzExpense }, svg('out'), el('b', { text: 'TBZ expense' }), el('span', { text: 'Repairs, bills: ' + (settingsOf(view()).tbz_collector || 'collector') + ' keeps less' })),
        tile('FUND_IN', 'Money back to fund', 'A loan repaid'),
        el('button', { class: 'tile', type: 'button', id: 'add-QURBANI', onclick: function () { openQurbani(); } }, svg('users'), el('b', { text: 'Qurbani' }), el('span', { text: 'Split by sevenths, from income or cash' }))),
      btn('wide', 'x', 'Close', sheetClose)]);
  });
  function tile(tab, title, sub) { return el('button', { class: 'tile', type: 'button', id: 'add-' + tab, onclick: function () { openForm(tab); } }, svg(KIND_ICON[tab]), el('b', { text: title }), el('span', { text: sub })); }
}
// A date inside the year being shown: today if it is that year, otherwise its last day (never in the future).
function defaultDate() {
  var fy = curFy(), t = todayPk(), end = (fyStart(fy) + 1) + '-06-30', start = fyStart(fy) + '-07-01';
  return t >= start && t <= end ? t : t > end ? end : start;
}
function openForm(tab, r, preset) {
  var D = view(), cust = settingsOf(D).custodian || '';
  var f = r ? JSON.parse(JSON.stringify(r)) : { id: '' };
  if (!r) {
    var dflt = {
      INCOME: { date: defaultDate(), collected_by: cust },
      OUTFLOWS: { date: defaultDate(), paid_by: cust, charged: 'Y' },
      PAYMENTS: { date: defaultDate(), type: 'Cash', cash: 'Y' },
      TBZ: { received: 'Y', expenses: '' },
      FUND_IN: { date: defaultDate() }
    }[tab] || {};
    Object.assign(f, dflt, preset || {});
    if (tab === 'TBZ') {
      var R = yearCalc(D, curFy(), todayPk());
      var stored = D.tables.TBZ.filter(function (x) { return x.fy === curFy(); }).map(function (x) { return x.month; });
      f.month = f.month || fyMonths(curFy()).filter(function (m) { return m <= todayPk().slice(0, 7) && stored.indexOf(m) < 0; }).pop() || fyMonths(curFy()).filter(function (m) { return stored.indexOf(m) < 0; })[0] || '';
      f.rent = f.rent || (f.month ? tbzRate(D, f.month) : '');
    }
  }
  var vfs = VFIELDS[tab] || {}, exf = extraOf(r || preset || {});
  Object.keys(vfs).forEach(function (k) { if (f[k] === undefined) f[k] = exf[vfs[k].key] || ''; });
  T.form = { tab: tab, f: f, orig: r || null, photos: [], minus: {} };
  Object.keys(SCHEMA[tab].fields).forEach(function (k) { if (SCHEMA[tab].fields[k].t === 'samt' && Number(f[k]) < 0) { T.form.minus[k] = true; f[k] = String(-Number(f[k])); } });
  T.sheet = null; go('form');
}
var FORM_LAYOUT = {
  INCOME: ['date', 'source', 'detail', 'collected_by', 'amount', 'mode', 'note'],
  OUTFLOWS: ['date', 'category', 'payee', 'amount', 'taken_from', 'paid_by', 'charged', 'note'],
  PAYMENTS: ['heir', 'type', 'amount', 'pay_mode', 'date', 'batch', 'note'],
  TBZ: ['month', 'rent', 'received', 'note'],
  FUND_IN: ['date', 'from_whom', 'amount', 'note'],
  OPENING: ['item', 'amount', 'note']
};
var SUGGEST = { taken_from: 'TAKEN_FROM', mode: 'MODES', pay_mode: 'MODES' };
// Banks and accounts offered as tags. Added once to the workbook's MODES list so they can be switched off in Settings > Lists.
var DEFAULT_MODES = ['Cash', 'ABL', 'MCB', 'Meezan Bank', 'HBL', 'UBL', 'Bank Alfalah', 'PCB transfer', 'JazzCash', 'Easypaisa'];
// Fields kept in the "extra" column (no workbook change needed): tab -> field -> {key in extra, label}.
var VFIELDS = { PAYMENTS: { pay_mode: { key: 'mode', label: 'Paid by (cash or bank)' } } };
function modeList(D) {
  var all = (D.tables.LISTS || []).filter(function (r) { return r.list === 'MODES'; }), off = all.filter(function (r) { return String(r.active) === 'N'; }).map(function (r) { return r.value; });
  var vals = listOf(D, 'MODES');
  DEFAULT_MODES.forEach(function (m) { if (vals.indexOf(m) < 0 && off.indexOf(m) < 0) vals.push(m); });
  return vals;
}
function seedModes(S) {
  if (S.role !== 'custodian' || !S.data || S.modesSeeded) return;
  var have = (S.data.tables.LISTS || []).filter(function (r) { return r.list === 'MODES'; }).map(function (r) { return String(r.value).toLowerCase(); });
  var n = have.length;
  DEFAULT_MODES.forEach(function (m) {
    if (have.indexOf(m.toLowerCase()) < 0) { n++; S.outbox.push({ op: 'save', tab: 'LISTS', req_id: uuid(), rec: { list: 'MODES', value: m, active: 'Y', sort: String(n) } }); }
  });
  S.modesSeeded = 1;
}
function addModeIfNew(D, v) {
  v = String(v || '').trim();
  if (!v || (D.tables.LISTS || []).some(function (r) { return r.list === 'MODES' && String(r.value).toLowerCase() === v.toLowerCase(); })) return;
  T.S.outbox.push({ op: 'save', tab: 'LISTS', req_id: uuid(), rec: { list: 'MODES', value: v, active: 'Y', sort: String((D.tables.LISTS || []).length + 1) } });
}
SCREENS.form = function () {
  var F = T.form, tab = F.tab, f = F.f, D = view(), S = SCHEMA[tab], err = el('div', { class: 'err', id: 'formerr' });
  var heirs = heirsOf(D).map(function (h) { return h.name; });
  function fieldEl(k) {
    var def = S.fields[k] || { t: 'text', label: VFIELDS[tab][k].label }, id = 'f-' + k, label = el('label', { class: 'f', for: id, text: def.label + (def.req ? '' : ' (optional)') });
    if (def.t === 'date') return [label, el('input', { id: id, type: 'date', value: f[k] || '', max: todayPk(), oninput: function (e) { f[k] = e.target.value; } })];
    if (def.t === 'month') return [label, el('input', { id: id, type: 'month', value: f[k] || '', oninput: function (e) {
      f[k] = e.target.value; if (tab === 'TBZ' && !F.rentTyped && f.month) { f.rent = tbzRate(D, f.month) || f.rent; var ri = document.getElementById('f-rent'); if (ri) { ri.value = f.rent; ri.dispatchEvent(new Event('input')); } }
    } })];
    if (def.t === 'heir') return [label, chips(heirs, f[k], function (x) { f[k] = x; }, id)];
    if (def.t.indexOf('list:') === 0) {
      var vals = listOf(D, def.t.slice(5)); if (f[k] && vals.indexOf(f[k]) < 0) vals = vals.concat([f[k]]);
      return [label, chips(vals, f[k], function (x) { f[k] = x; if (k === 'type') { f.cash = x === 'Adjustment' ? 'N' : 'Y'; drawCashHint(); } }, id)];
    }
    if (def.t === 'yn') {
      var lab = k === 'charged' ? 'Charged to the pool (reduces what is divided)' : k === 'received' ? 'Received' : def.label;
      return el('label', { class: 'switch', for: id }, el('span', { text: lab }),
        el('input', { id: id, type: 'checkbox', checked: f[k] === 'Y', onchange: function (e) { f[k] = e.target.checked ? 'Y' : 'N'; } }));
    }
    if (def.t === 'amt' || def.t === 'samt' || def.t === 'int') {
      var hint = el('div', { class: 'hint', id: id + '-hint' });
      var upd = function () { var a = Number(f[k]); hint.textContent = a ? (F.minus[k] ? 'Minus ' : '') + fmtRs(a) : ''; };
      var inp = el('input', { id: id, inputmode: 'numeric', autocomplete: 'off', value: f[k] === undefined ? '' : String(f[k]), placeholder: 'Rupees',
        oninput: function (e) { var v = e.target.value.replace(/[^\d]/g, ''); if (v !== e.target.value) e.target.value = v; f[k] = v; if (k === 'rent') F.rentTyped = true; upd(); } });
      upd();
      var minus = def.t === 'samt' ? el('label', { class: 'switch', for: id + '-minus' },
        el('span', { text: tab === 'PAYMENTS' ? 'Minus (taken back from this heir)' : tab === 'OPENING' ? 'Minus (this heir owes the pool)' : 'Minus (a correction)' }),
        el('input', { id: id + '-minus', type: 'checkbox', checked: !!F.minus[k], onchange: function (e) { F.minus[k] = e.target.checked; upd(); } })) : null;
      return [label, inp, hint, minus];
    }
    var long = k === 'note' || k === 'payee';
    var input = el(long ? 'textarea' : 'input', { id: id, maxlength: '500', value: long ? null : (f[k] || ''), autocomplete: 'off', oninput: function (e) { f[k] = e.target.value; } }, long ? (f[k] || '') : null);
    var sv = SUGGEST[k] === 'MODES' ? modeList(D) : SUGGEST[k] ? listOf(D, SUGGEST[k]) : [];
    if (k === 'taken_from') { var tw = settingsOf(D).tbz_taken_from || 'TBZ'; if (sv.indexOf(tw) < 0) sv = sv.concat([tw]); }
    if (k === 'pay_mode') input.setAttribute('placeholder', 'Or type another bank or account');
    var sugg = SUGGEST[k] ? chips(sv, f[k], function (x) { f[k] = x; input.value = x; if (k === 'taken_from') drawFundHint(); }, id + '-chips') : null;
    if (k === 'taken_from') input.addEventListener('input', drawFundHint);
    if (k === 'item') sugg = chips(heirs.concat(['Cash']), f[k], function (x) { f[k] = x; input.value = x; }, id + '-chips');
    return [label, sugg, input];
  }
  var cashHint = el('div', { class: 'hint', id: 'cashhint' }), fundHint = el('div', { class: 'note hidden', id: 'fundhint', text: 'Paid from money back in the fund: it is not charged to the pool.' });
  function drawCashHint() { if (tab === 'PAYMENTS') cashHint.textContent = f.cash === 'Y' ? 'Counts as cash paid out by ' + (settingsOf(D).custodian || 'the custodian') + '.' : 'Not cash: counts toward the share only.'; }
  var tbzHint = el('div', { class: 'note hidden', id: 'tbzhint', text: 'Paid out of ' + (settingsOf(D).tbz_name || 'TBZ') + ' rent: ' + (settingsOf(D).tbz_collector || 'the collector') + ' keeps that much less. Charged to the pool.' });
  function drawFundHint() {
    if (tab !== 'OUTFLOWS') return;
    var tf = String(f.taken_from || '').trim().toLowerCase(), tw = String(settingsOf(D).tbz_taken_from || 'TBZ').toLowerCase();
    fundHint.classList.toggle('hidden', tf !== 'fund'); tbzHint.classList.toggle('hidden', tf.indexOf(tw) !== 0);
  }
  drawCashHint();
  var layout = FORM_LAYOUT[tab].slice(); if (tab === 'TBZ' && Number(f.expenses)) layout.splice(2, 0, 'expenses');
  var body = layout.map(function (k) { var x = fieldEl(k); if (k === 'type') return [x, cashHint]; if (k === 'charged') return [fundHint, tbzHint, x]; return x; });
  setTimeout(drawFundHint, 0);
  function save(force) {
    var rec = {};
    Object.keys(S.fields).forEach(function (k) {
      var v = f[k] === undefined || f[k] === null ? '' : String(f[k]).trim();
      if (v !== '' && S.fields[k].t === 'samt' && F.minus[k]) v = String(-Number(v));
      rec[k] = v;
    });
    if (tab === 'OUTFLOWS' && rec.taken_from.toLowerCase() === 'fund') { rec.taken_from = 'Fund'; rec.charged = 'N'; }
    if (tab === 'PAYMENTS') rec.cash = rec.type === 'Adjustment' ? 'N' : 'Y';
    if (tab === 'OPENING') rec.fy = F.f.fy || curFy();
    var ex = extraOf(F.orig || f), vf = VFIELDS[tab] || {};
    Object.keys(vf).forEach(function (k) { var v = String(f[k] || '').trim(); if (v) ex[vf[k].key] = v; else delete ex[vf[k].key]; });
    if (Object.keys(ex).length) rec.extra = JSON.stringify(ex);
    if (tab === 'PAYMENTS' || tab === 'INCOME') addModeIfNew(D, tab === 'PAYMENTS' ? f.pay_mode : f.mode);
    if (F.orig && F.orig.id) rec.id = F.orig.id;
    var e = validateRecord_(tab, rec, ctxOf(D, F.orig));
    if (!e && tab === 'TBZ' && D.tables.TBZ.some(function (x) { return x.month === rec.month && rowKey(x) !== (F.orig ? rowKey(F.orig) : ''); })) e = fmtMonth(rec.month) + ' is already changed. Tap it on the month grid to edit it.';
    var fy = SCHEMA[tab].fyFrom ? fyOf_(tab, rec) : '';
    if (!e && fy && closedYears(D).indexOf(fy) >= 0) e = fy + ' is closed. Reopen it in Settings first.';
    if (e) { err.textContent = e; err.scrollIntoView({ block: 'center' }); return; }
    var twin = !force && lookAlike(D, tab, rec);
    if (twin) {
      err.replaceChildren('An entry with the same amount, date and ' + (tab === 'PAYMENTS' ? 'heir' : tab === 'INCOME' ? 'source' : 'payee') + ' is already there. ',
        btn('small', 'check', 'Save anyway', function () { save(true); }, 'saveanyway'));
      return;
    }
    var S2 = T.S, photos = F.photos, req;
    if (F.orig && !F.orig.id) {
      var q = S2.outbox.filter(function (o) { return o.req_id === F.orig.key; })[0];
      if (q) { q.rec = rec; q.error = ''; req = q.req_id; }
    } else {
      req = uuid();
      if (rec.id) S2.outbox = S2.outbox.filter(function (o) { return !(o.op === 'save' && o.rec.id === rec.id && o.error); });
      S2.outbox.push({ op: 'save', tab: tab, req_id: req, rec: rec });
    }
    var ref = rec.id || req, back = tab === 'OPENING' ? 'settings' : T.prevScreen || 'home';
    T.form = null;
    addPhotos(tab, ref, photos).then(function () {
      if (fy && fy !== curFy()) T.S.fy = fy;
      return saveState();
    }).then(function () { go(back); toast(navigator.onLine ? 'Saved.' : 'Saved on this phone. It will send when there is signal.', true); sync(true); });
  }
  var title = (F.orig ? 'Edit ' : 'Add ') + S.label.toLowerCase();
  return el('div', null, backBar(title, tab === 'OPENING' ? 'settings' : T.prevScreen || 'home'),
    tab === 'OPENING' ? el('p', { class: 'muted', text: 'Year ' + (F.f.fy || curFy()) + '. A plus amount is owed to that heir; for "Cash" it is cash in hand at the start of the year.' }) : null,
    body,
    tab !== 'OPENING' ? pickPhotosField(F) : null,
    btn('primary wide', 'check', 'Save', function () { save(false); }, 'save'), err);
};
function pickPhotosField(F) {
  var count = el('div', { class: 'hint', id: 'pickcount', text: F.photos.length ? F.photos.length + ' photo(s) ready' : '' });
  var input = el('input', { type: 'file', accept: 'image/*', multiple: true, class: 'hidden', id: 'formphotos', onchange: function (e) {
    Array.prototype.push.apply(F.photos, Array.prototype.slice.call(e.target.files || [])); count.textContent = F.photos.length + ' photo(s) ready';
  } });
  return [el('label', { class: 'f', text: 'Receipt or slip photos (optional)' }), input, btn('wide', 'camera', 'Add photo', function () { input.click(); }, 'addphoto'), count];
}

// ---------- Qurbani: one entry split by sevenths, paid from income directly (never in cash) or from cash in hand ----------
function openQurbani() {
  if (curClosed()) { toast(curFy() + ' is closed.'); return; }
  var D = view(), set = settingsOf(D);
  T.form = { tab: 'QURBANI', q: { date: defaultDate(), total: '', direct: true, source: set.fixed_source || set.fixed_name || '', parts: {}, typed: {}, payer: set.custodian || '' } };
  T.sheet = null; go('qurbani');
}
SCREENS.qurbani = function () {
  var D = view(), set = settingsOf(D), Q = T.form.q, H = heirsOf(D), cust = set.custodian || '';
  var sevenths = sum_(H, function (h) { return h.qurbani; }) || 7, err = el('div', { class: 'err', id: 'qerr' });
  var list = el('div', { class: 'card', id: 'qparts' }), totalHint = el('div', { class: 'hint', id: 'qsum' });
  function split() {
    var t = Number(Q.total) || 0;
    H.forEach(function (h) { if (!Q.typed[h.name]) Q.parts[h.name] = h.qurbani ? String(Math.round(t * h.qurbani / sevenths)) : (Q.parts[h.name] || ''); });
  }
  function drawParts() {
    list.replaceChildren.apply(list, H.map(function (h) {
      return el('div', { class: 'row' }, el('div', { class: 'grow' }, el('b', { text: h.name }), el('div', { class: 'sm', text: h.qurbani ? h.qurbani + '/7' : 'separate (optional)' })),
        el('input', { id: 'q-' + h.name, class: 'qamt', inputmode: 'numeric', autocomplete: 'off', value: Q.parts[h.name] || '', placeholder: '0',
          oninput: function (e) { var v = e.target.value.replace(/[^\d]/g, ''); e.target.value = v; Q.parts[h.name] = v; Q.typed[h.name] = true; drawSum(); } }));
    }));
    drawSum();
  }
  function partsTotal() { return H.reduce(function (s, h) { return s + (Number(Q.parts[h.name]) || 0); }, 0); }
  function drawSum() {
    var p = partsTotal();
    totalHint.textContent = 'Parts add up to ' + fmtRs(p) + (Q.direct ? '. Added to ' + (Q.source || 'income') + ' as income; not in ' + (cust || 'your') + ' cash.'
      : Q.payer === cust ? '. Counted as cash paid out by ' + (cust || 'the custodian') + '.'
      : '. ' + Q.payer + ' paid it all: everyone\u2019s part counts as received, and ' + Q.payer + ' is owed back ' + fmtRs(p - (Number(Q.parts[Q.payer]) || 0)) + ' (the others\u2019 parts).');
  }
  split();
  var srcChips = listOf(D, 'SOURCES');
  function save() {
    var parts = H.filter(function (h) { return Number(Q.parts[h.name]) > 0; }), total = partsTotal(), grp = 'q-' + uuid().slice(0, 8);
    if (!isYmd_(Q.date)) { err.textContent = 'Enter the date.'; return; }
    if (!parts.length) { err.textContent = 'Enter the total cost or the amounts.'; return; }
    if (Q.direct && !Q.source) { err.textContent = 'Choose which income it was paid from.'; return; }
    var items = [], ctx = ctxOf(D), e = '';
    if (Q.direct) items.push({ tab: 'INCOME', rec: { date: Q.date, source: Q.source, detail: 'Qurbani, paid directly', collected_by: cust, amount: String(total), mode: '', note: 'Paid directly for Qurbani; never reached ' + (cust || 'the custodian'), extra: JSON.stringify({ direct: 'qurbani', qurbani: grp }) } });
    var byCust = !Q.direct && Q.payer === cust, other = !Q.direct && Q.payer !== cust;
    if (!Q.direct && !Q.payer) { err.textContent = 'Choose who paid for it.'; return; }
    parts.forEach(function (h) {
      items.push({ tab: 'PAYMENTS', rec: { date: Q.date, batch: 'Qurbani', heir: h.name, type: 'Qurbani', amount: String(Number(Q.parts[h.name])), cash: byCust ? 'Y' : 'N',
        note: Q.direct ? 'Qurbani paid from ' + Q.source : byCust ? 'Qurbani paid from cash by ' + cust : 'Qurbani paid by ' + Q.payer, extra: JSON.stringify({ qurbani: grp }) } });
    });
    if (other) items.push({ tab: 'PAYMENTS', rec: { date: Q.date, batch: 'Qurbani', heir: Q.payer, type: 'Adjustment', amount: String(-total), cash: 'N',
      note: Q.payer + ' paid the whole Qurbani (' + groupNum_(total) + '); credited back', extra: JSON.stringify({ qurbani: grp }) } });
    items.forEach(function (it) { if (!e) e = validateRecord_(it.tab, it.rec, ctx); });
    var fy = fyOfMonth_(Q.date.slice(0, 7));
    if (!e && closedYears(D).indexOf(fy) >= 0) e = fy + ' is closed.';
    if (e) { err.textContent = e; return; }
    items.forEach(function (it) { T.S.outbox.push({ op: 'save', tab: it.tab, req_id: uuid(), rec: it.rec }); });
    T.form = null; if (fy !== curFy()) T.S.fy = fy;
    saveState().then(function () { go('home'); toast('Qurbani saved: ' + items.length + ' entries.', true); sync(true); });
  }
  var directSw = el('input', { id: 'q-direct', type: 'checkbox', checked: Q.direct, onchange: function (e) { Q.direct = e.target.checked; srcBox.classList.toggle('hidden', !Q.direct); payBox.classList.toggle('hidden', Q.direct); drawSum(); } });
  var payBox = el('div', { class: Q.direct ? 'hidden' : '', id: 'qpaybox' }, el('label', { class: 'f', text: 'Who paid for it?' }),
    chips(H.map(function (h) { return h.name; }).filter(function (n) { return n === cust || n === (set.tbz_collector || ''); }).concat(H.map(function (h) { return h.name; }).filter(function (n) { return n !== cust && n !== (set.tbz_collector || ''); })),
      Q.payer, function (x) { Q.payer = x; drawSum(); }, 'q-payer'));
  var srcBox = el('div', { class: Q.direct ? '' : 'hidden', id: 'qsrcbox' }, el('label', { class: 'f', text: 'Paid from' }),
    chips(srcChips, Q.source, function (x) { Q.source = x; drawSum(); }, 'q-source'));
  drawParts();
  return el('div', null, backBar('Qurbani', T.prevScreen || 'home'),
    el('label', { class: 'f', for: 'q-date', text: 'Date' }),
    el('input', { id: 'q-date', type: 'date', value: Q.date, max: todayPk(), oninput: function (e) { Q.date = e.target.value; } }),
    el('label', { class: 'f', for: 'q-total', text: 'Total cost of the shared Qurbani (Rs)' }),
    el('input', { id: 'q-total', inputmode: 'numeric', autocomplete: 'off', value: Q.total, placeholder: 'Rupees', oninput: function (e) {
      var v = e.target.value.replace(/[^\d]/g, ''); e.target.value = v; Q.total = v; Q.typed = {}; split(); drawParts();
    } }),
    el('label', { class: 'switch', for: 'q-direct' }, el('span', { text: 'Paid from ' + (set.fixed_name || 'income') + ' (or other income), never reached ' + (cust || 'the custodian') }), directSw),
    srcBox, payBox,
    el('label', { class: 'f', text: 'Each person’s part' }), list, totalHint,
    btn('primary wide', 'check', 'Save Qurbani', save, 'qsave'), err);
};

// ---------- photos ----------
function photoStrip(tab, r, closed) {
  var D = view(), ref = r.id || r.key;
  var files = D.files.filter(function (f) { return f.tab === tab && (f.ref_id === ref || (r.key && f.ref_id === r.key)); });
  var strip = el('div', { class: 'photos', id: 'photos' });
  files.forEach(function (f) {
    var id = f.file_id ? 'F:' + f.file_id : 'U:' + f.upload, img = el('img', { alt: 'Photo', class: 'thumb' });
    var wrap = el('button', { class: 'thumbwrap', type: 'button', onclick: function () { if (img.src) openViewer(img.src); } }, img,
      f.pending ? el('span', { class: 'tag', text: f.error ? 'Refused' : 'Waiting' }) : null);
    strip.appendChild(wrap);
    loadThumb(id, f).then(function (url) { if (url) img.src = url; });
  });
  var input = el('input', { type: 'file', accept: 'image/*', multiple: true, class: 'hidden', id: 'photoinput', onchange: function (e) {
    addPhotos(tab, ref, e.target.files).then(function (n) { if (n) { saveState(); toast(n + ' photo' + (n > 1 ? 's' : '') + ' added.', true); var cur = T.sheet; T.sheet = null; render(); T.sheet = cur; render(); sync(true); } });
  } });
  if (!files.length && (!isCust() || closed)) return null;
  return el('div', null, el('label', { class: 'f', text: 'Photos' }), strip, isCust() && !closed ? [input, btn('wide', 'camera', 'Add photo', function () { input.click(); }, 'addphoto2')] : null);
}
function openViewer(src) {
  var v = el('div', { class: 'viewer', id: 'viewer' }, el('img', { src: src, alt: 'Photo' }), btn('primary', 'x', 'Close', function () { v.remove(); }, 'closeviewer'));
  document.body.appendChild(v);
}
function loadThumb(id, f) {
  if (T.thumbs[id]) return Promise.resolve(T.thumbs[id]);
  if (f.upload) return photoGet(f.upload, T.key).then(function (buf) { return buf ? (T.thumbs[id] = URL.createObjectURL(new Blob([buf], { type: 'image/jpeg' }))) : null; });
  if (!navigator.onLine) return Promise.resolve(null);
  return api({ op: 'file', token: T.S.token, file_id: f.file_id }).then(function (r) {
    return r.ok ? (T.thumbs[id] = URL.createObjectURL(new Blob([b64ToBuf(r.b64)], { type: r.mime || 'image/jpeg' }))) : null;
  }).catch(function () { return null; });
}
function addPhotos(tab, ref, fileList) {
  var files = Array.prototype.slice.call(fileList || []), n = 0;
  return files.reduce(function (chain, f) {
    return chain.then(function () {
      return shrinkPhoto(f).then(function (buf) {
        var id = 'up-' + uuid();
        return photoPut(id, buf, T.key).then(function () {
          T.thumbs['U:' + id] = URL.createObjectURL(new Blob([buf], { type: 'image/jpeg' }));
          T.S.uploads.push({ id: id, tab: tab, ref: ref }); n++;
        });
      }).catch(function (e) { toast(e.message || 'Could not add that photo.'); });
    });
  }, Promise.resolve()).then(function () { return n; });
}

// ---------- summary ----------
SCREENS.summary = function () {
  var c = calcNow(), R = c.R, D = c.D;
  var bySource = {};
  R.income.forEach(function (r) { bySource[r.source] = (bySource[r.source] || 0) + Number(r.amount); });
  if (R.tbz.gross) bySource[R.tbz.name + ' (' + R.tbz.collector + ' keeps)'] = R.tbz.gross;
  var byCat = {};
  R.chargedRows.forEach(function (o) { byCat[o.category] = (byCat[o.category] || 0) + Number(o.amount); });
  if (R.tbz.expenses) byCat['TBZ expenses'] = R.tbz.expenses;
  function kvRows(obj) { return Object.keys(obj).map(function (k) { return [el('div', { text: k }), el('div', { text: groupNum_(obj[k]) })]; }); }
  var qOut = el('div', { id: 'qout' });
  function drawQ(v) { var n = Number(String(v).replace(/[^\d]/g, '')); qOut.replaceChildren(n ? el('div', { class: 'kv' }, qurbaniSplit(D, n).map(function (x) { return [el('div', { text: x.name + ' (' + x.sevenths + '/7)' }), el('div', { text: fmtRs(x.amount) })]; })) : ''); }
  return el('div', null, topBar('Summary'),
    R.closed ? closedNote(R.fy) : null,
    el('p', { class: 'muted', text: fyLabel(R.fy) }),
    el('div', { class: 'card' }, el('div', { class: 'kv', id: 'totals' },
      el('div', { text: 'Gross income to divide' }), el('div', { text: fmtRs(R.gross) }),
      el('div', { text: 'Less outflows charged to pool' }), el('div', { text: fmtRs(R.charged) }),
      el('div', { class: 'tot', text: 'Net income to divide' }), el('div', { class: 'tot', id: 'sumnet', text: fmtRs(R.net) }))),
    el('h2', null, svg('users'), 'Heirs'),
    el('div', { class: 'card' }, el('table', { class: 't', id: 'heirtable' },
      el('tr', null, el('th', { text: 'Heir' }), el('th', { text: 'Entitled' }), el('th', { text: 'Received' }), el('th', { text: 'Pending' })),
      R.heirs.map(function (h) {
        return el('tr', null, el('td', null, el('b', { text: h.name }), el('div', { class: 'sm', text: h.shareText + (h.opening ? ', opening ' + groupNum_(h.opening) : '') }), el('div', { class: 'sm', text: h.carry })),
          el('td', { text: groupNum_(h.entitlement + h.opening) }), el('td', { text: groupNum_(h.received) }), el('td', { class: h.pending < 0 ? 'neg' : '', text: groupNum_(h.pending) }));
      }),
      el('tr', { class: 'tot' }, el('td', { text: 'Total' }), el('td', { text: groupNum_(R.totals.entitlement + sum_(R.heirs, function (h) { return h.opening; })) }),
        el('td', { text: groupNum_(R.totals.received) }), el('td', { text: groupNum_(R.totals.pending) })))),
    el('h2', null, svg('cash'), 'Cash with ' + R.custodian),
    el('div', { class: 'card' }, el('div', { class: 'kv', id: 'cashkv' },
      el('div', { text: 'Opening (' + R.cash.openingFrom + ')' }), el('div', { text: groupNum_(R.cash.opening) }),
      el('div', { text: 'Collected by ' + R.custodian }), el('div', { text: groupNum_(R.cash.collected) }),
      R.cash.fundIn ? [el('div', { text: 'Money back to fund' }), el('div', { text: groupNum_(R.cash.fundIn) })] : null,
      R.cash.direct ? [el('div', { class: 'sm', text: 'Not in cash: paid directly from income (Qurbani)' }), el('div', { class: 'sm', text: groupNum_(R.cash.direct) })] : null,
      el('div', { text: 'Less outflows paid by ' + R.custodian }), el('div', { text: groupNum_(-R.cash.outPaid) }),
      el('div', { text: 'Less cash paid to heirs' }), el('div', { text: groupNum_(-R.cash.paidHeirs) }),
      el('div', { class: 'tot', text: 'Should be in hand' }), el('div', { class: 'tot', id: 'shouldhave', text: fmtRs(R.cash.shouldHave) }),
      el('div', { text: 'Actual bank and cash' }), el('div', { text: R.cash.actual === null ? 'Not entered' : fmtRs(R.cash.actual) }),
      R.cash.diff !== null ? [el('div', { text: 'Difference' }), el('div', { text: fmtRs(R.cash.diff) })] : null),
      isCust() && !R.closed ? btn('wide', 'edit', 'Enter actual bank and cash', openCashActual, 'cashactual') : null),
    el('h2', null, svg('income'), 'Income'),
    el('div', { class: 'card' }, el('div', { class: 'kv' }, kvRows(bySource), el('div', { class: 'tot', text: 'Gross' }), el('div', { class: 'tot', text: groupNum_(R.gross) }))),
    el('h2', null, svg('out'), 'Outflows charged to pool'),
    el('div', { class: 'card' }, el('div', { class: 'kv' }, kvRows(byCat), el('div', { class: 'tot', text: 'Total' }), el('div', { class: 'tot', text: groupNum_(R.charged) })),
      R.notCharged.length ? el('p', { class: 'muted', text: R.notCharged.length + ' listed but not charged: ' + fmtRs(sum_(R.notCharged, function (o) { return o.amount; })) + '.' }) : null),
    el('h2', null, svg('building'), R.patoki.name + ' and ' + R.tbz.name),
    el('div', { class: 'card' }, el('div', { class: 'kv' },
      el('div', { text: R.patoki.name + ', fixed yearly amount' }), el('div', { text: groupNum_(R.patoki.fixed) }),
      el('div', { text: R.patoki.name + ' received' }), el('div', { text: groupNum_(R.patoki.received) }),
      el('div', { text: R.patoki.name + ' still due' }), el('div', { text: groupNum_(R.patoki.due) }),
      el('div', { text: 'Taken out before the pool' }), el('div', { text: groupNum_(R.patoki.takenOut) }),
      el('div', { text: R.tbz.name + ' rent received' }), el('div', { text: groupNum_(R.tbz.gross) }),
      el('div', { text: R.tbz.name + ' expenses' }), el('div', { text: groupNum_(R.tbz.expenses + R.tbz.outflows) }),
      R.tbz.outRows.map(function (o) { return [el('div', { class: 'sm', text: '\u2022 ' + o.payee + (o.date ? ', ' + fmtDate(o.date) : '') }), el('div', { class: 'sm', text: groupNum_(o.amount) })]; }),
      el('div', { text: R.tbz.name + ' net kept by ' + R.tbz.collector }), el('div', { text: groupNum_(R.tbz.net) }))),
    R.fund.balance || R.fund.inYear ? [el('h2', null, svg('fund'), 'Fund'), el('div', { class: 'card' }, el('div', { class: 'kv' },
      el('div', { text: 'Back to fund this year' }), el('div', { text: groupNum_(R.fund.inYear) }),
      el('div', { text: 'Paid from fund this year' }), el('div', { text: groupNum_(R.fund.outYear) }),
      el('div', { class: 'tot', text: 'Fund balance' }), el('div', { class: 'tot', text: groupNum_(R.fund.balance) })))] : null,
    el('h2', null, svg('users'), 'Qurbani split'),
    el('div', { class: 'card' }, el('label', { class: 'f', for: 'qtotal', text: 'Total cost of the shared Qurbani (Rs)' }),
      el('input', { id: 'qtotal', inputmode: 'numeric', autocomplete: 'off', oninput: function (e) { drawQ(e.target.value); } }), qOut,
      el('p', { class: 'hint', text: 'Split in sevenths as set under Heirs and shares in Settings.' }),
      isCust() && !R.closed ? btn('primary wide', 'plus', 'Record a Qurbani', function () { openQurbani(); }, 'recq') : null),
    el('h2', null, svg('doc'), 'Download'),
    btn('primary wide', 'doc', 'Summary as PDF', function () { shareFile(new Blob([pdfSummary(R)], { type: 'application/pdf' }), 'Rental_Inheritance_Summary_' + R.fy + '.pdf'); }, 'pdfbtn'),
    isCust() ? btn('wide', 'sheet', 'Full ledger as Excel', function () { shareFile(new Blob([xlsxLedger(D, R)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'Rental_Inheritance_Ledger_' + todayPk() + '.xlsx'); }, 'xlsxbtn') : null);
};
function shareFile(blob, name) {
  var file = new File([blob], name, { type: blob.type });
  if (navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file] }).catch(function () { }); return; }
  var url = URL.createObjectURL(blob), a = el('a', { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
}

// ---------- settings ----------
function settingRow(D, key) { return (D.tables.SETTINGS || []).filter(function (r) { return r.key === key; })[0] || null; }
function saveSetting(key, value, note) {
  var D = view(), cur = settingRow(D, key);
  var rec = { key: key, value: String(value), note: note !== undefined ? note : (cur ? cur.note || '' : '') };
  if (cur && cur.id) rec.id = cur.id;
  if (cur && !cur.id) { var q = T.S.outbox.filter(function (o) { return o.req_id === cur.key; })[0]; if (q) { q.rec = rec; return saveState(); } }
  return queue({ op: 'save', tab: 'SETTINGS', req_id: uuid(), rec: rec });
}
function editSheet(title, fields, onSave) {
  sheetOpen(function () {
    var inputs = {}, err = el('div', { class: 'err', id: 'editerr' });
    return sheetWrap(title, [el('h2', { text: title }),
      fields.map(function (f) {
        if (f.type === 'switch') return el('label', { class: 'switch', for: 'e-' + f.k }, el('span', { text: f.label }), inputs[f.k] = el('input', { id: 'e-' + f.k, type: 'checkbox', checked: !!f.value }));
        return [el('label', { class: 'f', for: 'e-' + f.k, text: f.label }), inputs[f.k] = el('input', { id: 'e-' + f.k, type: f.type === 'month' ? 'month' : 'text', inputmode: f.num ? 'numeric' : null, value: f.value === undefined ? '' : String(f.value), autocomplete: 'off' }),
          f.hint ? el('div', { class: 'hint', text: f.hint }) : null];
      }),
      btn('primary wide', 'check', 'Save', function () {
        var v = {}; Object.keys(inputs).forEach(function (k) { v[k] = inputs[k].type === 'checkbox' ? inputs[k].checked : inputs[k].value.trim(); });
        var e = onSave(v);
        if (e) { err.textContent = e; return; }
        T.sheet = null; saveState().then(function () { render(); toast('Saved.', true); sync(true); });
      }, 'editsave'), err, btn('wide', 'x', 'Cancel', sheetClose)]);
  });
}
function upsert(tab, rec, cur) {
  if (cur && cur.id) rec.id = cur.id;
  var e = validateRecord_(tab, rec, ctxOf(view(), cur));
  if (e) return e;
  if (cur && !cur.id) { var q = T.S.outbox.filter(function (o) { return o.req_id === cur.key; })[0]; if (q) { q.rec = rec; q.error = ''; return ''; } }
  T.S.outbox.push({ op: 'save', tab: tab, req_id: uuid(), rec: rec });
  return '';
}
function openCashActual() {
  var fy = curFy(), cur = settingRow(view(), 'cash_actual_' + fy);
  editSheet('Actual bank and cash, ' + fy, [{ k: 'v', label: 'Total in bank and cash now (Rs)', num: true, value: cur ? cur.value : '', hint: 'Leave blank to clear.' }], function (v) {
    var n = v.v.replace(/[^\d]/g, '');
    if (v.v && !n) return 'Whole rupees only.';
    saveSetting('cash_actual_' + fy, n, 'Actual bank and cash for ' + fy + ', as entered');
    return '';
  });
}
// Settings: a short list of groups; each opens its own page with a Back button. "Not accepted" stays pinned on top.
var SET_GROUPS = [
  { k: 'year', icon: 'cal', cust: true }, { k: 'heirs', icon: 'users', cust: true }, { k: 'amounts', icon: 'gear', cust: true },
  { k: 'rates', icon: 'building', cust: true }, { k: 'lists', icon: 'list', cust: true }, { k: 'phone', icon: 'faceid' }
];
function setGroupInfo(k, D) {
  var fy = curFy(), set = settingsOf(D), closed = closedYears(D).indexOf(fy) >= 0;
  if (k === 'year') {
    var nOpen = D.tables.OPENING.filter(function (r) { return r.fy === fy; }).length;
    return { title: 'Year ' + fy, short: fy, tag: closed ? 'Closed' : set['cash_actual_' + fy] ? 'Open' : 'Cash not entered', sub: [closed ? 'Closed' : 'Open', set['cash_actual_' + fy] ? 'actual cash ' + groupNum_(Number(set['cash_actual_' + fy])) : 'actual cash not entered', nOpen + ' opening balance' + (nOpen === 1 ? '' : 's')].join(' · ') };
  }
  if (k === 'heirs') {
    var H = heirsOf(D), okSum = Math.abs(sum_(H, function (h) { return h.share; }) - 1) <= 1e-9;
    return { title: 'Heirs and shares', short: 'Heirs', tag: H.length + ' heirs', sub: H.map(function (h) { return h.name + ' ' + h.shareText; }).join(', ') || 'None yet', bad: !okSum };
  }
  if (k === 'amounts') return { title: 'Amounts and roles', short: 'Amounts', tag: set.fixed_amount ? groupNum_(Number(set.fixed_amount)) : 'Not set', sub: (set.fixed_name || 'Fixed lease') + ' ' + (set.fixed_amount ? groupNum_(Number(set.fixed_amount)) : 'not set') + ' · custodian ' + (set.custodian || 'not set') };
  if (k === 'rates') {
    var last = D.tables.TBZ_RATES.slice().sort(function (a, b) { return a.from_month < b.from_month ? 1 : -1; })[0];
    return { title: (set.tbz_name || 'Monthly rent') + ' rates', short: 'Rent rates', tag: last ? groupNum_(Number(last.rent)) : 'None', sub: last ? groupNum_(Number(last.rent)) + ' from ' + fmtMonth(last.from_month) : 'No rate yet' };
  }
  if (k === 'lists') return { title: 'Lists', short: 'Lists', tag: 'Tags', sub: 'Sources, categories, banks and accounts' };
  return { title: 'This phone', short: 'This phone', tag: bioReady() ? 'Face ID' : 'PIN', sub: (bioReady() ? 'Face ID on' : 'PIN only') + ' · app ' + BUILD_ID };
}
SCREENS.settings = function () {
  var S = T.S, D = view(), cust = isCust(), set = settingsOf(D);
  if (T.setGroup) {
    var info = setGroupInfo(T.setGroup, D);
    return el('div', null,
      el('div', { class: 'top' },
        el('button', { class: 'back', type: 'button', id: 'setback', onclick: function () { T.setGroup = null; T.slide = true; render(); window.scrollTo(0, 0); } }, svg('back'), 'Settings'),
        el('div', { class: 'title small', text: info.title }), el('span')),
      el('p', { class: 'muted', id: 'grpsub', text: info.sub }),
      SET_PAGES[T.setGroup](D, set));
  }
  var refused = S.outbox.filter(function (o) { return o.error; }).concat(S.uploads.filter(function (u) { return u.error; }));
  return el('div', null, topBar('Settings'),
    refused.length ? el('div', { class: 'card', id: 'refused' }, el('b', { text: 'Not accepted by the workbook' }),
      refused.map(function (o) {
        var what = o.op ? (o.op === 'del' ? 'Delete ' + o.id : SCHEMA[o.tab].label + ' ' + (o.rec.amount ? fmtRs(Number(o.rec.amount)) : o.rec.value || o.rec.name || '')) : 'Photo';
        return el('div', { class: 'row' }, el('div', { class: 'grow' }, el('div', { text: what }), el('div', { class: 'sm', text: o.error })),
          el('div', null,
            o.op === 'save' && !o.gone ? btn('small', 'edit', 'Fix', function () {
              var r = Object.assign({}, o.rec, { key: o.req_id, id: o.rec.id || '' });
              if (!o.rec.id) { o.error = ''; } else { S.outbox = S.outbox.filter(function (x) { return x !== o; }); }
              T.prevScreen = 'settings'; openForm(o.tab, r.id ? r : Object.assign(r, { id: '' }));
            }) : null,
            btn('danger small', 'trash', 'Remove', function () { S.outbox = S.outbox.filter(function (x) { return x !== o; }); S.uploads = S.uploads.filter(function (x) { return x !== o; }); saveState().then(render); })));
      })) : null,
    cust ? null : el('div', { class: 'note', text: 'You can view the ledger and download the summary. Only ' + (set.custodian || 'the custodian') + ' can make entries.' }),
    el('div', { class: 'tiles three', id: 'setgroups' }, SET_GROUPS.filter(function (g) { return cust || !g.cust; }).map(function (g) {
      var info = setGroupInfo(g.k, D);
      return el('button', { class: 'tile' + (info.bad ? ' bad' : ''), type: 'button', id: 'grp-' + g.k, title: info.sub, onclick: function () { T.setGroup = g.k; T.slide = true; render(); window.scrollTo(0, 0); } },
        svg(g.icon), el('b', { text: info.short || info.title }), el('span', { text: info.bad ? 'Check' : info.tag || '' }));
    })));
};
var SET_PAGES = {
  year: function (D, set) {
    var fy = curFy(), closed = closedYears(D), isClosed = closed.indexOf(fy) >= 0;
    return [
      el('p', { class: 'muted', text: fyLabel(fy) + '. Change the year with the year button on the other screens.' }),
      el('div', { class: 'card' },
        el('label', { class: 'switch', for: 'closedsw' }, el('span', { text: 'Closed (no more changes)' }),
          el('input', { id: 'closedsw', type: 'checkbox', checked: isClosed, onchange: function (e) {
            var list = closed.filter(function (y) { return y !== fy; }); if (e.target.checked) list.push(fy);
            saveSetting('closed_years', list.sort().join(','), 'Years that cannot be changed (comma separated)').then(function () { render(); sync(true); });
          } })),
        el('p', { class: 'hint', text: 'A closed year can be viewed and downloaded but not changed. You can reopen it here.' })),
      el('h2', null, svg('cash'), 'Actual bank and cash'),
      el('div', { class: 'card list' }, el('button', { class: 'row', type: 'button', id: 'cashbtn2', onclick: openCashActual },
        el('div', { class: 'grow' }, el('div', { text: 'Total in bank and cash now' }), el('div', { class: 'sm', text: 'Compared with what should be in hand' })),
        el('div', { class: 'amt', text: set['cash_actual_' + fy] ? groupNum_(Number(set['cash_actual_' + fy])) : 'Not entered' }), el('span', { class: 'chev' }, svg('next')))),
      el('h2', null, svg('list'), 'Opening balances'),
      el('div', { class: 'card list', id: 'openings' }, D.tables.OPENING.filter(function (r) { return r.fy === fy; }).map(function (r) {
        return el('button', { class: 'row', type: 'button', onclick: function () { if (isClosed) return; T.prevScreen = 'settings'; openForm('OPENING', r); } },
          el('div', { class: 'grow' }, el('b', { text: r.item }), el('div', { class: 'sm', text: r.note || '' }), r.pending ? el('div', { class: 'pending', text: r.error ? 'Not accepted: ' + r.error : 'Waiting to send' }) : null),
          el('div', { class: amtCls(r.amount), text: groupNum_(r.amount) }));
      }).concat(D.tables.OPENING.some(function (r) { return r.fy === fy; }) ? [] : [el('p', { class: 'muted', text: 'None for ' + fy + '.' })])),
      isClosed ? null : btn('wide', 'plus', 'Add opening balance', function () { T.prevScreen = 'settings'; openForm('OPENING', null, { fy: fy }); T.form.f.fy = fy; }, 'addopening')
    ];
  },
  heirs: function (D) {
    var bad = Math.abs(sum_(heirsOf(D), function (h) { return h.share; }) - 1) > 1e-9;
    return [
      bad ? el('div', { class: 'err', text: 'Shares do not add up to 1.' }) : null,
      el('div', { class: 'card list', id: 'heirlist' }, D.tables.HEIRS.map(function (h) {
        return el('button', { class: 'row', type: 'button', 'data-heir': h.name, onclick: function () {
          editSheet('Share of ' + h.name, [{ k: 'share', label: 'Inheritance share', value: h.share, hint: 'Like 1/3. All shares must add up to 1.' }, { k: 'qurbani', label: 'Qurbani share (of 7)', num: true, value: h.qurbani }, { k: 'note', label: 'Role or note', value: h.note }],
            function (v) { return upsert('HEIRS', { name: h.name, share: v.share, qurbani: v.qurbani, note: v.note }, h); });
        } }, el('div', { class: 'grow' }, el('b', { text: h.name }), el('div', { class: 'sm', text: (h.note || '').slice(0, 80) })),
          el('div', { class: 'amt', text: h.share + (Number(h.qurbani) ? ' · Q ' + h.qurbani + '/7' : '') }), el('span', { class: 'chev' }, svg('next')));
      })),
      set_basis(D)
    ];
  },
  amounts: function (D, set) {
    return [el('div', { class: 'card list' }, [['fixed_amount', (set.fixed_name || 'Fixed lease') + ', fixed yearly amount', true], ['custodian', 'Custodian (collects and pays)'], ['tbz_collector', (set.tbz_name || 'Monthly rent') + ' collected and kept by']].map(function (x) {
      var cur = settingRow(D, x[0]);
      return el('button', { class: 'row', type: 'button', id: 'set-' + x[0], onclick: function () {
        editSheet(x[1], [{ k: 'v', label: x[1], num: x[2], value: cur ? cur.value : '' }], function (v) {
          if (x[2] && !/^\d+$/.test(v.v)) return 'Whole rupees only.';
          if (!x[2] && heirsOf(view()).map(function (h) { return h.name; }).indexOf(v.v) < 0) return 'Use one of the heirs\' names.';
          saveSetting(x[0], v.v); return '';
        });
      } }, el('div', { class: 'grow', text: x[1] }), el('div', { class: 'amt', text: cur ? (x[2] ? groupNum_(cur.value) : cur.value) : '' }), el('span', { class: 'chev' }, svg('next')));
    }))];
  },
  rates: function (D, set) {
    return [
      el('p', { class: 'muted', text: 'Each month counts as received at the rate in force that month. Add a line when the rent changes.' }),
      el('div', { class: 'card list', id: 'rates' }, D.tables.TBZ_RATES.slice().sort(function (a, b) { return a.from_month < b.from_month ? 1 : -1; }).map(function (r) {
        return el('div', { class: 'row' }, el('div', { class: 'grow' }, el('b', { text: 'From ' + fmtMonth(r.from_month) }), el('div', { class: 'sm', text: r.note || '' })), el('div', { class: 'amt', text: groupNum_(r.rent) }));
      })),
      btn('wide', 'plus', 'Add a new rate', function () {
        editSheet('New ' + (set.tbz_name || 'rent') + ' rate', [{ k: 'm', label: 'From month', type: 'month', value: todayPk().slice(0, 7) }, { k: 'rent', label: 'Monthly rent (Rs)', num: true }, { k: 'note', label: 'Note' }],
          function (v) { return upsert('TBZ_RATES', { from_month: v.m, rent: v.rent.replace(/[^\d]/g, ''), note: v.note }, null); });
      }, 'addrate')
    ];
  },
  lists: function (D) {
    return [el('p', { class: 'muted', text: 'Dark = offered as a tag. Tap one to stop or start offering it.' }),
      el('div', { id: 'lists' }, LIST_NAMES.map(function (n) {
        var label = { SOURCES: 'Income sources', CATEGORIES: 'Outflow categories', PAYMENT_TYPES: 'Payment types', TAKEN_FROM: 'Taken from (suggestions)', MODES: 'Banks and accounts' }[n];
        var rows = D.tables.LISTS.filter(function (r) { return r.list === n; });
        return el('div', { class: 'card' }, el('b', { text: label }), el('div', { class: 'chips listchips' }, rows.map(function (r) {
          return el('button', { type: 'button', class: String(r.active) === 'N' ? '' : 'on', 'data-v': r.value, onclick: function () {
            if (n === 'PAYMENT_TYPES') { toast('Payment types are fixed, because they decide what counts as cash.'); return; }
            upsert('LISTS', { list: n, value: r.value, active: String(r.active) === 'N' ? 'Y' : 'N', sort: r.sort }, r); saveState().then(function () { render(); sync(true); });
          } }, r.value);
        }), n === 'PAYMENT_TYPES' ? null : el('button', { type: 'button', 'data-add': n, onclick: function () {
          editSheet('Add to ' + label.toLowerCase(), [{ k: 'v', label: 'New value' }], function (v) {
            if (rows.some(function (r) { return r.value.toLowerCase() === v.v.toLowerCase(); })) return 'Already on the list.';
            return upsert('LISTS', { list: n, value: v.v, active: 'Y', sort: rows.length + 1 }, null);
          });
        } }, '+ Add')));
      }))];
  },
  phone: function () {
    var S = T.S, cust = isCust();
    return [
      bioCard(),
      el('div', { class: 'card' },
        el('div', { class: 'kv' }, el('div', { text: 'Signed in as' }), el('div', { text: (S.name || '') + (cust ? ' (custodian)' : ' (view only)') }),
          el('div', { text: 'App version' }), el('div', { text: BUILD_ID }),
          el('div', { text: 'Workbook script' }), el('div', { text: S.data && S.data.version || '' })),
        btn('wide', 'update', 'Update app', updateApp, 'updapp')),
      btn('danger wide', 'trash', 'Reset this phone', function () {
        var w = S.outbox.length + S.uploads.length;
        if (prompt('Type RESET to remove the ledger from this phone.' + (w ? ' ' + w + ' unsent item(s) will be lost.' : '')) === 'RESET') resetPhone();
      }, 'reset')
    ];
  }
};
function set_basis(D) { var b = settingsOf(D).basis; return b ? el('p', { class: 'hint', text: 'Basis: ' + b }) : null; }

// ---------- Face ID: the PIN is kept wrapped by a key only Face ID can release (WebAuthn PRF) ----------
function bioReady() { return !!localStorage.getItem(BIO) && !!window.PublicKeyCredential; }
function prfSalt() { return new TextEncoder().encode('Rental Inheritance unlock key, version 1'); }
function prfAesKey(out) {
  return crypto.subtle.importKey('raw', out, 'HKDF', false, ['deriveKey']).then(function (k) {
    return crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(16), info: new TextEncoder().encode('pin-wrap') }, k, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  });
}
function bioGet(id) {
  return navigator.credentials.get({ publicKey: { challenge: crypto.getRandomValues(new Uint8Array(32)), rpId: location.hostname,
    allowCredentials: [{ type: 'public-key', id: unb64(id) }], userVerification: 'required', timeout: 60000, extensions: { prf: { eval: { first: prfSalt() } } } } }).then(function (a) {
    var r = a && a.getClientExtensionResults().prf;
    if (!r || !r.results || !r.results.first) throw new Error('noprf');
    return r.results.first;
  });
}
function bioEnable(pin) {
  if (T.bioBusy) return Promise.reject(new Error('busy'));
  T.bioBusy = true;
  return navigator.credentials.create({ publicKey: { rp: { name: 'Rental Inheritance', id: location.hostname },
    user: { id: crypto.getRandomValues(new Uint8Array(16)), name: 'Rental Inheritance', displayName: 'Rental Inheritance' },
    challenge: crypto.getRandomValues(new Uint8Array(32)), timeout: 60000, pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
    authenticatorSelection: { authenticatorAttachment: 'platform', residentKey: 'preferred', userVerification: 'required' },
    extensions: { prf: { eval: { first: prfSalt() } } } } }).then(function (cred) {
    var ext = cred.getClientExtensionResults().prf || {}, id = b64(cred.rawId);
    if (ext.enabled === false) throw new Error('noprf');
    var first = ext.results && ext.results.first;
    return (first ? Promise.resolve(first) : bioGet(id)).then(prfAesKey).then(function (key) {
      var iv = crypto.getRandomValues(new Uint8Array(12));
      return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, new TextEncoder().encode(pin)).then(function (ct) {
        localStorage.setItem(BIO, JSON.stringify({ id: id, iv: b64(iv), ct: b64(ct) }));
      });
    });
  }).finally(function () { T.bioBusy = false; });
}
function bioUnlock() {
  if (T.bioBusy) return Promise.reject(new Error('busy'));
  T.bioBusy = true;
  var b = JSON.parse(localStorage.getItem(BIO));
  return bioGet(b.id).then(prfAesKey).then(function (key) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(b.iv) }, key, unb64(b.ct)); })
    .then(function (pt) { return unlock(new TextDecoder().decode(pt)); })
    .catch(function (e) { if (e && e.name === 'NotAllowedError') throw new Error('cancel'); throw e; })
    .finally(function () { T.bioBusy = false; });
}
function bioCard() {
  if (!window.PublicKeyCredential) return null;
  var on = bioReady(), pin;
  return el('div', { class: 'card', id: 'biocard' },
    el('div', { class: 'row' }, el('b', { text: 'Unlock with Face ID' }), el('span', { class: 'chip ' + (on ? 'ok' : 'wait'), text: on ? 'On' : 'Off' })),
    on ? btn('wide', 'x', 'Turn off Face ID', function () { localStorage.removeItem(BIO); render(); toast('Face ID unlock turned off.'); }, 'biooff')
      : el('div', null, el('label', { class: 'f', for: 'biopin', text: 'Type your PIN to turn it on' }),
        pin = el('input', { id: 'biopin', class: 'pin', type: 'password', inputmode: 'numeric', maxlength: '6', autocomplete: 'off' }),
        btn('primary wide', 'faceid', 'Turn on Face ID', function () {
          var v = pin.value, st = stored();
          deriveKey(v, unb64(st.salt)).then(function (k) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(st.iv) }, k, unb64(st.ct)); })
            .then(function () { return bioEnable(v); }).then(function () { render(); toast('Face ID unlock is on. Your PIN still works too.', true); })
            .catch(function (e) { toast(e && e.message === 'noprf' ? 'This phone cannot do Face ID unlock for web apps. Keep using the PIN.' : e && e.name === 'OperationError' ? 'Wrong PIN.' : 'Face ID was not set up.'); });
        }, 'bioon')),
    el('p', { class: 'hint', text: 'Needs iOS 18 or newer. The PIN always works as a backup.' }));
}
function updateApp() {
  if (!('serviceWorker' in navigator)) return toast('Updates need the Home Screen app.');
  navigator.serviceWorker.getRegistration().then(function (reg) {
    if (reg && reg.waiting) { reg.waiting.postMessage('skip'); return; }
    return fetch('sw.js', { cache: 'no-store' }).then(function (r) { return r.text(); }).then(function (t) {
      if (t.indexOf(BUILD_ID) >= 0) toast('Already the newest version.');
      else if (reg) reg.update().then(function () { toast('Downloading the new version. Close and reopen the app.'); });
    });
  }).catch(function () { toast('Could not check for updates.'); });
}

// ---------- start ----------
function touch() { T.idleAt = Date.now(); }
['pointerdown', 'keydown'].forEach(function (ev) { document.addEventListener(ev, touch, true); });
var _go = go;
go = function (s) { if ((s === 'form' || s === 'qurbani') && T.screen !== 'form' && T.screen !== 'qurbani') T.prevScreen = T.screen; return _go(s); };
setInterval(function () { if (T.key && Date.now() - T.idleAt > IDLE_MS) lock(); }, 15000);
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'visible') { if (T.key && Date.now() - T.idleAt > IDLE_MS) lock(); else if (T.S) sync(true); }
});
window.addEventListener('online', function () { if (T.S) sync(true); });
window.addEventListener('offline', function () { if (T.S) renderTop(); });
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(function () { });
  navigator.serviceWorker.addEventListener('controllerchange', function () { if (!T.key || T.screen === 'unlock') location.reload(); });
}
(function boot() {
  var st = stored();
  if (st && !st.ct) { localStorage.removeItem(STORE); st = null; }
  T.screen = st ? 'unlock' : 'join';
  render();
})();
