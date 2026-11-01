/**
 * Nouvel An Chișinău–Bucarest : le script du groupe.
 *
 * Il relie l'app de chacun à ton Google Drive :
 *  - les photos et les vidéos envoyées depuis l'app, en taille originale (1 Go par photo, 5 Go par vidéo
 *    au plus), sont rangées par lieu dans le dossier « Nouvel An 2026 – photos du groupe » de ton Drive ;
 *  - les défis cochés par chacun sont gardés ici, pour que tout le monde voie qui a fait quoi ;
 *  - la position de ceux qui choisissent de la partager, une demi-heure au plus, effacée à l'arrêt ;
 *  - les réactions de chacun aux photos.
 * Personne d'autre que toi n'a besoin d'un compte Google : les originaux et les vidéos se regardent
 * dans l'app, qui les lit par morceaux à travers ce script.
 *
 * L'album (la liste des photos et vidéos, les réactions) est rangé dans deux fichiers du dossier
 * « données de l'app » : il tient des milliers de photos, et l'app ne recharge que ce qui a changé.
 *
 * Le script ne touche qu'à ce dossier, qu'il crée lui-même. L'app n'y accède qu'avec le code
 * du groupe, que contient le lien d'invitation : ne le partage qu'avec les membres du groupe.
 *
 * Installation (une fois) : colle ce fichier dans un nouveau projet sur script.google.com, puis
 * Déployer → Nouveau déploiement → Application Web, « Exécuter en tant que : moi »,
 * « Qui a accès : Tout le monde ». Le README du dépôt détaille chaque étape.
 *
 * Les gros fichiers arrivent en morceaux de 4 Mo, que le script transmet à Google Drive : il lui faut
 * donc deux autorisations, Google Drive et « Se connecter à un service externe ».
 */

