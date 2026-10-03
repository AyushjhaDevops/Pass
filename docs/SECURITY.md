# Security Policy

## Security Philosophy

Password Security Toolkit is designed as a privacy-first, client-side security utility.

The application attempts to minimize:

- Network transmission
- Persistent sensitive storage
- Third-party dependencies
- Clipboard exposure
- Unsafe DOM operations

---

## Cryptographic Randomness

Secret generation uses the browser Web Crypto API.

The application must not use:

```js
Math.random()