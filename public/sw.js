const CACHE_VERSION =
  "password-toolkit-v10";

const APP_CACHE =
  `${CACHE_VERSION}-app`;

const RUNTIME_CACHE =
  `${CACHE_VERSION}-runtime`;

const BASE_PATH =
  new URL(".", self.location.href).pathname;

const APP_SHELL = [
  BASE_PATH,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}offline.html`,
  `${BASE_PATH}manifest.webmanifest`,
  `${BASE_PATH}icons/icon-192.png`,
  `${BASE_PATH}icons/icon-512.png`,
];

self.addEventListener(
  "install",
  (event) => {
    event.waitUntil(
      caches
        .open(APP_CACHE)
        .then((cache) =>
          cache.addAll(APP_SHELL),
        ),
    );

    self.skipWaiting();
  },
);

self.addEventListener(
  "activate",
  (event) => {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) =>
          Promise.all(
            cacheNames
              .filter(
                (cacheName) =>
                  cacheName !== APP_CACHE &&
                  cacheName !== RUNTIME_CACHE,
              )
              .map((cacheName) =>
                caches.delete(cacheName),
              ),
          ),
        )
        .then(() =>
          self.clients.claim(),
        ),
    );
  },
);

self.addEventListener(
  "message",
  (event) => {
    if (
      event.data?.type ===
      "SKIP_WAITING"
    ) {
      self.skipWaiting();
    }
  },
);

self.addEventListener(
  "fetch",
  (event) => {
    const request = event.request;

    if (request.method !== "GET") {
      return;
    }

    const requestUrl =
      new URL(request.url);

    if (
      requestUrl.origin !==
      self.location.origin
    ) {
      return;
    }

    if (
      !requestUrl.pathname.startsWith(
        BASE_PATH,
      )
    ) {
      return;
    }

    /*
     * Never intentionally cache requests
     * containing query parameters that could
     * accidentally contain sensitive values.
     */
    if (requestUrl.search) {
      return;
    }

    if (request.mode === "navigate") {
      event.respondWith(
        handleNavigationRequest(request),
      );

      return;
    }

    event.respondWith(
      handleAssetRequest(request),
    );
  },
);

async function handleNavigationRequest(
  request,
) {
  try {
    const response =
      await fetch(request);

    if (response.ok) {
      const cache =
        await caches.open(
          RUNTIME_CACHE,
        );

      await cache.put(
        request,
        response.clone(),
      );
    }

    return response;
  } catch {
    const cachedPage =
      await caches.match(request);

    if (cachedPage) {
      return cachedPage;
    }

    const cachedIndex =
      await caches.match(
        `${BASE_PATH}index.html`,
      );

    if (cachedIndex) {
      return cachedIndex;
    }

    const offlinePage =
      await caches.match(
        `${BASE_PATH}offline.html`,
      );

    if (offlinePage) {
      return offlinePage;
    }

    return new Response(
      "Password Security Toolkit is currently offline.",
      {
        status: 503,
        headers: {
          "Content-Type":
            "text/plain; charset=utf-8",
          "Cache-Control":
            "no-store",
        },
      },
    );
  }
}

async function handleAssetRequest(
  request,
) {
  const cachedResponse =
    await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response =
      await fetch(request);

    if (response.ok) {
      const cache =
        await caches.open(
          RUNTIME_CACHE,
        );

      await cache.put(
        request,
        response.clone(),
      );
    }

    return response;
  } catch {
    return new Response(
      "This resource is not available offline.",
      {
        status: 503,
        headers: {
          "Content-Type":
            "text/plain; charset=utf-8",
          "Cache-Control":
            "no-store",
        },
      },
    );
  }
}