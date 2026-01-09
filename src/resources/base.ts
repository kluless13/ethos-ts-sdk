/**
 * Base resource class for API endpoints.
 */

import { HTTPClient } from '../http';

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Base class for API resources.
 *
 * Provides common functionality for pagination, parsing, etc.
 */
export abstract class BaseResource<T, TData> {
  protected readonly http: HTTPClient;
  protected abstract readonly path: string;

  constructor(http: HTTPClient) {
    this.http = http;
  }

  /**
   * Parse a single item from API response.
   */
  protected abstract parseItem(data: TData): T;

  /**
   * Parse a list of items from API response.
   */
  protected parseList(data: TData[]): T[] {
    return data.map((item) => this.parseItem(item));
  }

  /**
   * Extract items from various response formats.
   */
  protected extractItems(response: unknown): TData[] {
    if (Array.isArray(response)) {
      return response as TData[];
    }
    const obj = response as Record<string, unknown>;
    if (obj['data'] && Array.isArray(obj['data'])) {
      return obj['data'] as TData[];
    }
    if (obj['values'] && Array.isArray(obj['values'])) {
      return obj['values'] as TData[];
    }
    if (obj['results'] && Array.isArray(obj['results'])) {
      return obj['results'] as TData[];
    }
    return [];
  }

  /**
   * Async generator for paginating through all results.
   */
  protected async *paginate(
    path: string,
    params: Record<string, unknown> = {},
    limit = 100
  ): AsyncGenerator<T, void, unknown> {
    let offset = 0;

    while (true) {
      const response = await this.http.get<unknown>(path, {
        ...params,
        limit,
        offset,
      });

      const items = this.extractItems(response);

      if (items.length === 0) {
        break;
      }

      for (const item of items) {
        yield this.parseItem(item);
      }

      if (items.length < limit) {
        break;
      }

      offset += limit;
    }
  }

  /**
   * Collect all items from async generator into array.
   */
  protected async collectAll(
    generator: AsyncGenerator<T, void, unknown>
  ): Promise<T[]> {
    const items: T[] = [];
    for await (const item of generator) {
      items.push(item);
    }
    return items;
  }
}
