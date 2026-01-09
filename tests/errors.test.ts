import { describe, it, expect } from 'vitest';
import {
  EthosError,
  EthosAPIError,
  EthosNotFoundError,
  EthosRateLimitError,
  EthosValidationError,
  EthosAuthenticationError,
} from '../src/errors';

describe('EthosError', () => {
  it('should create error with message', () => {
    const error = new EthosError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('EthosError');
    expect(error instanceof Error).toBe(true);
  });
});

describe('EthosAPIError', () => {
  it('should create error with message only', () => {
    const error = new EthosAPIError('API error');
    expect(error.message).toBe('API error');
    expect(error.statusCode).toBeUndefined();
    expect(error.responseBody).toBeUndefined();
  });

  it('should create error with status code', () => {
    const error = new EthosAPIError('Server error', 500);
    expect(error.statusCode).toBe(500);
  });

  it('should create error with response body', () => {
    const body = { detail: 'Error details' };
    const error = new EthosAPIError('Error', 400, body);
    expect(error.responseBody).toEqual(body);
  });

  it('should format toString with status code', () => {
    const error = new EthosAPIError('Bad request', 400);
    expect(error.toString()).toBe('[400] Bad request');
  });

  it('should format toString without status code', () => {
    const error = new EthosAPIError('Unknown error');
    expect(error.toString()).toBe('Unknown error');
  });
});

describe('EthosNotFoundError', () => {
  it('should have default message', () => {
    const error = new EthosNotFoundError();
    expect(error.message).toBe('Resource not found');
    expect(error.statusCode).toBe(404);
  });

  it('should accept custom message', () => {
    const error = new EthosNotFoundError('Profile not found');
    expect(error.message).toBe('Profile not found');
  });
});

describe('EthosRateLimitError', () => {
  it('should have default message', () => {
    const error = new EthosRateLimitError();
    expect(error.message).toBe('Rate limited');
    expect(error.statusCode).toBe(429);
    expect(error.retryAfter).toBeUndefined();
  });

  it('should accept retry after', () => {
    const error = new EthosRateLimitError('Too many requests', 60);
    expect(error.retryAfter).toBe(60);
  });
});

describe('EthosValidationError', () => {
  it('should create with message', () => {
    const error = new EthosValidationError('Invalid input');
    expect(error.message).toBe('Invalid input');
    expect(error.errors).toEqual([]);
  });

  it('should accept errors array', () => {
    const errors = [{ field: 'email', error: 'Invalid format' }];
    const error = new EthosValidationError('Validation failed', errors);
    expect(error.errors).toEqual(errors);
  });
});

describe('EthosAuthenticationError', () => {
  it('should have default message', () => {
    const error = new EthosAuthenticationError();
    expect(error.message).toBe('Authentication failed');
    expect(error.statusCode).toBe(401);
  });
});
