/**
 * Formats a JavaScript value or object into an indented, ANSI-styled block.
 * Truncates output if it exceeds maxPayloadLength.
 * 
 * @param {any} obj - Object or primitive to format
 * @param {Record<string, string>} colors
 * @param {number|false} [maxPayloadLength=Infinity]
 * @returns {string|null}
 */
const formatPrettyObject = (obj, colors, maxPayloadLength = Infinity) => {
  if (obj === null || obj === undefined) return null;
  if (typeof obj === 'object' && Object.keys(obj).length === 0) return null;

  const c = colors;
  let formatted = '';

  try {
    if (typeof obj === 'string') {
      formatted = obj;
    } else {
      formatted = JSON.stringify(obj, null, 2);
    }
  } catch (e) {
    formatted = String(obj);
  }

  // Truncate if maximum payload length exceeded
  let isTruncated = false;
  if (
    typeof maxPayloadLength === 'number' &&
    maxPayloadLength > 0 &&
    Number.isFinite(maxPayloadLength) &&
    formatted.length > maxPayloadLength
  ) {
    formatted = formatted.slice(0, maxPayloadLength);
    isTruncated = true;
  }

  const lines = formatted.split('\n').map((line) => {
    return `${c.gray}│${c.reset}   ${c.dim}${line}${c.reset}`;
  });

  if (isTruncated) {
    lines.push(
      `${c.gray}│${c.reset}   ${c.yellow}${c.dim}... [TRUNCATED - Exceeded ${maxPayloadLength} characters]${c.reset}`
    );
  }

  return lines.join('\n');
};

/**
 * Returns a formatted timestamp string.
 * @param {boolean|(() => string)} [timestampOption=true]
 * @param {Record<string, string>} colors
 * @returns {string}
 */
const formatTimestamp = (timestampOption = true, colors) => {
  if (!timestampOption) return '';
  const c = colors;
  let timeStr = '';

  if (typeof timestampOption === 'function') {
    try {
      timeStr = timestampOption();
    } catch (e) {
      timeStr = new Date().toLocaleTimeString();
    }
  } else {
    timeStr = new Date().toLocaleTimeString();
  }

  return ` ${c.gray}[${timeStr}]${c.reset}`;
};

module.exports = {
  formatPrettyObject,
  formatTimestamp
};
