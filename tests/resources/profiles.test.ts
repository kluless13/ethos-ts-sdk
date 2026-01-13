/**
 * Tests for Profiles resource
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Profiles } from '../../src/resources/profiles';
import { HTTPClient } from '../../src/http';
import { EthosConfig } from '../../src/config';
import { Profile } from '../../src/types/profile';

describe('Profiles', () => {
  let profiles: Profiles;
  let mockHttp: HTTPClient;

  const mockProfileData = {
    id: 123,
    profileId: 123,
    address: '0x1234',
    displayName: 'Test User',
    score: 1650,
    status: 'ACTIVE',
    userkeys: ['x.com/user/testuser'],
    xpTotal: 100,
    xpStreakDays: 5,
    xpRemovedDueToAbuse: false,
    influenceFactor: 0.5,
    influenceFactorPercentile: 50,
    links: {},
    stats: {
      review: { received: { positive: 10, neutral: 2, negative: 1 } },
      vouch: {
        given: { count: 5, amountWeiTotal: 0 },
        received: { count: 8, amountWeiTotal: 0 },
      },
    },
  };

  beforeEach(() => {
    mockHttp = new HTTPClient(
      new EthosConfig({
        baseUrl: 'https://api.test.com',
        rateLimit: 0,
      })
    );
    profiles = new Profiles(mockHttp);
  });

  describe('get', () => {
    it('should fetch profile by ID', async () => {
      vi.spyOn(mockHttp, 'get').mockResolvedValue(mockProfileData);

      const result = await profiles.get(123);

      expect(mockHttp.get).toHaveBeenCalledWith('/profiles/123');
      expect(result).toBeInstanceOf(Profile);
      expect(result.id).toBe(123);
    });
  });

  describe('getByAddress', () => {
    it('should fetch profile by address', async () => {
      vi.spyOn(mockHttp, 'get').mockResolvedValue(mockProfileData);

      const result = await profiles.getByAddress('0x1234');

      expect(mockHttp.get).toHaveBeenCalledWith('/profiles/address/0x1234');
      expect(result).toBeInstanceOf(Profile);
    });
  });

  describe('getByTwitter', () => {
    it('should fetch profile by Twitter handle', async () => {
      vi.spyOn(mockHttp, 'get').mockResolvedValue(mockProfileData);

      const result = await profiles.getByTwitter('testuser');

      expect(mockHttp.get).toHaveBeenCalledWith('/user/by/x/testuser');
      expect(result).toBeInstanceOf(Profile);
    });

    it('should strip @ from handle', async () => {
      vi.spyOn(mockHttp, 'get').mockResolvedValue(mockProfileData);

      await profiles.getByTwitter('@testuser');

      expect(mockHttp.get).toHaveBeenCalledWith('/user/by/x/testuser');
    });
  });

  describe('getByUserkey', () => {
    it('should fetch profile by userkey', async () => {
      vi.spyOn(mockHttp, 'get').mockResolvedValue(mockProfileData);

      await profiles.getByUserkey('farcaster.xyz/user/fid/12345');

      expect(mockHttp.get).toHaveBeenCalledWith(
        '/profiles/userkey/farcaster.xyz%2Fuser%2Ffid%2F12345'
      );
    });
  });

  describe('search', () => {
    it('should search profiles', async () => {
      vi.spyOn(mockHttp, 'get').mockResolvedValue({
        values: [mockProfileData],
      });

      const results = await profiles.search({ query: 'test' });

      expect(mockHttp.get).toHaveBeenCalledWith('/profiles/search', {
        query: 'test',
        limit: 20,
        offset: 0,
      });
      expect(results).toHaveLength(1);
      expect(results[0]).toBeInstanceOf(Profile);
    });

    it('should handle array response', async () => {
      vi.spyOn(mockHttp, 'get').mockResolvedValue([mockProfileData]);

      const results = await profiles.search({ query: 'test' });

      expect(results).toHaveLength(1);
    });

    it('should pass custom limit and offset', async () => {
      vi.spyOn(mockHttp, 'get').mockResolvedValue({ values: [] });

      await profiles.search({ query: 'test', limit: 50, offset: 100 });

      expect(mockHttp.get).toHaveBeenCalledWith('/profiles/search', {
        query: 'test',
        limit: 50,
        offset: 100,
      });
    });
  });

  describe('list', () => {
    it('should iterate through profiles', async () => {
      vi.spyOn(mockHttp, 'get')
        .mockResolvedValueOnce({ data: [mockProfileData] })
        .mockResolvedValueOnce({ data: [] });

      const results: Profile[] = [];
      for await (const profile of profiles.list({ limit: 1 })) {
        results.push(profile);
      }

      expect(results).toHaveLength(1);
      expect(results[0]).toBeInstanceOf(Profile);
    });

    it('should pass orderBy parameter', async () => {
      vi.spyOn(mockHttp, 'get').mockResolvedValue({ data: [] });

      // Need to consume the generator
      for await (const _ of profiles.list({ orderBy: 'score' })) {
        // consume
      }

      expect(mockHttp.get).toHaveBeenCalledWith(
        '/profiles',
        expect.objectContaining({ orderBy: 'score' })
      );
    });
  });

  describe('listAll', () => {
    it('should collect all profiles into array', async () => {
      vi.spyOn(mockHttp, 'get')
        .mockResolvedValueOnce({ data: [mockProfileData] })
        .mockResolvedValueOnce({ data: [] });

      const results = await profiles.listAll({ limit: 1 });

      expect(results).toHaveLength(1);
      expect(results[0]).toBeInstanceOf(Profile);
    });
  });

  describe('recent', () => {
    it('should fetch recent profiles', async () => {
      vi.spyOn(mockHttp, 'get').mockResolvedValue({
        values: [mockProfileData],
      });

      const results = await profiles.recent(10);

      expect(mockHttp.get).toHaveBeenCalledWith('/profiles/recent', {
        limit: 10,
      });
      expect(results).toHaveLength(1);
    });
  });
});
