# Password Security Toolkit — Threat Model

## 1. Purpose

The Password Security Toolkit is a client-side password security application.

The application generates and analyzes passwords, passphrases, and PINs in the browser.

The security architecture is designed around minimizing transmission and persistent storage of sensitive credential material.

---

## 2. Security Objectives

The primary security objectives are:

1. Generate secrets using cryptographically secure randomness.
2. Avoid transmitting passwords, PINs, and passphrases unnecessarily.
3. Avoid persistent storage of sensitive generated values.
4. Minimize clipboard exposure.
5. Reduce XSS risk.
6. Prevent unsafe DOM insertion.
7. Protect the application shell with a restrictive Content Security Policy.
8. Prevent sensitive URLs from being intentionally cached by the Service Worker.
9. Provide security-oriented validation.
10. Document known limitations and assumptions.

---

## 3. Assets

The main security-sensitive assets are:

- User-entered passwords
- Generated passwords
- Generated passphrases
- Generated PINs
- Clipboard contents
- Password analysis input
- Browser memory containing temporary secret values

Non-sensitive application assets include:

- HTML
- CSS
- JavaScript application code
- PWA manifest
- Service Worker
- Public icons
- Documentation

---

## 4. Trust Boundaries

### Browser

The browser is the primary execution environment.

Sensitive values are intended to remain within browser memory.

### Service Worker

The Service Worker controls application caching.

It must not intentionally cache password values, PINs, passphrases, or sensitive query parameters.

### Cache Storage

Cache Storage contains application resources.

It is not intended to contain credential material.

### Clipboard

The operating-system/browser clipboard is outside the complete control of the application.

Automatic clearing reduces exposure but cannot guarantee removal from every clipboard history mechanism.

### Deployment Infrastructure

The deployed JavaScript bundle must be considered trusted application code.

A compromised deployment pipeline could modify application behavior.

---

## 5. Threats

### T1 — Weak Randomness

An attacker may attempt to predict generated credentials if a non-cryptographic random source is used.

Mitigation:

- Use `crypto.getRandomValues()`.
- Avoid `Math.random()` for secrets.
- Use rejection sampling where required.

---

### T2 — XSS

Injected JavaScript could access passwords while they are present in the DOM or memory.

Mitigation:

- Avoid `innerHTML` for sensitive user-controlled values.
- Use `textContent`.
- Use restrictive CSP.
- Avoid inline event handlers.
- Validate inputs.
- Review dependencies.

---

### T3 — Malicious Dependency

A compromised npm dependency could access application data.

Mitigation:

- Keep dependencies minimal.
- Review package changes.
- Run dependency audits.
- Prefer browser-native APIs where practical.
- Lock dependency versions.

---

### T4 — Clipboard Exposure

Copied passwords may remain available in the clipboard.

Mitigation:

- Provide automatic clipboard clearing.
- Provide manual clipboard clearing.
- Minimize clipboard retention time.

Limitation:

The application cannot guarantee removal from OS-level clipboard history or clipboard-management software.

---

### T5 — Persistent Sensitive Storage

A password accidentally stored in localStorage, sessionStorage, IndexedDB, or another persistent mechanism could remain after the application closes.

Mitigation:

- Do not intentionally persist passwords.
- Do not intentionally persist generated PINs.
- Do not intentionally persist generated passphrases.
- Runtime security checks inspect storage keys for suspicious sensitive names.

---

### T6 — Service Worker Cache Exposure

Sensitive data accidentally placed into URLs or responses could be cached.

Mitigation:

- Service Worker only handles same-origin GET requests.
- Requests with query strings are not intentionally cached.
- Application shell contains only static resources.
- Sensitive values are not intentionally stored in Cache Storage.

---

### T7 — Third-Party Script Exposure

Third-party JavaScript could access application state.

Mitigation:

- Avoid third-party scripts.
- Use same-origin JavaScript.
- Restrict scripts using CSP.

---

### T8 — Insecure Deployment

HTTP deployment can expose application traffic to network attackers.

Mitigation:

- Production deployment should use HTTPS.
- Use secure hosting.
- Configure security headers.

---

### T9 — Malicious Deployment

An attacker who gains control of the deployment pipeline could replace application JavaScript.

Mitigation:

- Protect repository access.
- Protect CI/CD credentials.
- Review pull requests.
- Use branch protection.
- Audit deployment configuration.

---

### T10 — Browser Extension

A malicious browser extension may have access to pages or clipboard contents.

Mitigation:

This threat cannot be completely controlled by a web application.

The application should clearly document this limitation.

---

### T11 — Shoulder Surfing

An attacker observing the screen may see generated credentials.

Mitigation:

- Password fields use password masking.
- Generated values can be cleared.
- Sensitive values are marked for privacy handling.

---

### T12 — Sensitive Logging

Passwords or generated credentials accidentally written to logs could expose secrets.

Mitigation:

- Never log password values.
- Never log PIN values.
- Never log passphrases.
- Never include secrets in error messages.

---

## 6. Security Assumptions

The security model assumes:

- The browser itself is trusted.
- The operating system is trusted.
- The initial application bundle is trusted.
- The deployment infrastructure is trusted.
- No malicious browser extension is actively reading the page.
- HTTPS is used in production.
- The user does not intentionally expose generated credentials.

---

## 7. Security Limitations

This application cannot guarantee protection against:

- Compromised operating systems
- Malicious browser extensions
- Keyloggers
- Screen capture
- Clipboard history software
- Compromised deployment infrastructure
- Browser vulnerabilities
- Malicious modified JavaScript bundles

---

## 8. Security Principle

The application follows:

> Minimize exposure, minimize persistence, minimize dependencies.

Sensitive credentials should exist for the shortest practical period and in the smallest practical number of application-controlled locations.