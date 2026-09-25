const { createColors } = require('./colors');
const { getMethodBadge, getStatusBadge, getDurationBadge } = require('./badges');
const { sanitizePayload } = require('./sanitizer');
const { formatPrettyObject, formatTimestamp } = require('./formatter');

/**
 * Express pretty logger middleware factory.
 * 
 * @param {object} [options={}]
 * @param {boolean} [options.requestBody=true] - Log incoming request body
 * @param {boolean} [options.responseBody=true] - Log outgoing response payload
 * @param {boolean} [options.query=true] - Log URL query parameters
 * @param {boolean} [options.params=false] - Log route parameters (req.params)
 * @param {boolean|string[]} [options.headers=false] - Log request headers (or list of specific headers)
 * @param {boolean|(() => string)} [options.timestamp=true] - Show timestamp or custom generator
 * @param {number} [options.maxPayloadLength=5000] - Max characters before payload truncation
 * @param {boolean|object} [options.colors=true] - Enable ANSI colors or custom color theme
 * @param {Array<string|RegExp>} [options.sensitiveKeys=[]] - Additional sensitive keys to mask with ***HIDDEN***
 * @param {Array<string|RegExp>} [options.tokenKeys=[]] - Additional token keys to mask with [TOKEN HIDDEN]
 * @param {string} [options.sensitiveMask='***HIDDEN***'] - Mask replacement for passwords/secrets
 * @param {string} [options.tokenMask='[TOKEN HIDDEN]'] - Mask replacement for tokens/JWTs
 * @param {Array<string|RegExp>|((req: any) => boolean)} [options.ignorePaths=[]] - Skip logging for matched paths
 * @param {Function} [options.log=console.log] - Custom log function
 * @param {boolean} [options.showDuration=true] - Show execution time in milliseconds
 * @returns {Function} Express middleware function (req, res, next)
 */
