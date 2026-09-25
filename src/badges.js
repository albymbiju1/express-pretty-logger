/**
 * Returns formatted HTTP method badge with ANSI styling.
 * @param {string} method - HTTP method (e.g. GET, POST)
 * @param {Record<string, string>} colors
 * @returns {string}
 */
const getMethodBadge = (method = 'GET', colors) => {
  const m = String(method).toUpperCase();
  const c = colors;
  switch (m) {
    case 'GET':
      return `${c.green}${c.bold} GET ${c.reset}`;
    case 'POST':
      return `${c.cyan}${c.bold} POST ${c.reset}`;
    case 'PATCH':
      return `${c.yellow}${c.bold} PATCH ${c.reset}`;
    case 'PUT':
      return `${c.blue}${c.bold} PUT ${c.reset}`;
    case 'DELETE':
      return `${c.red}${c.bold} DELETE ${c.reset}`;
    case 'OPTIONS':
    case 'HEAD':
      return `${c.magenta}${c.bold} ${m} ${c.reset}`;
    default:
      return `${c.magenta}${c.bold} ${m} ${c.reset}`;
  }
};

/**
 * Standard HTTP Status Code text map.
 */
const STATUS_TEXTS = {
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  204: 'No Content',
  301: 'Moved Permanently',
  302: 'Found',
  304: 'Not Modified',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout'
};

/**
 * Returns formatted HTTP status badge with icon and styling.
 * @param {number} status - HTTP status code
 * @param {Record<string, string>} colors
 * @returns {string}
 */
const getStatusBadge = (status = 200, colors) => {
  const code = Number(status) || 200;
  const c = colors;
  const text = STATUS_TEXTS[code] ? ` ${STATUS_TEXTS[code]}` : '';

  if (code >= 200 && code < 300) {
    return `${c.green}${c.bold}🟢 ${code}${text}${c.reset}`;
  }
  if (code >= 300 && code < 400) {
    return `${c.cyan}${c.bold}🔵 ${code}${text || ' Redirect'}${c.reset}`;
  }
  if (code >= 400 && code < 500) {
    return `${c.yellow}${c.bold}🟡 ${code}${text || ' Client Error'}${c.reset}`;
  }
  return `${c.red}${c.bold}🔴 ${code}${text || ' Server Error'}${c.reset}`;
};

/**
 * Formats response duration with color indicator.
 * @param {number} durationMs - Duration in milliseconds
 * @param {Record<string, string>} colors
 * @returns {string}
 */
const getDurationBadge = (durationMs, colors) => {
  const c = colors;
  const duration = Math.max(0, Math.round(durationMs));
  const timeColor = duration < 100 ? c.green : duration < 300 ? c.yellow : c.red;
  return `${c.gray}in${c.reset} ${timeColor}${duration}ms${c.reset}`;
};

module.exports = {
  getMethodBadge,
  getStatusBadge,
  getDurationBadge,
  STATUS_TEXTS
};
