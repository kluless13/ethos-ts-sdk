/**
 * Tests for Scores resource
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Scores } from '../../src/resources/scores';
import { HTTPClient } from '../../src/http';
import { EthosConfig } from '../../src/config';
import { Score } from '../../src/types/score';

describe('Scores', () => {
  let scores: Scores;
  let mockHttp: HTTPClient;

  const mockScoreData = {
    profileId: 123,
    address: '0x1234',
    value: 1650,
    breakdown: {
      reviews: 200,
      vouches: 300,
      attestations: 150,
      activity: 500,
      history: 500,
    },
    percentile: 85,
  };

  beforeEach(() => {
    mockHttp = new HTTPClient(
      new EthosConfig({
        baseUrl: 'https://api.test.com',
        rateLimit: 0,
      })
    );
    scores = new Scores(mockHttp);
  });

  describe('get', () => {
    it('should fetch score by address', async () => {
      vi.spyOn(mockHttp, 'get').mockResolvedValue(mockScoreData);

      const result = await scores.get('0x1234');

      expect(mockHttp.get).toHaveBeenCalledWith('/score/0x1234');
      expect(result).toBeInstanceOf(Score);
      expect(result.value).toBe(1650);
    });
  });

  describe('getByProfile', () => {
    it('should fetch score by profile ID', async () => {
      vi.spyOn(mockHttp, 'get').mockResolvedValue(mockScoreData);

      const result = await scores.getByProfile(123);

      expect(mockHttp.get).toHaveBeenCalledWith('/score/profile/123');
      expect(result).toBeInstanceOf(Score);
    });
  });

  describe('breakdown', () => {
    it('should fetch detailed score breakdown', async () => {
      vi.spyOn(mockHttp, 'get').mockResolvedValue(mockScoreData);

      const result = await scores.breakdown('0x1234');

      expect(mockHttp.get).toHaveBeenCalledWith('/score/0x1234/breakdown');
      expect(result).toBeInstanceOf(Score);
      expect(result.breakdown.reviews).toBe(200);
    });
  });
});
