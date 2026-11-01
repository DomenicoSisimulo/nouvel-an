/**
 * Nouvel An Chișinău–Bucarest : le script du groupe.
 *
 * Il relie l'app de chacun à ton Google Drive :
 *  - les photos envoyées depuis l'app sont rangées par lieu dans le dossier
 *    « Nouvel An 2026 – photos du groupe » de ton Drive ;
 *  - les défis cochés par chacun sont gardés ici, pour que tout le monde voie qui a fait quoi.
 *
 * Le script ne touche qu'à ce dossier, qu'il crée lui-même. L'app n'y accède qu'avec le code
 * du groupe, que contient le lien d'invitation : ne le partage qu'avec les membres du groupe.
 *
 * Installation (une fois) : colle ce fichier dans un nouveau projet sur script.google.com, puis
 * Déployer → Nouveau déploiement → Application Web, « Exécuter en tant que : moi »,
 * « Qui a accès : Tout le monde ». Le README du dépôt détaille chaque étape.
 */

var FOLDER_NAME = 'Nouvel An 2026 – photos du groupe';
var MAX_MEMBERS = 8;
// tailles en caractères base64 : une photo de 1920 px pèse environ 0,6 Mo, sa miniature 40 Ko
var MAX_FULL = 6000000;
var MAX_THUMB = 400000;
var PENDING_MS = 5 * 60 * 1000;

function doGet() {
  return ContentService.createTextOutput('Le script du groupe Nouvel An fonctionne. Colle son adresse dans l’app : Défis, puis Créer le groupe.');
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e && e.postData && e.postData.contents || '');
  } catch (err) {
    return reply({ error: 'bad_request' });
  }
  try {
    return reply(handle(body || {}));
  } catch (err) {
    if (err && err.code) return reply({ error: err.code });
    return reply({ error: 'server', detail: String(err && err.message || err).slice(0, 200) });
  }
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function fail(code) {
  return { code: code };
}

function handle(b) {
  var P = PropertiesService.getScriptProperties();
  if (b.op === 'init') return init(P, b);
  var code = P.getProperty('code');
  if (!code || typeof b.code !== 'string' || b.code !== code) throw fail('forbidden');
  switch (b.op) {
    case 'state': return state(P);
    case 'join': return withLock(function () { return join(P, b); });
    case 'tick': return withLock(function () { return tick(P, b); });
    case 'upload': return upload(P, b);
    case 'thumbs': return thumbs(P, b);
    case 'photo': return photo(P, b);
    case 'delete': return withLock(function () { return remove(P, b); });
    default: throw fail('bad_request');
  }
}

function withLock(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) throw fail('busy');
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function readJson(s, fallback) {
  if (!s) return fallback;
  try { return JSON.parse(s); } catch (e) { return fallback; }
}

function text(v, max) {
  return typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '';
}

function members(P) {
  return readJson(P.getProperty('members'), []);
}

function memberOf(P, id) {
  var list = members(P);
  for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
  throw fail('no_member');
}

// ------------------------------------------------------------------ créer le groupe : le premier appel crée le code et le dossier
function init(P, b) {
  return withLock(function () {
    var code = P.getProperty('code');
    if (code) {
      if (b.code === code) return { ok: true, code: code, folderUrl: folderUrl(P) };
      throw fail('already');
    }
    code = Utilities.getUuid().replace(/-/g, '').slice(0, 20);
    var root = DriveApp.createFolder(FOLDER_NAME);
    var small = root.createFolder('miniatures');
    P.setProperties({ code: code, folder: root.getId(), thumbs: small.getId(), members: '[]' });
    return { ok: true, code: code, folderUrl: root.getUrl() };
  });
}

function folderUrl(P) {
  var id = P.getProperty('folder');
  return id ? 'https://drive.google.com/drive/folders/' + id : '';
}

// ------------------------------------------------------------------ tout ce que l'app affiche : les membres, leurs défis, les photos
function state(P) {
  var all = P.getProperties();
  var ticks = {};
  var photos = [];
  for (var k in all) {
    if (k.indexOf('t:') === 0) ticks[k.slice(2)] = readJson(all[k], {});
    else if (k.indexOf('p:') === 0) {
      var rec = readJson(all[k], null);
      if (rec) photos.push(rec);
    }
  }
  photos.sort(function (a, b) { return a.at < b.at ? -1 : a.at > b.at ? 1 : 0; });
  return { members: readJson(all.members, []), ticks: ticks, photos: photos, folderUrl: folderUrl(P), now: new Date().toISOString() };
}

// ------------------------------------------------------------------ un membre : son prénom, une seule fois par prénom
function join(P, b) {
  var name = text(b.name, 24);
  if (!name) throw fail('bad_request');
  var list = members(P);
  for (var i = 0; i < list.length; i++) {
    if (list[i].name.toLowerCase() === name.toLowerCase()) return { member: list[i], members: list };
  }
  if (list.length >= MAX_MEMBERS) throw fail('full');
  var m = { id: 'm' + Utilities.getUuid().replace(/-/g, '').slice(0, 10), name: name, at: new Date().toISOString() };
  list.push(m);
  P.setProperty('members', JSON.stringify(list));
  return { member: m, members: list };
}

