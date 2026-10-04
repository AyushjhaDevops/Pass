const SERVICE_WORKER_PATH =
  `${import.meta.env.BASE_URL}sw.js`;

let deferredInstallPrompt = null;
let updateRegistration = null;

function getElement(selector) {
  return document.querySelector(selector);
}

function createPwaContainer() {
  let container = getElement("#pwaContainer");

  if (container) {
    return container;
  }

  container = document.createElement("div");
  container.id = "pwaContainer";
  container.className = "pwa-container";

  document.body.appendChild(container);

  return container;
}

function createOfflineIndicator() {
  const container = createPwaContainer();

  let indicator = getElement("#pwaOfflineIndicator");

  if (indicator) {
    return indicator;
  }

  indicator = document.createElement("div");
  indicator.id = "pwaOfflineIndicator";
  indicator.className = "pwa-status pwa-status-offline";

  indicator.setAttribute("role", "status");
  indicator.setAttribute("aria-live", "polite");
  indicator.setAttribute("aria-atomic", "true");

  indicator.textContent =
    "Offline mode — cached application";

  container.appendChild(indicator);

  return indicator;
}

function updateConnectionStatus() {
  const indicator = getElement(
    "#pwaOfflineIndicator",
  );

  if (!indicator) {
    return;
  }

  if (navigator.onLine) {
    indicator.classList.remove(
      "pwa-status-offline",
    );

    indicator.classList.add(
      "pwa-status-online",
    );

    indicator.textContent =
      "Online — offline cache available";
  } else {
    indicator.classList.remove(
      "pwa-status-online",
    );

    indicator.classList.add(
      "pwa-status-offline",
    );

    indicator.textContent =
      "Offline mode — cached application";
  }
}

function initializeConnectionStatus() {
  createOfflineIndicator();

  updateConnectionStatus();

  window.addEventListener(
    "online",
    updateConnectionStatus,
  );

  window.addEventListener(
    "offline",
    updateConnectionStatus,
  );
}

function createInstallPrompt() {
  const container = createPwaContainer();

  let installCard = getElement(
    "#pwaInstallCard",
  );

  if (installCard) {
    return installCard;
  }

  installCard = document.createElement("div");
  installCard.id = "pwaInstallCard";
  installCard.className = "pwa-install-card";
  installCard.hidden = true;

  installCard.innerHTML = `
    <div class="pwa-install-content">
      <div
        class="pwa-install-icon"
        aria-hidden="true"
      >
        📱
      </div>

      <div>
        <strong>
          Install Password Toolkit
        </strong>

        <p>
          Install the toolkit for quick access
          and an app-like experience.
        </p>
      </div>
    </div>

    <div class="pwa-install-actions">
      <button
        id="pwaInstallButton"
        class="pwa-button pwa-button-primary"
        type="button"
      >
        Install
      </button>

      <button
        id="pwaInstallDismiss"
        class="pwa-button pwa-button-secondary"
        type="button"
      >
        Not now
      </button>
    </div>
  `;

  container.appendChild(installCard);

  return installCard;
}

function showInstallPrompt() {
  if (!deferredInstallPrompt) {
    return;
  }

  const card = createInstallPrompt();

  card.hidden = false;

  const installButton = getElement(
    "#pwaInstallButton",
  );

  const dismissButton = getElement(
    "#pwaInstallDismiss",
  );

  installButton?.addEventListener(
    "click",
    handleInstall,
    {
      once: true,
    },
  );

  dismissButton?.addEventListener(
    "click",
    () => {
      card.hidden = true;
      deferredInstallPrompt = null;
    },
    {
      once: true,
    },
  );
}

async function handleInstall() {
  if (!deferredInstallPrompt) {
    return;
  }

  const promptEvent = deferredInstallPrompt;

  deferredInstallPrompt = null;

  const card = getElement(
    "#pwaInstallCard",
  );

  if (card) {
    card.hidden = true;
  }

  try {
    await promptEvent.prompt();
    await promptEvent.userChoice;
  } catch {
    // Installation was cancelled or unavailable.
  }
}