var FOLDER_NAME = 'Nouvel An 2026 – photos du groupe';
var MAX_MEMBERS = 8;
// tailles en caractères base64 : une photo de 1920 px pèse environ 0,6 Mo, sa miniature 40 Ko
var MAX_FULL = 6000000;
var MAX_THUMB = 400000;
// l'aperçu montré dans l'app (2048 px) et la miniature, en caractères base64
var MAX_SMALL = 4000000;
var PENDING_MS = 5 * 60 * 1000;
// les originaux : 1 Go par photo, 5 Go par vidéo, envoyés en morceaux de 4 Mio (un multiple de 256 Kio, comme le veut Drive)
var MAX_PHOTO = 1024 * 1024 * 1024;
var MAX_VIDEO = 5 * 1024 * 1024 * 1024;
var CHUNK = 4 * 1024 * 1024;
var SESSION_DAYS = 6;
var UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,mimeType,size';
// positions partagées : 30 minutes au plus, arrondies à une dizaine de mètres
var POS_MAX_MS = 30 * 60 * 1000;
// les dernières modifications de l'album gardées pour les téléphones qui reviennent : au-delà, ils rechargent tout
var LOG_KEEP = 500;
var REACTIONS = ['❤️', '😂', '😮', '🔥', '👏'];
var DEFI = /^[gr]-[a-z0-9-]{1,40}$/;

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
  if (!P.getProperty('albumFile')) migrate(P);
  switch (b.op) {
    case 'state': return state(P, b);
    case 'join': return withLock(function () { return join(P, b); });
    case 'tick': return withLock(function () { return tick(P, b); });
    case 'upload': return upload(P, b);
    case 'start': return start(P, b);
    case 'chunk': return chunk(P, b);
    case 'part': return part(P, b);
    case 'pos': return position(P, b);
    case 'thumbs': return thumbs(P, b);
    case 'photo': return photo(P, b);
    case 'delete': return remove(P, b);
    case 'react': return react(P, b);
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
// since : le numéro de la dernière modification de l'album que le téléphone connaît. S'il est à jour, rien de
// l'album ne part ; s'il est un peu en retard, seulement les modifications depuis ; sinon (première visite,
// longue absence, app d'avant cette version), l'album entier.
function state(P, b) {
  var all = P.getProperties();
  var ticks = {};
  for (var k in all) if (k.indexOf('t:') === 0) ticks[k.slice(2)] = readJson(all[k], {});
  var where = {};
  var now = Date.now();
  for (var key in all) {
    if (key.indexOf('l:') !== 0) continue;
    var pos = readJson(all[key], null);
    if (pos && pos.until > now) where[key.slice(2)] = pos;
  }
  var rev = Number(all.rev || 0);
  var out = { members: readJson(all.members, []), ticks: ticks, positions: where, folderUrl: folderUrl(P), space: space(), now: new Date().toISOString(), rev: rev };
  var since = b && typeof b.since === 'number' && b.since >= 0 ? Math.floor(b.since) : -1;
  if (since === rev) {
    out.changes = [];
    return out;
  }
  if (since > 0 && since < rev) {
    var log = readData(P, 'logFile', null);
    if (log && log.ev && log.ev.length && log.ev[0].r <= since + 1) {
      out.changes = log.ev.filter(function (e) { return e.r > since; });
      out.rev = log.ev[log.ev.length - 1].r;
      return out;
    }
  }
  var album = readData(P, 'albumFile', null) || emptyAlbum();
  var photos = [];
  for (var id in album.photos) photos.push(album.photos[id]);
  photos.sort(function (a, c) { return a.at < c.at ? -1 : a.at > c.at ? 1 : 0; });
  out.full = true;
  out.rev = album.rev;
  out.photos = photos;
  out.reacts = album.reacts;
  return out;
}

// la place du Drive, relue toutes les dix minutes
function space() {
  var cache = null;
  try { cache = CacheService.getScriptCache(); } catch (e) { /* pas de cache */ }
  var hit = cache && cache.get('space');
  if (hit) return readJson(hit, null);
  var s = null;
  try { s = { used: DriveApp.getStorageUsed(), limit: DriveApp.getStorageLimit() }; } catch (e) { /* espace inconnu */ }
  if (s && cache) cache.put('space', JSON.stringify(s), 600);
  return s;
}

// ------------------------------------------------------------------ l'album, dans le Drive : album.json (tout), journal.json (les dernières modifications)
function emptyAlbum() {
  return { rev: 0, photos: {}, reacts: {}, cids: {} };
}

function readData(P, key, fallback) {
  var id = P.getProperty(key);
  if (!id) return fallback;
  try {
    return readJson(DriveApp.getFileById(id).getBlob().getDataAsString('UTF-8'), fallback);
  } catch (e) {
    return fallback;
  }
}

function writeData(P, key, name, obj) {
  var content = JSON.stringify(obj);
  var id = P.getProperty(key);
  if (id) {
    try {
      DriveApp.getFileById(id).setContent(content);
      return;
    } catch (e) { /* fichier supprimé : recréé */ }
  }
  var dir = null;
  var did = P.getProperty('dataFolder');
  if (did) { try { dir = DriveApp.getFolderById(did); } catch (e) { dir = null; } }
  if (!dir) {
    dir = DriveApp.getFolderById(P.getProperty('folder')).createFolder('données de l’app (ne pas modifier)');
    P.setProperty('dataFolder', dir.getId());
  }
  P.setProperty(key, dir.createFile(name, content, 'application/json').getId());
}

function loadAlbum(P) {
  var a = readData(P, 'albumFile', null) || emptyAlbum();
  if (!a.photos) a.photos = {};
  if (!a.reacts) a.reacts = {};
  if (!a.cids) a.cids = {};
  return a;
}

// une modification de l'album, l'une après l'autre : fn change l'album et rend ce qui a changé, numéroté ici
function change(P, fn) {
  return withLock(function () {
    var album = loadAlbum(P);
    var log = readData(P, 'logFile', null) || { ev: [] };
    if (!log.ev) log.ev = [];
    var ev = fn(album);
    if (!ev) return null;
    var list = Array.isArray(ev) ? ev : [ev];
    for (var i = 0; i < list.length; i++) {
      album.rev++;
      list[i].r = album.rev;
      log.ev.push(list[i]);
    }
    if (log.ev.length > LOG_KEEP) log.ev = log.ev.slice(log.ev.length - LOG_KEEP);
    writeData(P, 'albumFile', 'album.json', album);
    writeData(P, 'logFile', 'journal.json', log);
    P.setProperty('rev', String(album.rev));
    return list;
  });
}

// la première fois avec cette version : les photos rangées jusqu'ici dans les propriétés du script passent dans le Drive
function migrate(P) {
  withLock(function () {
    if (P.getProperty('albumFile')) return;
    var album = emptyAlbum();
    var all = P.getProperties();
    var old = [];
    for (var k in all) {
      if (k.indexOf('p:') === 0) {
        var rec = readJson(all[k], null);
        if (rec && rec.id) album.photos[rec.id] = rec;
        old.push(k);
      } else if (k.indexOf('c:') === 0 && all[k].indexOf('en-cours:') !== 0) {
        album.cids[k.slice(2)] = all[k];
        old.push(k);
      }
    }
    album.rev = 1;
    writeData(P, 'albumFile', 'album.json', album);
    writeData(P, 'logFile', 'journal.json', { ev: [] });
    P.setProperty('rev', '1');
    for (var i = 0; i < old.length; i++) P.deleteProperty(old[i]);
  });
}

function photoOf(P, id) {
  if (typeof id !== 'string') return null;
  return loadAlbum(P).photos[id] || null;
}

// un fichier rangé par le script : un original dans le dossier d'un lieu (where 'places'), une miniature ou
// un aperçu dans celui des miniatures ('thumbs'), l'un ou l'autre ('any') ; rien d'autre du Drive
function albumFile(P, id, where) {
  if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{10,80}$/.test(id)) return null;
  var f;
  try { f = DriveApp.getFileById(id); } catch (e) { return null; }
  if (f.isTrashed()) return null;
  var ok = {};
  if (where !== 'places') ok[P.getProperty('thumbs')] = true;
  if (where !== 'thumbs') {
    var all = P.getProperties();
    for (var k in all) if (k.indexOf('f:') === 0) ok[all[k]] = true;
  }
  var parents = f.getParents();
  while (parents.hasNext()) if (ok[parents.next().getId()]) return f;
  return null;
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
    var known = loadAlbum(P).cids[cid];
    if (known) return { id: known };
    var v = P.getProperty('c:' + cid);
    if (v && v.indexOf('en-cours:') === 0) {
      if (Date.now() - Number(v.slice(9)) < PENDING_MS) return { busy: true };
      v = null;
    }
    P.setProperty('c:' + cid, 'en-cours:' + Date.now());
    return null;
  });
  if (prior && prior.busy) throw fail('busy');
  if (prior && prior.id) return { photo: photoOf(P, prior.id) };
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
  change(P, function (album) {
    album.photos[rec.id] = rec;
    if (cid) album.cids[cid] = rec.id;
    return { a: 'add', rec: rec };
  });
  if (cid) P.deleteProperty('c:' + cid);
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
  var out = {};
  if (Array.isArray(b.items)) {
    var items = b.items.slice(0, 16);
    for (var i = 0; i < items.length; i++) {
      var it = items[i] || {};
      var f = albumFile(P, it.t, 'thumbs');
      if (f && typeof it.id === 'string') out[it.id] = Utilities.base64Encode(f.getBlob().getBytes());
    }
    return { thumbs: out };
  }
  var ids = Array.isArray(b.ids) ? b.ids.slice(0, 16) : [];
  var album = ids.length ? loadAlbum(P) : null;
  for (var j = 0; j < ids.length; j++) {
    var rec = typeof ids[j] === 'string' ? album.photos[ids[j]] : null;
    if (!rec) continue;
    try { out[rec.id] = Utilities.base64Encode(DriveApp.getFileById(rec.t).getBlob().getBytes()); } catch (e) { /* miniature introuvable */ }
  }
  return { thumbs: out };
}

