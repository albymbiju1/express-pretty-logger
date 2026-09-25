const createPrettyLogger = require('./middleware');
const { sanitizePayload, isJwtString } = require('./sanitizer');
const { ANSI_CODES, createColors } = require('./colors');
const { getMethodBadge, getStatusBadge } = require('./badges');
const { formatPrettyObject, formatTimestamp } = require('./formatter');

// Primary export: middleware factory function
module.exports = createPrettyLogger;

// Named & submodule exports
module.exports.createLogger = createPrettyLogger;
module.exports.expressPrettyLogger = createPrettyLogger;
module.exports.default = createPrettyLogger;
module.exports.sanitizePayload = sanitizePayload;
module.exports.isJwtString = isJwtString;
module.exports.colors = ANSI_CODES;
module.exports.createColors = createColors;
module.exports.getMethodBadge = getMethodBadge;
module.exports.getStatusBadge = getStatusBadge;
module.exports.formatPrettyObject = formatPrettyObject;
module.exports.formatTimestamp = formatTimestamp;