const createPrettyLogger = (options = {}) => {
  const {
    requestBody = true,
    responseBody = true,
    query = true,
    params = false,
    headers = false,
    timestamp = true,
    maxPayloadLength = 5000,
    colors: colorsOption = true,
    customColors = {},
    sensitiveKeys = [],
    tokenKeys = [],
    sensitiveMask = '***HIDDEN***',
    tokenMask = '[TOKEN HIDDEN]',
    ignorePaths = [],
    log = console.log,
    showDuration = true
  } = options;

  const colors = createColors(colorsOption, customColors);
  const c = colors;

  const sanitizeOpts = {
    sensitiveMask,
    tokenMask,
    sensitiveKeys,
    tokenKeys
  };

  /**
   * Helper to check if a request path should be ignored.
   */
  const shouldIgnore = (req) => {
    if (!ignorePaths) return false;
    if (typeof ignorePaths === 'function') {
      try {
        return Boolean(ignorePaths(req));
      } catch (e) {
        return false;
      }
    }
    const pathToCheck = req.originalUrl || req.url || '';
    if (Array.isArray(ignorePaths)) {
      for (const pattern of ignorePaths) {
        if (typeof pattern === 'string' && pathToCheck.startsWith(pattern)) {
          return true;
        }
        if (pattern instanceof RegExp && pattern.test(pathToCheck)) {
          return true;
        }
      }
    }
    return false;
  };

  return function expressPrettyLogger(req, res, next) {
    if (shouldIgnore(req)) {
      return next();
    }

    const start = Date.now();
    const timeBadge = formatTimestamp(timestamp, colors);
    const { method, originalUrl, url, body, query: reqQuery, params: reqParams, headers: reqHeaders } = req;
    const reqPath = originalUrl || url || '/';

    const methodBadge = getMethodBadge(method, colors);

    // Build incoming log block
    const incomingLines = [];
    incomingLines.push(`\n${c.gray}┌──────────────────────────────────────────────────────────┐${c.reset}`);
    incomingLines.push(
      `${c.gray}│${c.reset} ${c.bold}INCOMING REQUEST${c.reset}${timeBadge} ${methodBadge} ${c.cyan}${reqPath}${c.reset}`
    );

    // Optional Headers logging
    if (headers) {
      let headersToLog = {};
      if (Array.isArray(headers)) {
        for (const h of headers) {
          const lower = h.toLowerCase();
          if (reqHeaders && reqHeaders[lower] !== undefined) {
            headersToLog[h] = reqHeaders[lower];
          }
        }
      } else if (reqHeaders) {
        headersToLog = { ...reqHeaders };
      }

      const safeHeaders = sanitizePayload(headersToLog, sanitizeOpts);
      const formattedHeaders = formatPrettyObject(safeHeaders, colors, maxPayloadLength);
      if (formattedHeaders) {
        incomingLines.push(`${c.gray}│ Headers:${c.reset}`);
        incomingLines.push(formattedHeaders);
      }
    }

    // Query Params
    if (query && reqQuery && Object.keys(reqQuery).length > 0) {
      const safeQuery = sanitizePayload(reqQuery, sanitizeOpts);
      const formattedQuery = formatPrettyObject(safeQuery, colors, maxPayloadLength);
      if (formattedQuery) {
        incomingLines.push(`${c.gray}│ Query Params:${c.reset}`);
        incomingLines.push(formattedQuery);
      }
    }

    // Route Params
    if (params && reqParams && Object.keys(reqParams).length > 0) {
      const safeParams = sanitizePayload(reqParams, sanitizeOpts);
      const formattedParams = formatPrettyObject(safeParams, colors, maxPayloadLength);
      if (formattedParams) {
        incomingLines.push(`${c.gray}│ Route Params:${c.reset}`);
        incomingLines.push(formattedParams);
      }
    }

    // Request Body
    if (requestBody && body && Object.keys(body).length > 0) {
      const safeBody = sanitizePayload(body, sanitizeOpts);
      const formattedBody = formatPrettyObject(safeBody, colors, maxPayloadLength);
      if (formattedBody) {
        incomingLines.push(`${c.gray}│ Request Body:${c.reset}`);
        incomingLines.push(formattedBody);
      }
    }

    // Output incoming request box
    log(incomingLines.join('\n'));

    // Intercept response payload safely
    let responsePayload = null;
    let hasCaptured = false;

    if (responseBody) {
      const originalJson = res.json;
      if (typeof originalJson === 'function') {
        res.json = function (data) {
          responsePayload = data;
          hasCaptured = true;
          return originalJson.apply(this, arguments);
        };
      }

      const originalSend = res.send;
      if (typeof originalSend === 'function') {
        res.send = function (data) {
          if (!hasCaptured && data !== undefined) {
            if (typeof data === 'string') {
              try {
                responsePayload = JSON.parse(data);
              } catch (e) {
                responsePayload = data;
              }
            } else {
              responsePayload = data;
            }
            hasCaptured = true;
          }
          return originalSend.apply(this, arguments);
        };
      }
    }

    // Ensure we log outgoing response exactly once
    let hasLoggedResponse = false;

    const logOutgoing = () => {
      if (hasLoggedResponse) return;
      hasLoggedResponse = true;

      const duration = Date.now() - start;
      const status = res.statusCode || 200;
      const statusBadge = getStatusBadge(status, colors);
      const durationBadge = showDuration ? ` ${getDurationBadge(duration, colors)}` : '';

      const outgoingLines = [];
      outgoingLines.push(`${c.gray}├──────────────────────────────────────────────────────────┤${c.reset}`);
      outgoingLines.push(
        `${c.gray}│${c.reset} ${c.bold}OUTGOING RESPONSE${c.reset} ${statusBadge}${durationBadge}`
      );

      if (responseBody) {
        if (responsePayload !== null && responsePayload !== undefined) {
          const safeData = sanitizePayload(responsePayload, sanitizeOpts);
          const formatted = formatPrettyObject(safeData, colors, maxPayloadLength);
          if (formatted) {
            outgoingLines.push(`${c.gray}│ Response Payload:${c.reset}`);
            outgoingLines.push(formatted);
          } else {
            outgoingLines.push(`${c.gray}│ Response Payload:${c.reset} ${c.dim}{}${c.reset}`);
          }
        } else {
          outgoingLines.push(`${c.gray}│ Response Payload:${c.reset} ${c.dim}(None / Empty response)${c.reset}`);
        }
      }

      outgoingLines.push(`${c.gray}└──────────────────────────────────────────────────────────┘${c.reset}\n`);
      log(outgoingLines.join('\n'));
    };

    res.once('finish', logOutgoing);
    res.once('close', logOutgoing);

    next();
  };
};

module.exports = createPrettyLogger;
