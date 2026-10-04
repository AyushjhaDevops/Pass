# 🔐 Password Security Toolkit

A privacy-first, client-side password security toolkit built with Vanilla JavaScript and the Web Crypto API.

Generate strong passwords, analyze password security, create secure passphrases and PINs, inspect entropy and patterns, perform privacy-preserving breach checks, and run security diagnostics — without requiring an application backend.

> **Your password stays in your browser.**

---

## ✨ Features

### 🔑 Cryptographically Secure Password Generator

* Cryptographically secure random generation using the Web Crypto API
* Configurable password length
* Uppercase characters
* Lowercase characters
* Numbers
* Symbols
* Character-set validation
* Secure randomness validation

### 🛡️ Password Security Analyzer

Analyze password characteristics including:

* Password strength
* Entropy
* Character composition
* Length
* Repeated characters
* Sequential patterns
* Common patterns
* Security recommendations

### 🧠 Passphrase Generator

Generate memorable passphrases using configurable word counts.

### 🔢 PIN Generator

Generate secure numeric PINs with configurable lengths.

### 🔍 Privacy-Preserving Breach Checking

The toolkit supports optional breach checking using the Have I Been Pwned Pwned Passwords range API.

The password is **never sent to the breach service**.

The process is:

```text
Password
   │
   ▼
SHA-1 hash generated locally
   │
   ▼
First 5 hash characters
   │
   ▼
HIBP range API
   │
   ▼
Returned hash suffixes
   │
   ▼
Exact comparison performed locally
   │
   ▼
Breach result
```

Security properties:

* Disabled by default
* Requires explicit user consent
* Requires explicit user action
* No password transmission
* No full hash transmission
* Only the first five SHA-1 characters are sent
* Exact comparison occurs locally
* No breach-result persistence
* Requests use `credentials: omit`
* Requests use `cache: no-store`
* Response padding is enabled
* Timeout handling is implemented

### 🔒 Privacy Controls

The application follows a local-first privacy model.

Features include:

* Local-only operation by default
* Automatic clipboard clearing
* Configurable clipboard timeout
* Sensitive-field clearing
* Page-hide cleanup
* No persistent password storage
* No persistent PIN storage
* No persistent passphrase storage

> Browser and operating-system clipboard history cannot be guaranteed to be erased by a web application.

### 📱 Progressive Web App

The application includes:

* Web App Manifest
* Service Worker
* Offline fallback
* Offline asset caching
* Network-first navigation
* Cache-first static assets
* Installable PWA support

### ♿ Accessibility

The interface includes accessibility-focused features such as:

* Keyboard interaction
* Accessible controls
* Focus handling
* Status messaging
* Reduced-motion considerations
* Responsive layouts
* Screen-reader-friendly UI structure

### 🛡️ Security Engineering

The project includes security controls and automated regression tests for:

* XSS
* Sensitive data storage
* Sensitive logging
* Network exfiltration
* Network surface
* CSP
* Cryptographic randomness
* Input validation
* Security configuration
* PWA behavior
* Privacy regressions

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────┐
│                  Browser                    │
│                                             │
│  ┌─────────────── UI ────────────────────┐  │
│  │ Generator │ Checker │ PIN │ Passphrase│  │
│  │ Privacy   │ PWA     │ Security       │  │
│  └────────────────────────────────────────┘  │
│                     │                       │
│  ┌────────────── Application Modules ────┐  │
│  │ Generator                             │  │
│  │ Checker                               │  │
│  │ Entropy                               │  │
│  │ Patterns                              │  │
│  │ Passphrase                            │  │
│  │ PIN                                   │  │
│  │ Validation                            │  │
│  │ Privacy                               │  │
│  │ Security                              │  │
│  │ Clipboard                             │  │
│  │ Breach                                │  │
│  └────────────────────────────────────────┘  │
│                     │                       │
│              Web Crypto API                │
│                     │                       │
│        ┌────────────┴────────────┐          │
│        │                         │          │
│   Local processing        Optional breach   │
│                           range lookup      │
└─────────────────────────────────────────────┘
```

The application is intentionally designed without a custom backend.

---

## 🔐 Security Model

The project follows a local-first security architecture.

### Password generation

Random values are generated using the browser's Web Crypto API rather than predictable pseudo-random generation.

### Password analysis

Password analysis is performed locally in the browser.

### Breach checking

Breach checking is explicitly opt-in.

The application performs:

```text
plaintext password
        ↓
