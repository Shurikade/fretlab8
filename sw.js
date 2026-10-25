/* FretLab 8 : cache atomique, activation demandée par le joueur. */
const CACHE_NAME='fretlab8-pwa-v3';
const PRECACHE=['./','./index.html','./app.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(PRECACHE))));
self.addEventListener('message',event=>{if(event.data==='ACTIVATE')self.skipWaiting()});
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('fretlab8-pwa-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const req=event.request,url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(new URL('./',self.registration.scope).pathname))return;event.respondWith(caches.open(CACHE_NAME).then(async cache=>{const cached=await cache.match(req,{ignoreSearch:true});if(cached)return cached;try{return await fetch(req)}catch(err){if(req.mode==='navigate')return cache.match('./index.html');throw err}}))});
