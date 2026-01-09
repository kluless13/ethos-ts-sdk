/**
 * Tests for Score type
 */

import { describe, it, expect } from 'vitest';
import { Score, ScoreData } from '../../src/types/score';

describe('Score', () => {
  const mockScoreData: ScoreData = {
    profileId: 123,
    address: '0x1234567890abcdef1234567890abcdef12345678',
    value: 1650,
    breakdown: {
      reviews: 200,
      vouches: 300,
      attestations: 150,
      activity: 500,
      history: 500,
    },
    percentile: 85.5,
    updatedAt: '2024-01-15T10:30:00Z',
  };

  describe('constructor', () => {
    it('should create score from data', () => {
      const score = new Score(mockScoreData);

      expect(score.profileId).toBe(123);
      expect(score.address).toBe(
        '0x1234567890abcdef1234567890abcdef12345678'
      );
      expect(score.value).toBe(1650);
      expect(score.percentile).toBe(85.5);
    });

    it('should handle breakdown', () => {
      const score = new Score(mockScoreData);

      expect(score.breakdown.reviews).toBe(200);
      expect(score.breakdown.vouches).toBe(300);
      expect(score.breakdown.attestations).toBe(150);
      expect(score.breakdown.activity).toBe(500);
      expect(score.breakdown.history).toBe(500);
    });

    it('should handle missing optional fields', () => {
      const minimalData: ScoreData = {
        profileId: 1,
        value: 1200,
        breakdown: {
          reviews: 0,
          vouches: 0,
          attestations: 0,
          activity: 0,
          history: 0,
        },
      };

      const score = new Score(minimalData);

      expect(score.address).toBeUndefined();
      expect(score.percentile).toBeUndefined();
      expect(score.updatedAt).toBeUndefined();
    });

    it('should parse updatedAt as Date', () => {
      const score = new Score(mockScoreData);

      expect(score.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('level', () => {
    it('should return untrusted for value < 800', () => {
      const data = { ...mockScoreData, value: 500 };
      expect(new Score(data).level).toBe('untrusted');
    });

    it('should return questionable for value 800-1199', () => {
      const data = { ...mockScoreData, value: 1000 };
      expect(new Score(data).level).toBe('questionable');
    });

    it('should return neutral for value 1200-1599', () => {
      const data = { ...mockScoreData, value: 1400 };
      expect(new Score(data).level).toBe('neutral');
    });

    it('should return reputable for value 1600-1999', () => {
      const data = { ...mockScoreData, value: 1800 };
      expect(new Score(data).level).toBe('reputable');
    });

    it('should return exemplary for value >= 2000', () => {
      const data = { ...mockScoreData, value: 2500 };
      expect(new Score(data).level).toBe('exemplary');
    });

    it('should handle boundary at 800', () => {
      const data = { ...mockScoreData, value: 800 };
      expect(new Score(data).level).toBe('questionable');
    });

    it('should handle boundary at 1200', () => {
      const data = { ...mockScoreData, value: 1200 };
      expect(new Score(data).level).toBe('neutral');
    });

    it('should handle boundary at 1600', () => {
      const data = { ...mockScoreData, value: 1600 };
      expect(new Score(data).level).toBe('reputable');
    });

    it('should handle boundary at 2000', () => {
      const data = { ...mockScoreData, value: 2000 };
      expect(new Score(data).level).toBe('exemplary');
    });
  });

  describe('isTrusted', () => {
    it('should return true for value >= 1600', () => {
      const score = new Score(mockScoreData);

      expect(score.isTrusted).toBe(true);
    });

    it('should return true at boundary 1600', () => {
      const data = { ...mockScoreData, value: 1600 };
      const score = new Score(data);

      expect(score.isTrusted).toBe(true);
    });

    it('should return false for value < 1600', () => {
      const data = { ...mockScoreData, value: 1500 };
      const score = new Score(data);

      expect(score.isTrusted).toBe(false);
    });
  });

  describe('isUntrusted', () => {
    it('should return true for value < 800', () => {
      const data = { ...mockScoreData, value: 500 };
      const score = new Score(data);

      expect(score.isUntrusted).toBe(true);
    });

    it('should return false at boundary 800', () => {
      const data = { ...mockScoreData, value: 800 };
      const score = new Score(data);

      expect(score.isUntrusted).toBe(false);
    });

    it('should return false for value >= 800', () => {
      const score = new Score(mockScoreData);

      expect(score.isUntrusted).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should convert to plain object', () => {
      const score = new Score(mockScoreData);
      const json = score.toJSON();

      expect(json.profileId).toBe(123);
      expect(json.value).toBe(1650);
      expect(json.breakdown.reviews).toBe(200);
      expect(json.updatedAt).toBe('2024-01-15T10:30:00.000Z');
    });
  });
});
