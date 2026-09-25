/**
 * ANSI escape codes for terminal styling.
 */
const ANSI_CODES = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',

  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',

  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
  bgGray: '\x1b[100m'
};

/**
 * Returns whether ANSI colors should be enabled based on environment & options.
 * @param {boolean|object} [colorOption=true]
 * @returns {boolean}
 */
const shouldEnableColors = (colorOption = true) => {
  if (colorOption === false) return false;
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.NO_COLOR !== undefined && process.env.NO_COLOR !== '') {
      return false;
    }
    if (process.env.NODE_DISABLE_COLORS === '1') {
      return false;
    }
  }
  return true;
};

/**
 * Creates a colors object that will either output ANSI codes or empty strings if disabled.
 * @param {boolean|object} [enabled=true]
 * @param {object} [customTheme={}]
 * @returns {Record<string, string>}
 */
const createColors = (enabled = true, customTheme = {}) => {
  const isEnabled = shouldEnableColors(enabled);

  const colors = {};
  for (const key of Object.keys(ANSI_CODES)) {
    colors[key] = isEnabled ? (customTheme[key] || ANSI_CODES[key]) : '';
  }

  return colors;
};

module.exports = {
  ANSI_CODES,
  shouldEnableColors,
  createColors
};