function initializeInstallPrompt() {
  window.addEventListener(
    "beforeinstallprompt",
    (event) => {
      event.preventDefault();

      deferredInstallPrompt = event;

      showInstallPrompt();
    },
  );

  window.addEventListener(
    "appinstalled",
    () => {
      deferredInstallPrompt = null;

      const card = getElement(
        "#pwaInstallCard",
      );

      if (card) {
        card.hidden = true;
      }

      showPwaNotification(
        "Password Toolkit installed successfully.",
      );
    },
  );
}

function showPwaNotification(message) {
  const existingNotification =
    getElement("#pwaNotification");

  existingNotification?.remove();

  const notification =
    document.createElement("div");

  notification.id = "pwaNotification";
  notification.className =
    "pwa-notification";

  notification.setAttribute(
    "role",
    "status",
  );

  notification.setAttribute(
    "aria-live",
    "polite",
  );

  notification.textContent = message;

  createPwaContainer().appendChild(
    notification,
  );

  window.setTimeout(() => {
    notification.classList.add(
      "pwa-notification-hide",
    );

    window.setTimeout(() => {
      notification.remove();
    }, 200);
  }, 4000);
}

function createUpdatePrompt() {
  const container = createPwaContainer();

  let updateCard = getElement(
    "#pwaUpdateCard",
  );

  if (updateCard) {
    return updateCard;
  }

  updateCard = document.createElement("div");
  updateCard.id = "pwaUpdateCard";
  updateCard.className = "pwa-update-card";
  updateCard.hidden = true;

  updateCard.innerHTML = `
    <div>
      <strong>
        Update available
      </strong>

      <p>
        A newer version of Password Security
        Toolkit is ready.
      </p>
    </div>

    <div class="pwa-update-actions">
      <button
        id="pwaUpdateButton"
        class="pwa-button pwa-button-primary"
        type="button"
      >
        Update
      </button>

      <button
        id="pwaUpdateDismiss"
        class="pwa-button pwa-button-secondary"
        type="button"
      >
        Later
      </button>
    </div>
  `;

  container.appendChild(updateCard);

  return updateCard;
}

function showUpdatePrompt() {
  const card = createUpdatePrompt();

  card.hidden = false;

  const updateButton = getElement(
    "#pwaUpdateButton",
  );

  const dismissButton = getElement(
    "#pwaUpdateDismiss",
  );

  updateButton?.addEventListener(
    "click",
    () => {
      updateServiceWorker();
    },
    {
      once: true,
    },
  );

  dismissButton?.addEventListener(
    "click",
    () => {
      card.hidden = true;
    },
    {
      once: true,
    },
  );
}

function updateServiceWorker() {
  if (!updateRegistration?.waiting) {
    window.location.reload();
    return;
  }

  updateRegistration.waiting.postMessage({
    type: "SKIP_WAITING",
  });

  window.setTimeout(() => {
    window.location.reload();
  }, 250);
}

function initializeServiceWorker() {
  if (
    typeof navigator === "undefined" ||
    !("serviceWorker" in navigator)
  ) {
    return;
  }

  if (
    !window.isSecureContext &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return;
  }

  window.addEventListener(
    "load",
    async () => {
      try {
        const registration =
          await navigator.serviceWorker.register(
            SERVICE_WORKER_PATH,
            {
              scope: import.meta.env.BASE_URL,
            },
          );

        updateRegistration = registration;

        if (registration.waiting) {
          showUpdatePrompt();
        }

        registration.addEventListener(
          "updatefound",
          () => {
            const newWorker =
              registration.installing;

            if (!newWorker) {
              return;
            }

            newWorker.addEventListener(
              "statechange",
              () => {
                if (
                  newWorker.state ===
                    "installed" &&
                  navigator.serviceWorker
                    .controller
                ) {
                  showUpdatePrompt();
                }
              },
            );
          },
        );

        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => {
            window.location.reload();
          },
          {
            once: true,
          },
        );
      } catch {
        console.warn(
          "Service Worker registration failed.",
        );
      }
    },
  );
}

export function isServiceWorkerSupported() {
  return (
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator
  );
}

export function isOnline() {
  if (typeof navigator === "undefined") {
    return true;
  }

  return navigator.onLine;
}

export function getInstallPromptState() {
  return {
    available:
      deferredInstallPrompt !== null,
  };
}

export function initializePwa() {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined"
  ) {
    return;
  }

  initializeConnectionStatus();
  initializeInstallPrompt();
  initializeServiceWorker();
}