/* My Health — service worker: offline cache, push alarms, notification actions */
importScripts('config.js');
var C = self.MH_CONFIG || {};
var CACHE = 'my-health-2.0.1';
var ASSETS = ['./', 'index.html', 'app.js', 'i18n.js', 'config.js', 'vendor/supabase.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/badge-96.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('my-health-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('message', function (e) { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase & others: network only
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(function (res) {
      var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put('index.html', copy); }); return res;
    }).catch(function () { return caches.match('index.html'); }));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
    var net = fetch(req).then(function (res) {
      if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      return res;
    }).catch(function () { return hit; });
    return hit || net;
  }));
});

/* ---------- Push alarms ---------- */
self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { title: 'My Health', body: e.data ? e.data.text() : '' }; }
  var opts = {
    body: d.body || '', tag: d.tag || 'my-health', icon: 'icons/icon-192.png', badge: 'icons/badge-96.png', data: d,
    renotify: true, requireInteraction: !!d.requireInteraction, vibrate: [400, 150, 400, 150, 800], timestamp: Date.now()
  };
  if (d.actions) opts.actions = d.actions;
  e.waitUntil(self.registration.showNotification(d.title || 'My Health', opts).then(function () {
    return self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  }).then(function (list) { list.forEach(function (c) { c.postMessage({ type: 'push', data: d }); }); }));
});

function openUrl(url, msg) {
  return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      if ('focus' in c) {
        if (msg) c.postMessage(msg);
        else if (c.navigate) c.navigate(url).catch(function () {});
        return c.focus();
      }
    }
    return self.clients.openWindow(url);
  });
}

self.addEventListener('notificationclick', function (e) {
  var n = e.notification, d = n.data || {}, act = e.action;
  n.close();
  if (d.kind === 'due' && d.key && d.tok && (act === 'take' || act === 'snooze')) {
    e.waitUntil(self.registration.pushManager.getSubscription().then(function (s) {
      return fetch(C.supabaseUrl + '/functions/v1/notify', {
        method: 'POST', headers: { 'Content-Type': 'application/json', apikey: C.supabaseKey },
        body: JSON.stringify({ action: act, key: d.key, tok: d.tok, endpoint: s ? s.endpoint : '', minutes: 10 })
      });
    }).then(function (r) {
      if (!r.ok) throw new Error('failed');
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) { list.forEach(function (c) { c.postMessage({ type: 'refresh' }); }); });
    }).catch(function () {
      return openUrl('./?alarm=' + encodeURIComponent(d.key) + '&tok=' + encodeURIComponent(d.tok));
    }));
    return;
  }
  var url = './', msg = null;
  if (d.kind === 'due' && d.key) { url = './?alarm=' + encodeURIComponent(d.key) + '&tok=' + encodeURIComponent(d.tok || ''); msg = { type: 'alarm', key: d.key, tok: d.tok }; }
  else if ((d.kind === 'miss' || d.kind === 'refill' || d.kind === 'appt') && d.person) { url = './?go=meds&person=' + encodeURIComponent(d.person); }
  else if (d.local) { url = './'; }
  e.waitUntil(openUrl(url, msg));
});