// ce que l'app affiche en grand : l'aperçu, ou la photo elle-même pour celles envoyées avant les originaux
function photo(P, b) {
  if (typeof b.f === 'string') {
    var g = albumFile(P, b.f, 'any');
    if (!g) throw fail('gone');
    if (g.getSize() > 25 * 1024 * 1024) throw fail('too_large');
    return { id: b.id, data: Utilities.base64Encode(g.getBlob().getBytes()) };
  }
  var rec = photoOf(P, b.id);
  if (!rec) throw fail('gone');
  var id = rec.v || (rec.k === 'video' ? rec.t : rec.id);
  var f = DriveApp.getFileById(id);
  if (!rec.v && f.getSize() > 25 * 1024 * 1024) throw fail('too_large');
  return { id: rec.id, data: Utilities.base64Encode(f.getBlob().getBytes()) };
}

// ------------------------------------------------------------------ supprimer : seulement ses propres photos, qui vont dans la corbeille du Drive
function remove(P, b) {
  var gone = null;
  change(P, function (album) {
    var rec = typeof b.id === 'string' ? album.photos[b.id] : null;
    if (!rec) return null;
    if (rec.b !== b.member) throw fail('not_uploader');
    delete album.photos[rec.id];
    delete album.reacts[rec.id];
    gone = rec;
    return { a: 'del', id: rec.id };
  });
  if (gone) trashAll([gone.id, gone.t, gone.v]);
  return { ok: true };
}

