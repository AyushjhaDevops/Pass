
# Incident Response

## Purpose

This document describes the response process for security issues affecting Password Security Toolkit.

---

## Severity

### Critical

Examples:

- Password values transmitted unexpectedly
- Remote code execution
- Malicious JavaScript injection
- Cryptographic randomness failure
- Authentication credential exposure

### High

Examples:

- Persistent sensitive storage
- Significant XSS vulnerability
- Service Worker caching sensitive data
- Compromised dependency

### Medium

Examples:

- Security control bypass
- Clipboard protection failure
- Missing security header

### Low

Examples:

- Minor information disclosure
- Documentation issue
- Non-security UI issue

---

## Response Process

```text
Detection
   ↓
Reproduce
   ↓
Assess impact
   ↓
Contain
   ↓
Fix
   ↓
Test
   ↓
Deploy
   ↓
Document