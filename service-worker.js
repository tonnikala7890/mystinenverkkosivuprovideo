const CACHE_NAME = "o-jarjesto-app-v25";
const APP_SHELL = [
  "./",
  "./index.html",
  "./kaupunki.html",
  "./mystinen-raketti.html",
  "./valotemppeli.html",
  "./pollowalittomo.html",
  "./style.css",
  "./kaupunki.js",
  "./raketti.js",
  "./valotemppeli.js",
  "./pollowalittomo.js",
  "./portaali.js",
  "./assets/rocket-launch.mp4",
  "./assets/portal-arrival.mp4",
  "./assets/owl-tree-night.png",
  "./assets/owl-tree-journey.mp4",
  "./assets/owl-cottage.png",
  "./assets/owl-cottage-lever.mp4",
  "./assets/owl-book-portal.mp4",
  "./salaisuus.js",
  "./pwa.js",
  "./manifest.webmanifest",
  "./kuvake.svg",
  "./kuvake-192.png",
  "./kuvake-512.png"
];

const createRangeResponse = async (response, rangeHeader) => {
  const blob = await response.blob();
  const size = blob.size;
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
  if (!match || (!match[1] && !match[2])) {
    return new Response(null, {
      status: 416,
      headers: { "Accept-Ranges": "bytes", "Content-Range": `bytes */${size}` }
    });
  }

  let start;
  let end;
  if (!match[1]) {
    const suffixLength = Number(match[2]);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0 || size === 0) {
      return new Response(null, {
        status: 416,
        headers: { "Accept-Ranges": "bytes", "Content-Range": `bytes */${size}` }
      });
    }
    start = Math.max(size - suffixLength, 0);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : size - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || end < start) {
      return new Response(null, {
        status: 416,
        headers: { "Accept-Ranges": "bytes", "Content-Range": `bytes */${size}` }
      });
    }
    end = Math.min(end, size - 1);
  }

  const headers = new Headers(response.headers);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(end - start + 1));
  return new Response(blob.slice(start, end + 1), { status: 206, headers });
};

const withRangeSupport = (response) => {
  if (!response.headers.get("Content-Type")?.startsWith("video/")) return response;
  const headers = new Headers(response.headers);
  headers.set("Accept-Ranges", "bytes");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith("o-jarjesto-app-") && cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => (
        await caches.match(request) || caches.match("./index.html")
      ))
    );
    return;
  }

  const rangeHeader = request.headers.get("Range");
  if (rangeHeader) {
    event.respondWith((async () => {
      const fullRequest = new Request(request.url);
      let response = await caches.match(fullRequest);
      if (!response) {
        response = await fetch(fullRequest);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(fullRequest, response.clone());
        }
      }
      if (!response.ok) return response;
      return createRangeResponse(response, rangeHeader);
    })());
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return withRangeSupport(cachedResponse);
      }
      return fetch(request).then((response) => {
        if (response.ok) {
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy));
        }
        return withRangeSupport(response);
      });
    })
  );
});
