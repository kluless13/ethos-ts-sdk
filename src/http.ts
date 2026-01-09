/**
 * HTTP client for making API requests.
 */

import { EthosConfig } from './config';
import {
  EthosAPIError,
  EthosNotFoundError,
  EthosRateLimitError,
  EthosAuthenticationError,
} from './errors';

export interface RequestOptions {
  method?: string;
  params?: Record<string, unknown>;
  body?: unknown;
}

/**
 * Low-level HTTP client for Ethos API.
 *
 * Handles request/response, rate limiting, retries, and error handling.
 */
export class HTTPClient {
  private readonly config: EthosConfig;
  private lastRequestTime = 0;

  constructor(config: EthosConfig) {
    this.config = config;
  }

  /**
   * Get default headers for all requests.
   */
  private getDefaultHeaders(): Record<string, string> {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Ethos-Client': this.config.clientName,
    };
  }

  /**
   * Enforce rate limiting between requests.
   */
  private async rateLimit(): Promise<void> {
    const elapsed = Date.now() - this.lastRequestTime;
    if (elapsed < this.config.rateLimit) {
      await this.sleep(this.config.rateLimit - elapsed);
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Sleep for a given number of milliseconds.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Handle error responses from the API.
   */
  private async handleError(response: Response): Promise<never> {
    if (response.status === 404) {
      throw new EthosNotFoundError();
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new EthosRateLimitError(
        'Rate limited',
        retryAfter ? parseInt(retryAfter, 10) : undefined
      );
    }

    if (response.status === 401 || response.status === 403) {
      throw new EthosAuthenticationError();
    }

    let message: string;
    let body: unknown;

    try {
      body = await response.json();
      message =
        (body as Record<string, unknown>)['message']?.toString() ??
        (body as Record<string, unknown>)['error']?.toString() ??
        JSON.stringify(body);
    } catch {
      message = (await response.text()) || `HTTP ${response.status}`;
    }

    throw new EthosAPIError(message, response.status, body);
  }

  /**
   * Build URL with query parameters.
   */
  private buildUrl(path: string, params?: Record<string, unknown>): string {
    const url = new URL(path, this.config.baseUrl);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  /**
   * Make an HTTP request to the API with retries.
   */
  async request<T = unknown>(
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { method = 'GET', params, body } = options;

    let lastError: Error | undefined;

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        await this.rateLimit();

        const url = this.buildUrl(path, params);
        const response = await fetch(url, {
          method,
          headers: this.getDefaultHeaders(),
          body: body ? JSON.stringify(body) : undefined,
          signal: AbortSignal.timeout(this.config.timeout),
        });

        if (!response.ok) {
          await this.handleError(response);
        }

        if (response.status === 204) {
          return {} as T;
        }

        return (await response.json()) as T;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx)
        if (error instanceof EthosAPIError && error.statusCode) {
          if (error.statusCode >= 400 && error.statusCode < 500) {
            throw error;
          }
        }

        // Wait before retrying
        if (attempt < this.config.maxRetries - 1) {
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError;
  }

  /**
   * Make a GET request.
   */
  async get<T = unknown>(
    path: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    return this.request<T>(path, { method: 'GET', params });
  }

  /**
   * Make a POST request.
   */
  async post<T = unknown>(
    path: string,
    body?: unknown,
    params?: Record<string, unknown>
  ): Promise<T> {
    return this.request<T>(path, { method: 'POST', body, params });
  }
}
