/**
 * Markets resource for Ethos API.
 */

import { HTTPClient } from '../http';
import { Market, MarketData } from '../types/market';
import { BaseResource } from './base';

export interface MarketsListParams {
  isActive?: boolean;
  orderBy?: string;
  limit?: number;
}

/**
 * Markets API resource.
 *
 * Access reputation markets for trading trust/distrust.
 */
export class Markets extends BaseResource<Market, MarketData> {
  protected readonly path = '/markets';

  constructor(http: HTTPClient) {
    super(http);
  }

  protected parseItem(data: MarketData): Market {
    return new Market(data);
  }

  /**
   * Get a market by ID.
   */
  async get(marketId: number): Promise<Market> {
    const data = await this.http.get<MarketData>(`${this.path}/${marketId}`);
    return this.parseItem(data);
  }

  /**
   * Get the market for a profile.
   */
  async getByProfile(profileId: number): Promise<Market> {
    const data = await this.http.get<MarketData>(
      `${this.path}/profile/${profileId}`
    );
    return this.parseItem(data);
  }

  /**
   * Async generator for listing markets with optional filtering.
   */
  async *list(params: MarketsListParams = {}): AsyncGenerator<Market> {
    const queryParams: Record<string, unknown> = {};

    if (params.isActive !== undefined) {
      queryParams['isActive'] = params.isActive;
    }
    if (params.orderBy !== undefined) {
      queryParams['orderBy'] = params.orderBy;
    }

    yield* this.paginate(this.path, queryParams, params.limit ?? 100);
  }

  /**
   * Get all markets as array.
   */
  async listAll(params: MarketsListParams = {}): Promise<Market[]> {
    return this.collectAll(this.list(params));
  }

  /**
   * Get top markets by trading volume.
   */
  async topByVolume(limit = 20): Promise<Market[]> {
    const markets = await this.listAll({ orderBy: 'totalVolume', limit });
    return markets
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, limit);
  }

  /**
   * Get markets with highest trust prices.
   */
  async mostTrusted(limit = 20): Promise<Market[]> {
    const markets = await this.listAll({ limit: limit * 2 });
    return markets.sort((a, b) => b.trustPrice - a.trustPrice).slice(0, limit);
  }

  /**
   * Get markets with highest distrust prices.
   */
  async mostDistrusted(limit = 20): Promise<Market[]> {
    const markets = await this.listAll({ limit: limit * 2 });
    return markets
      .sort((a, b) => b.distrustPrice - a.distrustPrice)
      .slice(0, limit);
  }
}
