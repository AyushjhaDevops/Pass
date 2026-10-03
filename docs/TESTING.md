# Testing Strategy

## Overview

Password Security Toolkit uses a layered testing strategy covering:

- Unit testing
- Edge-case testing
- Integration testing
- Statistical testing
- Security regression testing
- PWA testing
- Offline testing
- Clipboard testing
- Privacy regression testing
- Production build verification

## Test Environment

Testing is performed with:

- Vitest
- jsdom
- V8 coverage
- ESLint
- Vite production builds

## Unit Tests

Unit tests verify individual modules:

- Password generation
- Password analysis
- Entropy calculations
- Pattern detection
- Passphrase generation
- PIN generation
- Validation
- Privacy controls
- Security auditing

## Integration Tests

Integration tests verify complete workflows:

1. Generate password
2. Analyze generated password
3. Generate passphrase
4. Generate PIN
5. Copy sensitive values
6. Clear clipboard
7. Maintain privacy guarantees

## Statistical Tests

Generator tests verify properties over multiple samples.

They do not attempt to prove cryptographic security mathematically.

They verify:

- Output diversity
- Character-class presence
- Requested lengths
- Lack of obvious repeated output

Cryptographic security ultimately depends on the Web Crypto API and browser implementation.

## Clipboard Tests

Clipboard tests verify:

- Clipboard API detection
- Copy operation
- Automatic clearing
- Manual clearing
- Timer behavior
- Clipboard failure handling

Clipboard clearing is best-effort and cannot guarantee deletion from every operating-system clipboard history mechanism.

## PWA Tests

PWA tests verify:

- Manifest presence
- Service worker presence
- Install handling
- Activate handling
- Fetch handling
- Offline fallback
- Query-string cache protection
- App shell availability

## Security Regression Tests

Security regression tests verify:

- Secure randomness detection
- Absence of sensitive persistent storage
- External script detection
- XSS-safe text handling
- Sensitive storage detection
- Service-worker security controls

## Coverage

Coverage is generated using V8.

Target thresholds:

- Lines: 80%
- Functions: 80%
- Branches: 75%
- Statements: 80%

Coverage thresholds are quality targets, not proof of security.

## Full Verification

Run:

```bash
npm run verify:full