// ------------------------------------------------------------------ les défis : chacun coche les siens, plusieurs d'un coup après un passage hors ligne
function tick(P, b) {
  memberOf(P, b.member);
  var key = 't:' + b.member;
  var t = readJson(P.getProperty(key), {});
  var items = Array.isArray(b.items) ? b.items.slice(0, 200) : [];
  for (var i = 0; i < items.length; i++) {
    var it = items[i] || {};
    if (typeof it.item !== 'string' || !/^[gr]-[a-z0-9-]{1,40}$/.test(it.item)) continue;
    if (it.done) t[it.item] = text(it.at, 30) || new Date().toISOString();
    else delete t[it.item];
  }
  P.setProperty(key, JSON.stringify(t));
  return { ok: true, ticks: t };
}

// ------------------------------------------------------------------ les photos : la photo dans le dossier du lieu, sa miniature à part
function upload(P, b) {
  var who = memberOf(P, b.member);
  if (typeof b.full !== 'string' || typeof b.thumb !== 'string' || !b.full || !b.thumb) throw fail('bad_request');
  if (b.full.length > MAX_FULL || b.thumb.length > MAX_THUMB) throw fail('too_large');
  var place = typeof b.place === 'string' && /^[a-z0-9][a-z0-9-]{0,30}$/.test(b.place) ? b.place : '';
  if (!place) throw fail('bad_request');
  var day = typeof b.day === 'string' && /^j[1-9]$/.test(b.day) ? b.day : '';
  var cid = typeof b.cid === 'string' && /^[A-Za-z0-9_-]{6,40}$/.test(b.cid) ? b.cid : '';
  // un envoi répété (réseau coupé avant la réponse) ne crée pas la photo deux fois
  var prior = withLock(function () {
    if (!cid) return null;
    var v = P.getProperty('c:' + cid);
    if (v && v.indexOf('en-cours:') === 0) {
      if (Date.now() - Number(v.slice(9)) < PENDING_MS) return { busy: true };
      v = null;
    }
    if (v) return { id: v };
    P.setProperty('c:' + cid, 'en-cours:' + Date.now());
    return null;
  });
  if (prior && prior.busy) throw fail('busy');
  if (prior && prior.id) return { photo: readJson(P.getProperty('p:' + prior.id), null) };
  var full = null;
  var small = null;
  try {
    var label = text(b.pn, 40).replace(/[\/\\:*?"<>|]/g, '') || place;
    var stamp = Utilities.formatDate(new Date(), 'Europe/Paris', 'yyyy-MM-dd HH.mm.ss');
    var name = label + ' – ' + stamp + ' – ' + who.name.replace(/[\/\\:*?"<>|]/g, '') + '.jpg';
    full = placeFolder(P, place, label).createFile(Utilities.newBlob(Utilities.base64Decode(b.full), 'image/jpeg', name));
    small = DriveApp.getFolderById(P.getProperty('thumbs')).createFile(Utilities.newBlob(Utilities.base64Decode(b.thumb), 'image/jpeg', name));
  } catch (err) {
    try { if (full) full.setTrashed(true); } catch (e2) { /* rien à défaire */ }
    if (cid) withLock(function () { P.deleteProperty('c:' + cid); });
    throw err;
  }
  var rec = {
    id: full.getId(), t: small.getId(), p: place, d: day, b: who.id,
    at: text(b.at, 30) || new Date().toISOString(),
    w: typeof b.w === 'number' && b.w > 0 && b.w < 20000 ? Math.round(b.w) : 0,
    h: typeof b.h === 'number' && b.h > 0 && b.h < 20000 ? Math.round(b.h) : 0
  };
  withLock(function () {
    P.setProperty('p:' + rec.id, JSON.stringify(rec));
    if (cid) P.setProperty('c:' + cid, rec.id);
  });
  return { photo: rec };
}

function placeFolder(P, place, label) {
  var key = 'f:' + place;
  var id = P.getProperty(key);
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (e) { /* dossier supprimé : on le recrée */ }
  }
  return withLock(function () {
    var again = P.getProperty(key);
    if (again && again !== id) {
      try { return DriveApp.getFolderById(again); } catch (e) { /* idem */ }
    }
    var f = DriveApp.getFolderById(P.getProperty('folder')).createFolder(label);
    P.setProperty(key, f.getId());
    return f;
  });
}

function thumbs(P, b) {
  var ids = Array.isArray(b.ids) ? b.ids.slice(0, 16) : [];
  var out = {};
  for (var i = 0; i < ids.length; i++) {
    if (typeof ids[i] !== 'string') continue;
    var rec = readJson(P.getProperty('p:' + ids[i]), null);
    if (!rec) continue;
    try { out[rec.id] = Utilities.base64Encode(DriveApp.getFileById(rec.t).getBlob().getBytes()); } catch (e) { /* miniature introuvable */ }
  }
  return { thumbs: out };
}

function photo(P, b) {
  var rec = typeof b.id === 'string' ? readJson(P.getProperty('p:' + b.id), null) : null;
  if (!rec) throw fail('gone');
  return { id: rec.id, data: Utilities.base64Encode(DriveApp.getFileById(rec.id).getBlob().getBytes()) };
}

// ------------------------------------------------------------------ supprimer : seulement ses propres photos, qui vont dans la corbeille du Drive
function remove(P, b) {
  var rec = typeof b.id === 'string' ? readJson(P.getProperty('p:' + b.id), null) : null;
  if (!rec) return { ok: true };
  if (rec.b !== b.member) throw fail('not_uploader');
  try { DriveApp.getFileById(rec.id).setTrashed(true); } catch (e) { /* déjà supprimée dans le Drive */ }
  try { DriveApp.getFileById(rec.t).setTrashed(true); } catch (e) { /* idem */ }
  P.deleteProperty('p:' + rec.id);
  return { ok: true };
}
