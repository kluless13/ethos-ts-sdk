/**
 * Ethos SDK Errors
 *
 * Custom error classes for handling API errors.
 */

/**
 * Base error for all Ethos SDK errors.
 */
export class EthosError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EthosError';
    Object.setPrototypeOf(this, EthosError.prototype);
  }
}

/**
 * Error thrown when the API returns an error response.
 */
export class EthosAPIError extends EthosError {
  readonly statusCode?: number;
  readonly responseBody?: unknown;

  constructor(
    message: string,
    statusCode?: number,
    responseBody?: unknown
  ) {
    super(message);
    this.name = 'EthosAPIError';
    this.statusCode = statusCode;
    this.responseBody = responseBody;
    Object.setPrototypeOf(this, EthosAPIError.prototype);
  }

  override toString(): string {
    if (this.statusCode) {
      return `[${this.statusCode}] ${this.message}`;
    }
    return this.message;
  }
}

/**
 * Error thrown when a resource is not found (404).
 */
export class EthosNotFoundError extends EthosAPIError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'EthosNotFoundError';
    Object.setPrototypeOf(this, EthosNotFoundError.prototype);
  }
}

/**
 * Error thrown when rate limited by the API (429).
 */
export class EthosRateLimitError extends EthosAPIError {
  readonly retryAfter?: number;

  constructor(message = 'Rate limited', retryAfter?: number) {
    super(message, 429);
    this.name = 'EthosRateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, EthosRateLimitError.prototype);
  }
}

/**
 * Error thrown when request validation fails.
 */
export class EthosValidationError extends EthosError {
  readonly errors: Array<Record<string, unknown>>;

  constructor(message: string, errors: Array<Record<string, unknown>> = []) {
    super(message);
    this.name = 'EthosValidationError';
    this.errors = errors;
    Object.setPrototypeOf(this, EthosValidationError.prototype);
  }
}

/**
 * Error thrown when authentication fails (401/403).
 */
export class EthosAuthenticationError extends EthosAPIError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'EthosAuthenticationError';
    Object.setPrototypeOf(this, EthosAuthenticationError.prototype);
  }
}
