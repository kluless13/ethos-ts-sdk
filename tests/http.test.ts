import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HTTPClient } from '../src/http';
import { EthosConfig } from '../src/config';
import {
  EthosNotFoundError,
  EthosRateLimitError,
  EthosAuthenticationError,
  EthosAPIError,
} from '../src/errors';

describe('HTTPClient', () => {
  let client: HTTPClient;

  beforeEach(() => {
    client = new HTTPClient(new EthosConfig({ rateLimit: 0, maxRetries: 1 }));
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('get', () => {
    it('should make GET request with correct headers', async () => {
      const mockResponse = { id: 1, name: 'Test' };
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await client.get('/test');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'X-Ethos-Client': 'ethos-ts-sdk',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should include query params', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await client.get('/test', { limit: 10, offset: 0 });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/limit=10/),
        expect.any(Object)
      );
    });

    it('should skip null/undefined params', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await client.get('/test', { limit: 10, offset: undefined, filter: null });

      const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(url).toContain('limit=10');
      expect(url).not.toContain('offset');
      expect(url).not.toContain('filter');
    });
  });

  describe('post', () => {
    it('should make POST request with body', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
      });

      const body = { name: 'Test' };
      await client.post('/test', body);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      );
    });
  });

  describe('error handling', () => {
    it('should throw EthosNotFoundError on 404', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(client.get('/notfound')).rejects.toThrow(EthosNotFoundError);
    });

    it('should throw EthosRateLimitError on 429', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Headers({ 'Retry-After': '60' }),
      });

      await expect(client.get('/test')).rejects.toThrow(EthosRateLimitError);
    });

    it('should throw EthosAuthenticationError on 401', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(client.get('/test')).rejects.toThrow(EthosAuthenticationError);
    });

    it('should throw EthosAuthenticationError on 403', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      await expect(client.get('/test')).rejects.toThrow(EthosAuthenticationError);
    });

    it('should throw EthosAPIError on other errors', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Server error' }),
      });

      await expect(client.get('/test')).rejects.toThrow(EthosAPIError);
    });
  });

  describe('204 response', () => {
    it('should return empty object on 204', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await client.get('/test');
      expect(result).toEqual({});
    });
  });
});
