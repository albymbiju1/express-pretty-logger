import { Request, Response, NextFunction } from 'express';

export interface LoggerOptions {
  /**
   * Log incoming request body.
   * @default true
   */
  requestBody?: boolean;

  /**
   * Log outgoing response payload.
   * @default true
   */
  responseBody?: boolean;

  /**
   * Log URL query parameters (req.query).
   * @default true
   */
  query?: boolean;

  /**
   * Log route parameters (req.params).
   * @default false
   */
  params?: boolean;

  /**
   * Log request headers or specific header fields.
   * @default false
   */
  headers?: boolean | string[];

  /**
   * Display timestamp in the request header, or provide a custom function.
   * @default true
   */
  timestamp?: boolean | (() => string);

  /**
   * Maximum character length for payload stringification before truncating.
   * @default 5000
   */
  maxPayloadLength?: number;

  /**
   * Enable ANSI colors or pass a custom color mapping. Set to false to disable styling.
   * @default true
   */
  colors?: boolean | Record<string, string>;

  /**
   * Custom color overrides.
   */
  customColors?: Record<string, string>;

  /**
   * Additional field names or RegExps to mask with ***HIDDEN***.
   */
  sensitiveKeys?: (string | RegExp)[];

  /**
   * Additional token field names or RegExps to mask with [TOKEN HIDDEN].
   */
  tokenKeys?: (string | RegExp)[];

  /**
   * Mask string used for sensitive values like passwords.
   * @default "***HIDDEN***"
   */
  sensitiveMask?: string;

  /**
   * Mask string used for JWT tokens and auth headers.
   * @default "[TOKEN HIDDEN]"
   */
  tokenMask?: string;

  /**
   * Paths or predicate function to skip logging (e.g. ['/health', '/metrics']).
   */
  ignorePaths?: (string | RegExp)[] | ((req: Request) => boolean);

  /**
   * Custom log output function.
   * @default console.log
   */
  log?: (message: string) => void;

  /**
   * Show response execution time in milliseconds.
   * @default true
   */
  showDuration?: boolean;
}

export type ExpressPrettyLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

/**
 * Creates an Express middleware for pretty terminal logging.
 */
export function createLogger(options?: LoggerOptions): ExpressPrettyLoggerMiddleware;
export function expressPrettyLogger(options?: LoggerOptions): ExpressPrettyLoggerMiddleware;
declare function logger(options?: LoggerOptions): ExpressPrettyLoggerMiddleware;
export default logger;

/**
 * Sanitizes an object or payload by recursively masking sensitive keys and tokens.
 */
export function sanitizePayload<T = any>(
  raw: T,
  options?: {
    sensitiveMask?: string;
    tokenMask?: string;
    sensitiveKeys?: (string | RegExp)[];
    tokenKeys?: (string | RegExp)[];
    maxDepth?: number;
  }
): T;

/**
 * Checks if a string has the structure of a JSON Web Token.
 */
export function isJwtString(val: any): boolean;

export const colors: Record<string, string>;