local SHA-1
        ↓
40-character hash
        ↓
5-character prefix
        ↓
external range query
        ↓
local suffix comparison
```

The plaintext password and complete hash are never sent to the breach service.

---

## 🌐 Network Privacy

Normal application functionality is designed to operate locally.

The only intentional external API used by the application is the breach-checking service:

```text
https://api.pwnedpasswords.com
```

The breach service is accessed only after explicit user action.

The application's security regression tests verify the expected network surface and prevent accidental network calls from being introduced into other modules.

---

## 🧪 Testing

The project uses Vitest for automated testing.

Run the complete test suite:

```bash
npm test
```

Run tests once:

```bash
npm run test:run
```

Run coverage:

```bash
npm run test:coverage
```

Run security tests:

```bash
npm run test:security
```

Run linting:

```bash
npm run lint
```

Run the complete release verification:

```bash
npm run verify:release
```

---

## 🔬 Security Test Coverage

The project contains regression tests covering:

```text
Security
├── XSS
├── Storage
├── Logging
├── Network exfiltration
├── Network surface
├── CSP
├── Cryptographic randomness
├── Security configuration
└── Input validation

Privacy
├── Local-only behavior
├── Clipboard handling
├── Sensitive data handling
└── Breach-checking privacy

Application
├── Password generation
├── Password analysis
├── Entropy
├── Patterns
├── Passphrases
├── PINs
└── PWA

Integration
├── Password flow
├── Generator flow
├── Passphrase flow
├── PIN flow
└── Clipboard flow
```

---

## 📊 Coverage

The project uses enforced coverage thresholds:

| Metric     | Minimum |
| ---------- | ------: |
| Statements |     80% |
| Branches   |     75% |
| Functions  |     80% |
| Lines      |     80% |

Generate a coverage report:

```bash
npm run test:coverage
```

---

## 🧰 Tech Stack

| Technology               | Purpose                             |
| ------------------------ | ----------------------------------- |
| HTML5                    | Application structure               |
| CSS3                     | Styling and responsive UI           |
| Vanilla JavaScript       | Application logic                   |
| Vite                     | Development and production build    |
| Web Crypto API           | Cryptographically secure operations |
| Vitest                   | Automated testing                   |
| ESLint                   | Code quality                        |
| Service Worker           | Offline/PWA functionality           |
| Web App Manifest         | PWA installation                    |
| HIBP Pwned Passwords API | Optional breach checking            |

---

## 📁 Project Structure

```text
pass-tool/
│
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── eslint.config.js
├── CHANGELOG.md
├── README.md
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── INCIDENT_RESPONSE.md
│   ├── SECURITY.md
│   ├── TESTING.md
│   ├── THREAT_MODEL.md
│   └── deployement/
│       ├── DEPLOYMENT.md
│       └── PRODUCTION_CHECKLIST.md
│
├── public/
│   ├── _headers
│   ├── manifest.webmanifest
│   ├── offline.html
│   ├── sw.js
│   └── icons/
│
├── src/
│   ├── main.js
│   ├── counter.js
│   ├── style.css
│   │
│   ├── modules/
│   │   ├── breach.js
│   │   ├── checker.js
│   │   ├── clipboard.js
│   │   ├── dom-security.js
│   │   ├── entropy.js
│   │   ├── generator.js
│   │   ├── passphrase.js
│   │   ├── patterns.js
│   │   ├── pin.js
│   │   ├── privacy.js
│   │   ├── security.js
│   │   └── validation.js
│   │
│   ├── ui/
│   │   ├── accessibility.js
│   │   ├── breach-ui.js
│   │   ├── notifications.js
│   │   ├── pin-ui.js
│   │   ├── privacy.js
│   │   ├── pwa.js
│   │   ├── security.js
│   │   └── theme.js
│   │
│   └── styles/
│
└── tests/
    ├── unit/
    ├── integration/
    ├── security/
    ├── statistical/
    └── *.test.js
