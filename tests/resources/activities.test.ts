/**
 * Tests for Activities resource
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Activities } from '../../src/resources/activities';
import { HTTPClient } from '../../src/http';
import { EthosConfig } from '../../src/config';
import { Activity } from '../../src/types/activity';

describe('Activities', () => {
  let activities: Activities;
  let mockHttp: HTTPClient;

  const mockActivityData = {
    id: 999,
    type: 'vouch',
    authorProfileId: 100,
    subjectProfileId: 200,
    txHash: '0xabc123',
    blockNumber: 12345,
    data: {},
    createdAt: '2024-01-15T10:30:00Z',
  };

  beforeEach(() => {
    mockHttp = new HTTPClient(
      new EthosConfig({
        baseUrl: 'https://api.test.com',
        rateLimit: 0,
      })
    );
    activities = new Activities(mockHttp);
  });

  describe('get', () => {
    it('should fetch activity by ID', async () => {
      vi.spyOn(mockHttp, 'get').mockResolvedValue(mockActivityData);

      const result = await activities.get(999);

      expect(mockHttp.get).toHaveBeenCalledWith('/activities/999');
      expect(result).toBeInstanceOf(Activity);
      expect(result.id).toBe(999);
    });
  });

  describe('list', () => {
    it('should iterate through activities', async () => {
      vi.spyOn(mockHttp, 'get')
        .mockResolvedValueOnce({ data: [mockActivityData] })
        .mockResolvedValueOnce({ data: [] });

      const results: Activity[] = [];
      for await (const activity of activities.list({ limit: 1 })) {
        results.push(activity);
      }

      expect(results).toHaveLength(1);
      expect(results[0]).toBeInstanceOf(Activity);
    });

    it('should pass filter parameters', async () => {
      vi.spyOn(mockHttp, 'get').mockResolvedValue({ data: [] });

      for await (const _ of activities.list({
        authorProfileId: 100,
        targetProfileId: 200,
        activityType: 'vouch',
      })) {
        // consume
      }

      expect(mockHttp.get).toHaveBeenCalledWith(
        '/activities',
        expect.objectContaining({
          authorProfileId: 100,
          subjectProfileId: 200,
          type: 'vouch',
        })
      );
    });
  });

  describe('forProfile', () => {
    it('should get activities for profile (as author and target)', async () => {
      const asAuthor = { ...mockActivityData, id: 1 };
      const asTarget = { ...mockActivityData, id: 2, authorProfileId: 300 };

      // Pagination breaks when items.length < limit (100), so only 2 calls needed
      vi.spyOn(mockHttp, 'get')
        .mockResolvedValueOnce({ data: [asAuthor] })
        .mockResolvedValueOnce({ data: [asTarget] });

      const results = await activities.forProfile(100);

      expect(results).toHaveLength(2);
    });

    it('should dedupe activities', async () => {
      // Pagination breaks when items.length < limit (100), so only 2 calls needed
      vi.spyOn(mockHttp, 'get')
        .mockResolvedValueOnce({ data: [mockActivityData] })
        .mockResolvedValueOnce({ data: [mockActivityData] }); // Same activity returned

      const results = await activities.forProfile(100);

      expect(results).toHaveLength(1);
    });
  });

  describe('vouches', () => {
    it('should get vouch activities', async () => {
      vi.spyOn(mockHttp, 'get')
        .mockResolvedValueOnce({ data: [mockActivityData] })
        .mockResolvedValueOnce({ data: [] });

      const results: Activity[] = [];
      for await (const activity of activities.vouches(10)) {
        results.push(activity);
      }

      expect(mockHttp.get).toHaveBeenCalledWith(
        '/activities',
        expect.objectContaining({ type: 'vouch' })
      );
    });
  });

  describe('reviews', () => {
    it('should get review activities', async () => {
      const reviewActivity = { ...mockActivityData, type: 'review' };
      vi.spyOn(mockHttp, 'get')
        .mockResolvedValueOnce({ data: [reviewActivity] })
        .mockResolvedValueOnce({ data: [] });

      const results: Activity[] = [];
      for await (const activity of activities.reviews(10)) {
        results.push(activity);
      }

      expect(mockHttp.get).toHaveBeenCalledWith(
        '/activities',
        expect.objectContaining({ type: 'review' })
      );
    });
  });

  describe('recent', () => {
    it('should get recent activities', async () => {
      vi.spyOn(mockHttp, 'get')
        .mockResolvedValueOnce({ data: [mockActivityData] })
        .mockResolvedValueOnce({ data: [] });

      const results = await activities.recent(10);

      expect(results).toHaveLength(1);
    });

    it('should respect limit', async () => {
      const manyActivities = Array.from({ length: 50 }, (_, i) => ({
        ...mockActivityData,
        id: i,
      }));
      vi.spyOn(mockHttp, 'get').mockResolvedValue({ data: manyActivities });

      const results = await activities.recent(5);

      expect(results).toHaveLength(5);
    });
  });
});
