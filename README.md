# express-pretty-logger 🎨

A clean, beautiful, and secure terminal logger middleware for **Express.js**.

Designed with rich ANSI box borders, color badges for HTTP methods and status codes, response time metrics, response body interception, payload truncation, and **automatic sensitive-data & JWT masking**.

---

## ✨ Features

- 🌈 **Beautiful Terminal Output**: Clean box borders, badges for HTTP methods and response statuses, and color-coded execution times.
- 🔒 **Zero-Leak Security by Default**: Automatically hides passwords, credit card numbers, CVVs, PINs, OTPs, API keys, cookies, and JWT tokens (e.g. `[TOKEN HIDDEN]`).
- 📦 **Response Interception**: Safely captures JSON & string responses from `res.json()` and `res.send()` without modifying payloads.
- ⚡ **Payload Truncation**: Prevents terminal flooding from large payloads (`maxPayloadLength`).
- 🛠️ **Fully Configurable**: Toggle request body, response body, query parameters, route parameters, headers, or ignore specific paths (like health checks).
- 🪶 **Zero Dependencies**: Pure, lightweight Node.js with built-in ANSI styling and NO_COLOR support.
- 📘 **TypeScript Ready**: Includes comprehensive `index.d.ts` type definitions.

---

## 📦 Installation

```bash
npm install express-pretty-logger
```

---

## 🚀 Quick Start

```javascript
const express = require('express');
const logger = require('express-pretty-logger');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach logger middleware
app.use(logger());

app.get('/users', (req, res) => {
  res.json({
    users: [
      { id: 1, name: 'Alby', role: 'admin' }
    ]
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

## 🖥️ Terminal Output Preview

```text
┌──────────────────────────────────────────────────────────┐
│ INCOMING REQUEST [11:42:31 PM]  GET  /users?page=1
│ Query Params:
│   {
│     "page": "1"
│   }
├──────────────────────────────────────────────────────────┤
│ OUTGOING RESPONSE 🟢 200 OK in 12ms
│ Response Payload:
│   {
│     "users": [
│       {
│         "id": 1,
│         "name": "Alby",
│         "role": "admin"
│       }
│     ]
│   }
└──────────────────────────────────────────────────────────┘
```

### 🛡️ Automatic Sensitive Data Masking Preview

```text
┌──────────────────────────────────────────────────────────┐
│ INCOMING REQUEST [11:43:05 PM]  POST  /auth/login
│ Request Body:
│   {
│     "email": "alex@example.com",
│     "password": "***HIDDEN***",
│     "pin": "***HIDDEN***"
│   }
├──────────────────────────────────────────────────────────┤
│ OUTGOING RESPONSE 🟢 200 OK in 42ms
│ Response Payload:
│   {
│     "success": true,
│     "token": "[TOKEN HIDDEN]",
│     "user": {
│       "id": 101,
│       "email": "alex@example.com"
│     }
│   }
└──────────────────────────────────────────────────────────┘
```

---

## ⚙️ Configuration Options

You can customize the logger by passing an options object to `logger(options)`:

```javascript
app.use(
  logger({
    requestBody: true,         // Log incoming request body (default: true)
    responseBody: true,        // Log outgoing response body (default: true)
    query: true,               // Log URL query params (default: true)
    params: false,             // Log req.params route parameters (default: false)
    headers: ['authorization'],// Log specific headers or boolean (default: false)
    maxPayloadLength: 5000,    // Truncate payloads longer than N chars (default: 5000)
    timestamp: true,           // Show timestamp or custom generator (default: true)
    colors: true,              // Enable ANSI colors (respects NO_COLOR env var)
    ignorePaths: ['/health', '/metrics'], // Skip logging for specific routes
    sensitiveKeys: ['customSecret'],      // Additional keys to mask with ***HIDDEN***
    tokenKeys: ['customApiKey'],          // Additional keys to mask with [TOKEN HIDDEN]
    sensitiveMask: '***HIDDEN***',
    tokenMask: '[TOKEN HIDDEN]'
  })
);
```

### Options Reference Table

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `requestBody` | `boolean` | `true` | Log request body payload. |
| `responseBody` | `boolean` | `true` | Intercept and log response payload. |
| `query` | `boolean` | `true` | Log URL query parameters (`req.query`). |
| `params` | `boolean` | `false` | Log route parameters (`req.params`). |
| `headers` | `boolean \| string[]` | `false` | Log all headers or a list of specific header names. |
| `timestamp` | `boolean \| (() => string)` | `true` | Include timestamp in request banner. |
| `maxPayloadLength` | `number` | `5000` | Character threshold before payload is truncated. |
| `colors` | `boolean \| object` | `true` | Enable ANSI colors. Automatically disabled if `NO_COLOR` env is set. |
| `ignorePaths` | `(string \| RegExp)[] \| ((req) => boolean)` | `[]` | Routes to ignore. |
| `sensitiveKeys` | `(string \| RegExp)[]` | `[]` | Custom field names to mask with `sensitiveMask`. |
| `tokenKeys` | `(string \| RegExp)[]` | `[]` | Custom token field names to mask with `tokenMask`. |
| `sensitiveMask` | `string` | `'***HIDDEN***'` | Placeholder string for sensitive values. |
| `tokenMask` | `string` | `'[TOKEN HIDDEN]'` | Placeholder string for tokens/JWTs. |
| `log` | `Function` | `console.log` | Custom logging transport (e.g. Winston, Pino). |
| `showDuration` | `boolean` | `true` | Show elapsed request duration. |

---

## 🔒 Built-in Masked Fields

By default, any field matching the following patterns (case-insensitive) is automatically masked:

- **Sensitive Fields** (`***HIDDEN***`): `password`, `secret`, `passwd`, `passcode`, `currentPassword`, `newPassword`, `confirmPassword`, `cvv`, `cvc`, `creditCard`, `cardNumber`, `pin`, `otp`, `privateKey`, `cookie`, `set-cookie`, `session`, `ssn`
- **Tokens & Auth** (`[TOKEN HIDDEN]`): `token`, `accessToken`, `refreshToken`, `idToken`, `jwt`, `authorization`, `authHeader`, `bearerToken`, `apiKey`, `secretToken`
- **JWT Pattern Detection**: Any string beginning with standard JWT headers (e.g. `eyJ...`) is automatically detected and masked, even when nested in custom fields or arrays.

---

## 💡 Advanced Usage

### Using with TypeScript / ESM

```typescript
import express from 'express';
import logger, { LoggerOptions } from 'express-pretty-logger';

const app = express();

const options: LoggerOptions = {
  ignorePaths: ['/health', /^\/static/],
  maxPayloadLength: 2000
};

app.use(logger(options));
```

### Standalone Sanitizer Utility

You can also use the sanitizer directly in your own services or loggers:

```javascript
const { sanitizePayload } = require('express-pretty-logger');

const cleanData = sanitizePayload(userProfile, {
  sensitiveKeys: ['internalSecret']
});
```

---

## 🧪 Testing

```bash
npm test
```

To run the interactive demonstration:

```bash
npm run example
```

---

## 📄 License

[MIT](LICENSE)
