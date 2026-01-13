/**
 * Tests for Markets resource
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Markets } from '../../src/resources/markets';
import { HTTPClient } from '../../src/http';
import { EthosConfig } from '../../src/config';
import { Market } from '../../src/types/market';

describe('Markets', () => {
  let markets: Markets;
  let mockHttp: HTTPClient;

  const mockMarketData = {
    id: 123,
    profileId: 456,
    trustVotes: 100,
    distrustVotes: 50,
    trustPrice: 0.67,
    distrustPrice: 0.33,
    totalVolume: 1500,
    isActive: true,
  };

  beforeEach(() => {
    mockHttp = new HTTPClient(
      new EthosConfig({
        baseUrl: 'https://api.test.com',
        rateLimit: 0,
      })
    );
    markets = new Markets(mockHttp);
  });

  describe('get', () => {
    it('should fetch market by ID', async () => {
      vi.spyOn(mockHttp, 'get').mockResolvedValue(mockMarketData);

      const result = await markets.get(123);

      expect(mockHttp.get).toHaveBeenCalledWith('/markets/123');
      expect(result).toBeInstanceOf(Market);
      expect(result.id).toBe(123);
    });
  });

  describe('getByProfile', () => {
    it('should fetch market by profile ID', async () => {
      vi.spyOn(mockHttp, 'get').mockResolvedValue(mockMarketData);

      const result = await markets.getByProfile(456);

      expect(mockHttp.get).toHaveBeenCalledWith('/markets/profile/456');
      expect(result).toBeInstanceOf(Market);
    });
  });

  describe('list', () => {
    it('should iterate through markets', async () => {
      vi.spyOn(mockHttp, 'get')
        .mockResolvedValueOnce({ data: [mockMarketData] })
        .mockResolvedValueOnce({ data: [] });

      const results: Market[] = [];
      for await (const market of markets.list({ limit: 1 })) {
        results.push(market);
      }

      expect(results).toHaveLength(1);
      expect(results[0]).toBeInstanceOf(Market);
    });

    it('should pass filter parameters', async () => {
      vi.spyOn(mockHttp, 'get').mockResolvedValue({ data: [] });

      for await (const _ of markets.list({
        isActive: true,
      })) {
        // consume
      }

      expect(mockHttp.get).toHaveBeenCalledWith(
        '/markets',
        expect.objectContaining({
          isActive: true,
        })
      );
    });
  });

  describe('topByVolume', () => {
    it('should get markets sorted by volume', async () => {
      const markets2 = { ...mockMarketData, id: 124, totalVolume: 2000 };
      vi.spyOn(mockHttp, 'get')
        .mockResolvedValueOnce({ data: [mockMarketData, markets2] })
        .mockResolvedValueOnce({ data: [] });

      const results = await markets.topByVolume(2);

      expect(results).toHaveLength(2);
      expect(results[0].totalVolume).toBe(2000);
      expect(results[1].totalVolume).toBe(1500);
    });
  });

  describe('mostTrusted', () => {
    it('should get markets sorted by trust price', async () => {
      const highTrust = { ...mockMarketData, id: 124, trustPrice: 0.9 };
      vi.spyOn(mockHttp, 'get')
        .mockResolvedValueOnce({ data: [mockMarketData, highTrust] })
        .mockResolvedValueOnce({ data: [] });

      const results = await markets.mostTrusted(2);

      expect(results).toHaveLength(2);
      expect(results[0].trustPrice).toBe(0.9);
    });
  });

  describe('mostDistrusted', () => {
    it('should get markets sorted by distrust price', async () => {
      const highDistrust = { ...mockMarketData, id: 124, distrustPrice: 0.8 };
      vi.spyOn(mockHttp, 'get')
        .mockResolvedValueOnce({ data: [mockMarketData, highDistrust] })
        .mockResolvedValueOnce({ data: [] });

      const results = await markets.mostDistrusted(2);

      expect(results).toHaveLength(2);
      expect(results[0].distrustPrice).toBe(0.8);
    });
  });
});
