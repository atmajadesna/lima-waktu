const CACHE='lima-waktu-v8';
const CORE=['./','./index.html','./styles.css?v=7','./tokens.css?v=6-navy','./comfort.css?v=7','./refined.css?v=8','./app.js?v=7','./extras.js?v=7','./icon.svg','./icon-192.png','./icon-512.png','./manifest.webmanifest'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('lima-waktu-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin||request.headers.has('range'))return;
 event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(request,copy));}return response;}).catch(()=>caches.match(request).then(hit=>hit||(request.mode==='navigate'?caches.match('./index.html'):Response.error()))));
});