// ------------------------------------------------------------------ réagir à une photo : un emoji par personne et par photo, ou plus rien
function react(P, b) {
  memberOf(P, b.member);
  var e = typeof b.e === 'string' ? b.e : '';
  if (e && REACTIONS.indexOf(e) < 0) throw fail('bad_request');
  var done = change(P, function (album) {
    if (typeof b.id !== 'string' || !album.photos[b.id]) throw fail('gone');
    var r = album.reacts[b.id] || {};
    var at = new Date().toISOString();
    if (e) r[b.member] = { e: e, at: at };
    else if (r[b.member]) delete r[b.member];
    else return null;
    if (Object.keys(r).length) album.reacts[b.id] = r;
    else delete album.reacts[b.id];
    return { a: 'react', id: b.id, m: b.member, e: e, at: at };
  });
  return { ok: true, rev: done ? done[0].r : null };
}

// ------------------------------------------------------------------ les originaux, photos et vidéos : un envoi en plusieurs morceaux
// start : la miniature et l'aperçu tout de suite, puis une session d'envoi ouverte chez Google Drive (gardée dans u:<cid>)
// chunk : chaque morceau, transmis à Drive ; au dernier, Drive renvoie le fichier et la photo entre dans l'album
function start(P, b) {
  var who = memberOf(P, b.member);
  var cid = typeof b.cid === 'string' && /^[A-Za-z0-9_-]{6,40}$/.test(b.cid) ? b.cid : '';
  if (!cid) throw fail('bad_request');
  var st = readJson(P.getProperty('u:' + cid), null);
  if (st) return { received: st.r, chunk: CHUNK };
  var album = loadAlbum(P);
  var done = album.cids[cid];
  if (done) return { photo: album.photos[done] || null };
  if (b.probe) return { need: 'start', chunk: CHUNK };
  dropOldSessions(P);
  var kind = b.kind === 'video' ? 'video' : 'photo';
  var size = typeof b.size === 'number' && isFinite(b.size) ? Math.floor(b.size) : 0;
  if (size <= 0) throw fail('bad_request');
  if (size > (kind === 'video' ? MAX_VIDEO : MAX_PHOTO)) throw fail('too_large');
  var place = typeof b.place === 'string' && /^[a-z0-9][a-z0-9-]{0,30}$/.test(b.place) ? b.place : '';
  if (!place) throw fail('bad_request');
  if (typeof b.thumb !== 'string' || !b.thumb || b.thumb.length > MAX_SMALL) throw fail('bad_request');
  if (b.preview && (typeof b.preview !== 'string' || b.preview.length > MAX_SMALL)) throw fail('bad_request');
  var mime = typeof b.mime === 'string' && /^(image|video)\/[A-Za-z0-9.+-]{1,40}$/.test(b.mime) ? b.mime : (kind === 'video' ? 'video/mp4' : 'image/jpeg');
  var ext = typeof b.ext === 'string' && /^[a-z0-9]{1,5}$/.test(b.ext) ? b.ext : (kind === 'video' ? 'mp4' : 'jpg');
  var label = text(b.pn, 40).replace(/[\/\\:*?"<>|]/g, '') || place;
  var stamp = Utilities.formatDate(new Date(), 'Europe/Paris', 'yyyy-MM-dd HH.mm.ss');
  var name = label + ' – ' + stamp + ' – ' + who.name.replace(/[\/\\:*?"<>|]/g, '');
  var small = DriveApp.getFolderById(P.getProperty('thumbs'));
  var t = small.createFile(Utilities.newBlob(Utilities.base64Decode(b.thumb), 'image/jpeg', name + ' (miniature).jpg')).getId();
  var v = b.preview ? small.createFile(Utilities.newBlob(Utilities.base64Decode(b.preview), 'image/jpeg', name + ' (aperçu).jpg')).getId() : '';
  var res = UrlFetchApp.fetch(UPLOAD_URL, {
    method: 'post',
    contentType: 'application/json; charset=UTF-8',
    payload: JSON.stringify({ name: name + '.' + ext, parents: [placeFolder(P, place, label).getId()], mimeType: mime }),
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken(), 'X-Upload-Content-Type': mime, 'X-Upload-Content-Length': String(size) },
    muteHttpExceptions: true
  });
  var loc = header(res, 'location');
  if (res.getResponseCode() !== 200 || !loc) {
    trashAll([t, v]);
    if (/storageQuotaExceeded|quotaExceeded/.test(res.getContentText())) throw fail('drive_full');
    throw fail('drive');
  }
  st = {
    s: loc, n: size, r: 0, k: kind, m: mime, p: place, b: who.id, t: t, v: v, c: Date.now(),
    d: typeof b.day === 'string' && /^j[1-9]$/.test(b.day) ? b.day : '',
    at: text(b.at, 30) || new Date().toISOString(),
    w: typeof b.w === 'number' && b.w > 0 && b.w < 100000 ? Math.round(b.w) : 0,
    h: typeof b.h === 'number' && b.h > 0 && b.h < 100000 ? Math.round(b.h) : 0,
    du: typeof b.dur === 'number' && b.dur > 0 && b.dur < 100000 ? Math.round(b.dur) : 0,
    df: typeof b.df === 'string' && DEFI.test(b.df) ? b.df : ''
  };
  P.setProperty('u:' + cid, JSON.stringify(st));
  return { received: 0, chunk: CHUNK };
}

function chunk(P, b) {
  var cid = typeof b.cid === 'string' && /^[A-Za-z0-9_-]{6,40}$/.test(b.cid) ? b.cid : '';
  if (!cid) throw fail('bad_request');
  var st = readJson(P.getProperty('u:' + cid), null);
  if (!st) {
    var album = loadAlbum(P);
    var done = album.cids[cid];
    if (done) return { photo: album.photos[done] || null };
    throw fail('expired');
  }
  if (st.b !== b.member) throw fail('no_member');
  // l'app reprend là où Drive en est
  if (b.offset !== st.r) return { received: st.r };
  if (typeof b.data !== 'string' || !b.data) throw fail('bad_request');
  var bytes = Utilities.base64Decode(b.data);
  var end = st.r + bytes.length - 1;
  if (end >= st.n || (end + 1 < st.n && bytes.length % (256 * 1024) !== 0)) throw fail('bad_request');
  var res = UrlFetchApp.fetch(st.s, {
    method: 'put',
    payload: Utilities.newBlob(bytes, st.m),
    headers: { 'Content-Range': 'bytes ' + st.r + '-' + end + '/' + st.n },
    muteHttpExceptions: true,
    followRedirects: false
  });
  return afterPut(P, cid, st, res);
}

// la réponse de Drive : 308, il en veut encore ; 200 ou 201, le fichier est complet ; sinon, on lui demande où il en est
function afterPut(P, cid, st, res) {
  var code = res.getResponseCode();
  if (code === 308) {
    st.r = rangeEnd(res) + 1;
    P.setProperty('u:' + cid, JSON.stringify(st));
    return { received: st.r };
  }
  if (code === 200 || code === 201) return finish(P, cid, st, readJson(res.getContentText(), {}));
  if (code === 404 || code === 410) {
    trashAll([st.t, st.v]);
    P.deleteProperty('u:' + cid);
    throw fail('expired');
  }
  if (code === 403 && /storageQuotaExceeded|quotaExceeded/.test(res.getContentText())) throw fail('drive_full');
  var q = UrlFetchApp.fetch(st.s, { method: 'put', headers: { 'Content-Range': 'bytes */' + st.n }, muteHttpExceptions: true, followRedirects: false });
  if (q.getResponseCode() === 308 || q.getResponseCode() === 200 || q.getResponseCode() === 201) return afterPut(P, cid, st, q);
  throw fail('drive');
}

function finish(P, cid, st, file) {
  if (!file || typeof file.id !== 'string') throw fail('drive');
  var rec = { id: file.id, t: st.t, v: st.v, k: st.k, p: st.p, d: st.d, b: st.b, at: st.at, w: st.w, h: st.h, s: st.n, m: st.m };
  if (st.du) rec.du = st.du;
  if (st.df) rec.df = st.df;
  change(P, function (album) {
    album.photos[rec.id] = rec;
    album.cids[cid] = rec.id;
    return { a: 'add', rec: rec };
  });
  P.deleteProperty('u:' + cid);
  return { photo: rec };
}

function header(res, name) {
  var h = res.getHeaders() || {};
  for (var k in h) if (k.toLowerCase() === name) return String(h[k]);
  return '';
}

function rangeEnd(res) {
  var m = /bytes=0-(\d+)/.exec(header(res, 'range'));
  return m ? Number(m[1]) : -1;
}

function trashAll(ids) {
  for (var i = 0; i < ids.length; i++) {
    if (!ids[i]) continue;
    try { DriveApp.getFileById(ids[i]).setTrashed(true); } catch (e) { /* déjà partie */ }
  }
}

// les envois jamais finis : Drive oublie leur session au bout d'une semaine
function dropOldSessions(P) {
  var all = P.getProperties();
  for (var k in all) {
    if (k.indexOf('u:') !== 0) continue;
    var st = readJson(all[k], null);
    if (st && Date.now() - st.c > SESSION_DAYS * 24 * 3600 * 1000) {
      trashAll([st.t, st.v]);
      P.deleteProperty(k);
    }
  }
}

// à lancer une fois depuis l'éditeur (Exécuter) pour donner au script ses deux autorisations
function autoriser() {
  DriveApp.getRootFolder();
  UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/about?fields=user', { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true });
  return 'Autorisations en place.';
}

// ------------------------------------------------------------------ lire un original ou une vidéo par morceaux de 4 Mio, sans compte Google
// seulement les fichiers de l'album : le script ne sert rien d'autre de ton Drive
function part(P, b) {
  var f = albumFile(P, b.id, 'places');
  if (!f) throw fail('gone');
  var rec = { id: b.id, s: 0, m: f.getMimeType(), k: /^video\//.test(f.getMimeType()) ? 'video' : 'photo' };
  var from = typeof b.offset === 'number' && b.offset >= 0 ? Math.floor(b.offset) : 0;
  var res = UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(rec.id) + '?alt=media', {
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken(), Range: 'bytes=' + from + '-' + (from + CHUNK - 1) },
    muteHttpExceptions: true
  });
  var code = res.getResponseCode();
  if (code === 404) throw fail('gone');
  if (code === 416) return { offset: from, size: from, data: '' };
  if (code !== 206 && code !== 200) throw fail('drive');
  var bytes = res.getContent();
  var total = rec.s || 0;
  var m = /\/(\d+)$/.exec(header(res, 'content-range'));
  if (m) total = Number(m[1]);
  else if (code === 200) total = bytes.length;
  return { offset: from, size: total, mime: rec.m || (rec.k === 'video' ? 'video/mp4' : 'image/jpeg'), data: Utilities.base64Encode(code === 200 && from > 0 ? bytes.slice(from) : bytes) };
}

// ------------------------------------------------------------------ partager sa position : une demi-heure au plus, effacée dès qu'on arrête
function position(P, b) {
  memberOf(P, b.member);
  var key = 'l:' + b.member;
  var now = Date.now();
  var all = P.getProperties();
  for (var k in all) {
    if (k.indexOf('l:') !== 0) continue;
    var old = readJson(all[k], null);
    if (!old || old.until <= now) P.deleteProperty(k);
  }
  if (b.stop) {
    P.deleteProperty(key);
    return { ok: true };
  }
  var lat = typeof b.lat === 'number' && b.lat >= -90 && b.lat <= 90 ? Math.round(b.lat * 1e4) / 1e4 : null;
  var lon = typeof b.lon === 'number' && b.lon >= -180 && b.lon <= 180 ? Math.round(b.lon * 1e4) / 1e4 : null;
  if (lat === null || lon === null) throw fail('bad_request');
  var until = typeof b.until === 'number' ? Math.min(b.until, now + POS_MAX_MS) : now + POS_MAX_MS;
  if (until <= now) {
    P.deleteProperty(key);
    return { ok: true };
  }
  var acc = typeof b.acc === 'number' && b.acc > 0 ? Math.min(5000, Math.round(b.acc)) : 0;
  P.setProperty(key, JSON.stringify({ lat: lat, lon: lon, acc: acc, at: now, until: until }));
  return { ok: true, until: until };
}
