/**
 * Default patterns for sensitive data masking.
 */
const DEFAULT_SENSITIVE_KEY_REGEX =
  /password|secret|passwd|passcode|cvv|cvc|credit.?card|card.?number|pin|otp|private.?key|cookie|set-cookie|session|ssn/i;

const DEFAULT_TOKEN_KEY_REGEX =
  /^(token|accessToken|access_token|refreshToken|refresh_token|idToken|id_token|jwt|authorization|authHeader|auth_header|bearerToken|bearer_token|apiKey|api_key|secretToken|secret_token)$/i;

const JWT_PREFIX_REGEX = /^ey[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/;

/**
 * Checks if a string looks like a JWT token.
 * @param {any} val
 * @returns {boolean}
 */
const isJwtString = (val) => {
  if (typeof val !== "string") return false;
  const trimmed = val.trim();
  if (trimmed.toLowerCase().startsWith("bearer ")) {
    return isJwtString(trimmed.slice(7).trim());
  }
  return (
    (trimmed.startsWith("eyJ") && trimmed.length > 30) ||
    JWT_PREFIX_REGEX.test(trimmed)
  );
};

/**
 * Determines whether a given object key matches sensitive criteria.
 * @param {string} key
 * @param {Array<string|RegExp>} [customKeys=[]]
 * @returns {boolean}
 */
const isSensitiveKey = (key, customKeys = []) => {
  if (DEFAULT_SENSITIVE_KEY_REGEX.test(key)) return true;
  for (const pattern of customKeys) {
    if (typeof pattern === "string" && pattern.toLowerCase() === key.toLowerCase()) {
      return true;
    }
    if (pattern instanceof RegExp && pattern.test(key)) {
      return true;
    }
  }
  return false;
};

/**
 * Determines whether a given object key matches token criteria.
 * @param {string} key
 * @param {Array<string|RegExp>} [customKeys=[]]
 * @returns {boolean}
 */
const isTokenKey = (key, customKeys = []) => {
  if (DEFAULT_TOKEN_KEY_REGEX.test(key)) return true;
  for (const pattern of customKeys) {
    if (typeof pattern === "string" && pattern.toLowerCase() === key.toLowerCase()) {
      return true;
    }
    if (pattern instanceof RegExp && pattern.test(key)) {
      return true;
    }
  }
  return false;
};

/**
 * Recursively sanitizes payloads by masking passwords, tokens, API keys, and JWTs.
 * Protected against circular references, MongoDB ObjectIds, and non-JSON objects.
 * 
 * @param {any} raw - Payload to sanitize
 * @param {object} [options={}]
 * @param {string} [options.sensitiveMask='***HIDDEN***']
 * @param {string} [options.tokenMask='[TOKEN HIDDEN]']
 * @param {Array<string|RegExp>} [options.sensitiveKeys=[]]
 * @param {Array<string|RegExp>} [options.tokenKeys=[]]
 * @param {number} [options.maxDepth=10]
 * @returns {any}
 */
const sanitizePayload = (raw, options = {}) => {
  if (raw === null || raw === undefined) return raw;

  const sensitiveMask = options.sensitiveMask || "***HIDDEN***";
  const tokenMask = options.tokenMask || "[TOKEN HIDDEN]";
  const sensitiveKeys = options.sensitiveKeys || [];
  const tokenKeys = options.tokenKeys || [];
  const maxDepth = typeof options.maxDepth === "number" ? options.maxDepth : 10;

  // WeakSet to detect circular references safely
  const seen = new WeakSet();

  const maskRecursive = (val, depth = 0) => {
    if (val === null || val === undefined) return val;

    if (depth > maxDepth) {
      return "[Max Depth Exceeded]";
    }

    // Handle Primitives
    if (typeof val === "string") {
      if (isJwtString(val)) {
        if (val.trim().toLowerCase().startsWith("bearer ")) {
          return `Bearer ${tokenMask}`;
        }
        return tokenMask;
      }
      return val;
    }

    if (typeof val !== "object") {
      if (typeof val === "bigint") {
        return val.toString();
      }
      return val;
    }

    // Handle MongoDB / BSON ObjectId specifically
    if (
      val._bsontype === "ObjectId" ||
      val._bsontype === "ObjectID" ||
      (val.constructor && (val.constructor.name === "ObjectId" || val.constructor.name === "ObjectID"))
    ) {
      return val.toString();
    }

    // Handle Buffers
    if (typeof Buffer !== "undefined" && Buffer.isBuffer(val)) {
      return `<Buffer ${val.length} bytes>`;
    }

    // Handle Date, RegExp, Error
    if (val instanceof Date) return val.toISOString();
    if (val instanceof RegExp) return val.toString();
    if (val instanceof Error) {
      return {
        name: val.name,
        message: val.message,
        stack: val.stack
      };
    }

    // Detect Circular References
    if (seen.has(val)) {
      return "[Circular]";
    }
    seen.add(val);

    // Handle Arrays
    if (Array.isArray(val)) {
      return val.map((item) => maskRecursive(item, depth + 1));
    }

    // Handle Complex Objects with custom toObject or toJSON
    let target = val;
    if (typeof val.toObject === "function") {
      try {
        target = val.toObject();
      } catch (e) {
        target = val;
      }
    } else if (typeof val.toJSON === "function") {
      try {
        target = val.toJSON();
      } catch (e) {
        target = val;
      }
    }

    // If toObject/toJSON returned a primitive or different structure, recurse on it
    if (target !== val) {
      if (typeof target !== "object" || target === null) {
        return maskRecursive(target, depth);
      }
      if (seen.has(target)) {
        return "[Circular]";
      }
      seen.add(target);
    }

    const copy = {};
    for (const [key, value] of Object.entries(target)) {
      if (isTokenKey(key, tokenKeys)) {
        copy[key] = tokenMask;
      } else if (isSensitiveKey(key, sensitiveKeys)) {
        copy[key] = sensitiveMask;
      } else if (typeof value === "string" && isJwtString(value)) {
        if (value.trim().toLowerCase().startsWith("bearer ")) {
          copy[key] = `Bearer ${tokenMask}`;
        } else {
          copy[key] = tokenMask;
        }
      } else if (typeof value === "object" && value !== null) {
        copy[key] = maskRecursive(value, depth + 1);
      } else {
        copy[key] = value;
      }
    }
    return copy;
  };

  try {
    return maskRecursive(raw, 0);
  } catch (err) {
    return raw;
  }
};

module.exports = {
  sanitizePayload,
  isJwtString,
  isSensitiveKey,
  isTokenKey,
  DEFAULT_SENSITIVE_KEY_REGEX,
  DEFAULT_TOKEN_KEY_REGEX
};
