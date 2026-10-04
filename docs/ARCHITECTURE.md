

# Architecture

## Overview

Password Security Toolkit is a client-side Vite application.

The application consists of:

- UI layer
- Security modules
- Privacy layer
- PWA layer
- Browser APIs
- Automated tests

---

## Architecture

```text
                 Browser
                    |
        +-----------+-----------+
        |                       |
       UI                 Browser APIs
        |                       |
   +----+----+          +-------+-------+
   |         |          |       |       |
Generator Analyzer    Crypto Clipboard Storage
   |         |
   +----+----+
        |
   Privacy Layer
        |
   Security Layer
        |
   PWA Layer
        |
 Service Worker
        |
 Cache Storage