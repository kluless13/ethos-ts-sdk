/**
 * Tests for Vouches resource
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Vouches } from '../../src/resources/vouches';
import { HTTPClient } from '../../src/http';
import { EthosConfig } from '../../src/config';
import { Vouch } from '../../src/types/vouch';

describe('Vouches', () => {
  let vouches: Vouches;
  let mockHttp: HTTPClient;

  const mockVouchData = {
    id: 456,
    authorProfileId: 100,
    subjectProfileId: 200,
    staked: true,
    archived: false,
    unhealthy: false,
    balance: '1000000000000000000',
    activityCheckpoints: {},
  };

  beforeEach(() => {
    mockHttp = new HTTPClient(
      new EthosConfig({
        baseUrl: 'https://api.test.com',
        rateLimit: 0,
      })
    );
    vouches = new Vouches(mockHttp);
  });

  describe('get', () => {
    it('should fetch vouch by ID', async () => {
      vi.spyOn(mockHttp, 'get').mockResolvedValue(mockVouchData);

      const result = await vouches.get(456);

      expect(mockHttp.get).toHaveBeenCalledWith('/vouches/456');
      expect(result).toBeInstanceOf(Vouch);
      expect(result.id).toBe(456);
    });
  });

  describe('list', () => {
    it('should iterate through vouches', async () => {
      vi.spyOn(mockHttp, 'get')
        .mockResolvedValueOnce({ data: [mockVouchData] })
        .mockResolvedValueOnce({ data: [] });

      const results: Vouch[] = [];
      for await (const vouch of vouches.list({ limit: 1 })) {
        results.push(vouch);
      }

      expect(results).toHaveLength(1);
      expect(results[0]).toBeInstanceOf(Vouch);
    });

    it('should pass filter parameters', async () => {
      vi.spyOn(mockHttp, 'get').mockResolvedValue({ data: [] });

      for await (const _ of vouches.list({
        authorProfileId: 100,
        targetProfileId: 200,
        staked: true,
        archived: false,
      })) {
        // consume
      }

      expect(mockHttp.get).toHaveBeenCalledWith(
        '/vouches',
        expect.objectContaining({
          authorProfileId: 100,
          subjectProfileId: 200,
          staked: true,
          archived: false,
        })
      );
    });
  });

  describe('listAll', () => {
    it('should collect all vouches into array', async () => {
      vi.spyOn(mockHttp, 'get')
        .mockResolvedValueOnce({ data: [mockVouchData] })
        .mockResolvedValueOnce({ data: [] });

      const results = await vouches.listAll({ limit: 1 });

      expect(results).toHaveLength(1);
    });
  });

  describe('forProfile', () => {
    it('should get vouches received by profile', async () => {
      vi.spyOn(mockHttp, 'get')
        .mockResolvedValueOnce({ data: [mockVouchData] })
        .mockResolvedValueOnce({ data: [] });

      const results = await vouches.forProfile(200);

      expect(mockHttp.get).toHaveBeenCalledWith(
        '/vouches',
        expect.objectContaining({ subjectProfileId: 200 })
      );
      expect(results).toHaveLength(1);
    });
  });

  describe('byProfile', () => {
    it('should get vouches given by profile', async () => {
      vi.spyOn(mockHttp, 'get')
        .mockResolvedValueOnce({ data: [mockVouchData] })
        .mockResolvedValueOnce({ data: [] });

      const results = await vouches.byProfile(100);

      expect(mockHttp.get).toHaveBeenCalledWith(
        '/vouches',
        expect.objectContaining({ authorProfileId: 100 })
      );
      expect(results).toHaveLength(1);
    });
  });

  describe('between', () => {
    it('should return vouch between two profiles', async () => {
      vi.spyOn(mockHttp, 'get').mockResolvedValue({ data: [mockVouchData] });

      const result = await vouches.between(100, 200);

      expect(mockHttp.get).toHaveBeenCalledWith(
        '/vouches',
        expect.objectContaining({
          authorProfileId: 100,
          subjectProfileId: 200,
        })
      );
      expect(result).toBeInstanceOf(Vouch);
    });

    it('should return null when no vouch exists', async () => {
      vi.spyOn(mockHttp, 'get').mockResolvedValue({ data: [] });

      const result = await vouches.between(100, 200);

      expect(result).toBeNull();
    });
  });
});
