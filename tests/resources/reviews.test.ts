/**
 * Tests for Reviews resource
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Reviews } from '../../src/resources/reviews';
import { HTTPClient } from '../../src/http';
import { EthosConfig } from '../../src/config';
import { Review } from '../../src/types/review';

describe('Reviews', () => {
  let reviews: Reviews;
  let mockHttp: HTTPClient;

  const mockReviewData = {
    id: 789,
    authorProfileId: 100,
    subjectProfileId: 200,
    score: 'positive' as const,
    comment: 'Great!',
    archived: false,
  };

  beforeEach(() => {
    mockHttp = new HTTPClient(
      new EthosConfig({
        baseUrl: 'https://api.test.com',
        rateLimit: 0,
      })
    );
    reviews = new Reviews(mockHttp);
  });

  describe('get', () => {
    it('should fetch review by ID', async () => {
      vi.spyOn(mockHttp, 'get').mockResolvedValue(mockReviewData);

      const result = await reviews.get(789);

      expect(mockHttp.get).toHaveBeenCalledWith('/reviews/789');
      expect(result).toBeInstanceOf(Review);
      expect(result.id).toBe(789);
    });
  });

  describe('list', () => {
    it('should iterate through reviews', async () => {
      vi.spyOn(mockHttp, 'get')
        .mockResolvedValueOnce({ data: [mockReviewData] })
        .mockResolvedValueOnce({ data: [] });

      const results: Review[] = [];
      for await (const review of reviews.list({ limit: 1 })) {
        results.push(review);
      }

      expect(results).toHaveLength(1);
      expect(results[0]).toBeInstanceOf(Review);
    });

    it('should pass filter parameters', async () => {
      vi.spyOn(mockHttp, 'get').mockResolvedValue({ data: [] });

      for await (const _ of reviews.list({
        authorProfileId: 100,
        targetProfileId: 200,
        score: 'positive',
        archived: false,
      })) {
        // consume
      }

      expect(mockHttp.get).toHaveBeenCalledWith(
        '/reviews',
        expect.objectContaining({
          authorProfileId: 100,
          subjectProfileId: 200,
          score: 'positive',
          archived: false,
        })
      );
    });
  });

  describe('forProfile', () => {
    it('should get reviews received by profile', async () => {
      vi.spyOn(mockHttp, 'get')
        .mockResolvedValueOnce({ data: [mockReviewData] })
        .mockResolvedValueOnce({ data: [] });

      const results = await reviews.forProfile(200);

      expect(mockHttp.get).toHaveBeenCalledWith(
        '/reviews',
        expect.objectContaining({ subjectProfileId: 200 })
      );
      expect(results).toHaveLength(1);
    });
  });

  describe('byProfile', () => {
    it('should get reviews given by profile', async () => {
      vi.spyOn(mockHttp, 'get')
        .mockResolvedValueOnce({ data: [mockReviewData] })
        .mockResolvedValueOnce({ data: [] });

      const results = await reviews.byProfile(100);

      expect(mockHttp.get).toHaveBeenCalledWith(
        '/reviews',
        expect.objectContaining({ authorProfileId: 100 })
      );
      expect(results).toHaveLength(1);
    });
  });

  describe('positiveFor', () => {
    it('should get positive reviews for profile', async () => {
      vi.spyOn(mockHttp, 'get')
        .mockResolvedValueOnce({ data: [mockReviewData] })
        .mockResolvedValueOnce({ data: [] });

      const results = await reviews.positiveFor(200);

      expect(mockHttp.get).toHaveBeenCalledWith(
        '/reviews',
        expect.objectContaining({
          subjectProfileId: 200,
          score: 'positive',
        })
      );
      expect(results).toHaveLength(1);
    });
  });

  describe('negativeFor', () => {
    it('should get negative reviews for profile', async () => {
      const negativeReview = { ...mockReviewData, score: 'negative' as const };
      vi.spyOn(mockHttp, 'get')
        .mockResolvedValueOnce({ data: [negativeReview] })
        .mockResolvedValueOnce({ data: [] });

      const results = await reviews.negativeFor(200);

      expect(mockHttp.get).toHaveBeenCalledWith(
        '/reviews',
        expect.objectContaining({
          subjectProfileId: 200,
          score: 'negative',
        })
      );
      expect(results).toHaveLength(1);
    });
  });
});
