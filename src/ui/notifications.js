
export function showNotification(
  message,
  type = "info",
  duration = 3000,
) {
  const container = document.querySelector(
    "#notificationContainer",
  );

  if (!container) {
    return;
  }

  const notification = document.createElement("div");

  notification.className = `notification notification-${type}`;

  notification.setAttribute("role", "status");

  notification.textContent = message;

  container.appendChild(notification);

  window.setTimeout(() => {
    notification.classList.add("notification-hide");

    window.setTimeout(() => {
      notification.remove();
    }, 200);
  }, duration);
}