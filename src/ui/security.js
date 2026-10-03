import {
  runSecurityAudit,
} from "../modules/security.js";

import {
  showNotification,
} from "./notifications.js";

function getElement(selector) {
  return document.querySelector(selector);
}

function getStatusLabel(status) {
  if (status === "critical") {
    return "Critical security issues detected";
  }

  if (status === "review") {
    return "Security review recommended";
  }

  return "Security checks passed";
}

function renderSummary(audit) {
  const passed =
    getElement("#securityPassedValue");

  const failed =
    getElement("#securityFailedValue");

  const critical =
    getElement("#securityCriticalValue");

  const total =
    getElement("#securityTotalValue");

  if (passed) {
    passed.textContent = String(
      audit.passed,
    );
  }

  if (failed) {
    failed.textContent = String(
      audit.failed,
    );
  }

  if (critical) {
    critical.textContent = String(
      audit.critical,
    );
  }

  if (total) {
    total.textContent = String(
      audit.total,
    );
  }
}

function renderStatus(audit) {
  const element = getElement(
    "#securityAuditStatus",
  );

  if (!element) {
    return;
  }

  const status =
    audit.critical > 0
      ? "critical"
      : audit.failed > 0
        ? "review"
        : "secure";

  element.className =
    `security-audit-badge security-audit-${status}`;

  element.textContent =
    getStatusLabel(status);
}

function renderChecks(audit) {
  const container = getElement(
    "#securityAuditChecks",
  );

  if (!container) {
    return;
  }

  container.innerHTML = "";

  audit.checks.forEach((check) => {
    const item =
      document.createElement("div");

    item.className =
      `security-audit-check ${
        check.passed
          ? "security-check-passed"
          : "security-check-failed"
      }`;

    const icon =
      document.createElement("span");

    icon.className =
      "security-check-icon";

    icon.setAttribute(
      "aria-hidden",
      "true",
    );

    icon.textContent = check.passed
      ? "✓"
      : check.severity === "critical"
        ? "!"
        : "⚠";

    const content =
      document.createElement("div");

    content.className =
      "security-check-content";

    const title =
      document.createElement("strong");

    title.textContent = check.label;

    const details =
      document.createElement("p");

    details.textContent = check.details;

    content.appendChild(title);
    content.appendChild(details);

    item.appendChild(icon);
    item.appendChild(content);

    container.appendChild(item);
  });
}

export function renderSecurityAudit() {
  const audit = runSecurityAudit();

  renderSummary(audit);
  renderStatus(audit);
  renderChecks(audit);

  return audit;
}

export function initializeSecurityUI() {
  if (
    typeof document === "undefined"
  ) {
    return;
  }

  const button = getElement(
    "#runSecurityAudit",
  );

  button?.addEventListener("click", () => {
    const audit =
      renderSecurityAudit();

    const message =
      audit.critical > 0
        ? "Critical security checks require attention."
        : audit.failed > 0
          ? "Security audit completed with review items."
          : "Security audit completed successfully.";

    const type =
      audit.critical > 0
        ? "error"
        : audit.failed > 0
          ? "warning"
          : "success";

    showNotification(
      message,
      type,
    );
  });

  renderSecurityAudit();
}