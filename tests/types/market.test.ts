/**
 * Tests for Market type
 */

import { describe, it, expect } from 'vitest';
import { Market, MarketData } from '../../src/types/market';

describe('Market', () => {
  const mockMarketData: MarketData = {
    id: 123,
    profileId: 456,
    trustVotes: 100,
    distrustVotes: 50,
    trustPrice: 0.67,
    distrustPrice: 0.33,
    totalVolume: 1500.5,
    liquidityParameter: 100,
    isActive: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T15:45:00Z',
  };

  describe('constructor', () => {
    it('should create market from data', () => {
      const market = new Market(mockMarketData);

      expect(market.id).toBe(123);
      expect(market.profileId).toBe(456);
      expect(market.trustVotes).toBe(100);
      expect(market.distrustVotes).toBe(50);
      expect(market.trustPrice).toBe(0.67);
      expect(market.distrustPrice).toBe(0.33);
      expect(market.totalVolume).toBe(1500.5);
    });

    it('should handle default values', () => {
      const minimalData: MarketData = {
        id: 1,
        profileId: 10,
        trustVotes: 0,
        distrustVotes: 0,
        trustPrice: 0.5,
        distrustPrice: 0.5,
        totalVolume: 0,
        isActive: true,
      };

      const market = new Market(minimalData);

      expect(market.liquidityParameter).toBeUndefined();
      expect(market.createdAt).toBeUndefined();
    });

    it('should parse dates', () => {
      const market = new Market(mockMarketData);

      expect(market.createdAt).toBeInstanceOf(Date);
      expect(market.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('trustPercentage', () => {
    it('should convert trust price to percentage', () => {
      const market = new Market(mockMarketData);

      expect(market.trustPercentage).toBe(67);
    });

    it('should handle 50/50 market', () => {
      const data = { ...mockMarketData, trustPrice: 0.5 };
      const market = new Market(data);

      expect(market.trustPercentage).toBe(50);
    });
  });

  describe('distrustPercentage', () => {
    it('should convert distrust price to percentage', () => {
      const market = new Market(mockMarketData);

      expect(market.distrustPercentage).toBe(33);
    });
  });

  describe('marketSentiment', () => {
    it('should return bullish when trust > 60%', () => {
      const data = { ...mockMarketData, trustPrice: 0.65, distrustPrice: 0.35 };
      const market = new Market(data);

      expect(market.marketSentiment).toBe('bullish');
    });

    it('should return bearish when distrust > 60%', () => {
      const data = { ...mockMarketData, trustPrice: 0.35, distrustPrice: 0.65 };
      const market = new Market(data);

      expect(market.marketSentiment).toBe('bearish');
    });

    it('should return neutral when neither > 60%', () => {
      const data = { ...mockMarketData, trustPrice: 0.55, distrustPrice: 0.45 };
      const market = new Market(data);

      expect(market.marketSentiment).toBe('neutral');
    });

    it('should return neutral at exactly 60%', () => {
      const data = { ...mockMarketData, trustPrice: 0.6, distrustPrice: 0.4 };
      const market = new Market(data);

      expect(market.marketSentiment).toBe('neutral');
    });
  });

  describe('isVolatile', () => {
    it('should return true when trust is between 40% and 60%', () => {
      const data = { ...mockMarketData, trustPrice: 0.5 };
      const market = new Market(data);

      expect(market.isVolatile).toBe(true);
    });

    it('should return true at boundary 40%', () => {
      const data = { ...mockMarketData, trustPrice: 0.4 };
      const market = new Market(data);

      expect(market.isVolatile).toBe(true);
    });

    it('should return true at boundary 60%', () => {
      const data = { ...mockMarketData, trustPrice: 0.6 };
      const market = new Market(data);

      expect(market.isVolatile).toBe(true);
    });

    it('should return false when trust > 60%', () => {
      const data = { ...mockMarketData, trustPrice: 0.7 };
      const market = new Market(data);

      expect(market.isVolatile).toBe(false);
    });

    it('should return false when trust < 40%', () => {
      const data = { ...mockMarketData, trustPrice: 0.3 };
      const market = new Market(data);

      expect(market.isVolatile).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should convert to plain object', () => {
      const market = new Market(mockMarketData);
      const json = market.toJSON();

      expect(json.id).toBe(123);
      expect(json.trustPrice).toBe(0.67);
      expect(json.totalVolume).toBe(1500.5);
      expect(json.createdAt).toBe('2024-01-15T10:30:00.000Z');
    });
  });
});