```

---

## 🚀 Getting Started

### Requirements

* Node.js
* npm
* Modern browser with Web Crypto API support

### Installation

Clone the repository:

```bash
git clone <YOUR_REPOSITORY_URL>
cd pass-tool
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## 🔍 Security Verification

Before releasing changes, run:

```bash
npm run verify:release
```

For security-specific verification:

```bash
npm run test:security
```

A release should not be considered ready until both pass.

---

## 📚 Security Documentation

Detailed security documentation is available in:

* `docs/SECURITY.md`
* `docs/THREAT_MODEL.md`
* `docs/ARCHITECTURE.md`
* `docs/INCIDENT_RESPONSE.md`
* `docs/TESTING.md`
* `docs/deployement/DEPLOYMENT.md`
* `docs/deployement/PRODUCTION_CHECKLIST.md`

---

## ⚠️ Security Limitations

This project is designed as a privacy-first browser-based security toolkit, but it does not replace a dedicated password manager or enterprise credential-management system.

Important limitations include:

* Browser security ultimately depends on the user's environment.
* Browser extensions can potentially inspect page content.
* A compromised browser or operating system can compromise sensitive information.
* Clipboard clearing cannot guarantee removal from OS/browser clipboard history.
* Breach checking requires an external network request when explicitly enabled.
* SHA-1 is used specifically because it is the format required by the Pwned Passwords range API; it is not being used as a password-storage mechanism.
* No client-side application can guarantee protection against a compromised endpoint.

---

## 🎯 Design Principles

The project follows these principles:

### Privacy first

Sensitive operations should remain local whenever possible.

### Explicit network access

External communication should require a clear user action.

### Minimal data exposure

Only the minimum information required for a feature should leave the browser.

### Secure randomness

Security-sensitive random generation should use Web Crypto.

### Defense in depth

Security is implemented through multiple layers:

```text
Input validation
      ↓
Secure randomness
      ↓
Local processing
      ↓
Privacy controls
      ↓
CSP
      ↓
Security headers
      ↓
Automated security tests
      ↓
Production verification
```

### Regression resistance

Security properties are encoded into automated tests so future changes can be checked against the project's security model.

---

## 🛣️ Roadmap

### Completed

* [x] Password generator
* [x] Password strength analyzer
* [x] Entropy analysis
* [x] Pattern detection
* [x] Passphrase generator
* [x] PIN generator
* [x] Privacy controls
* [x] Accessibility improvements
* [x] PWA/offline support
* [x] Threat model
* [x] Security documentation
* [x] Security regression testing
* [x] Privacy-preserving breach checking
* [x] Network-surface auditing
* [x] CSP network auditing
* [x] Production verification

### Future possibilities

* [ ] Additional password-strength datasets
* [ ] More advanced offline analysis
* [ ] Expanded browser security diagnostics
* [ ] Additional deployment environments
* [ ] Security-focused CI/CD pipeline

---

## 🤝 Contributing

Contributions are welcome.

Before submitting changes:

```bash
npm run lint
npm run test:run
npm run test:coverage
npm run build
```

Security-sensitive changes should also pass:

```bash
npm run test:security
```

Please avoid introducing:

* unnecessary external network requests
* sensitive logging
* persistent plaintext credentials
* insecure randomness
* unsafe DOM manipulation
* unnecessary third-party dependencies

---

## 📜 License

See the repository license for usage and distribution terms.

---

## 👨‍💻 Project

**Password Security Toolkit**

Built as a cybersecurity engineering and privacy-focused portfolio project.

The primary goal is not simply to generate passwords, but to demonstrate how security, privacy, cryptography, browser APIs, testing, threat modeling, and defensive engineering can be combined into a real-world application.
