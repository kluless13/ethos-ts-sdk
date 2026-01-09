/**
 * Tests for Review type
 */

import { describe, it, expect } from 'vitest';
import { Review, ReviewData } from '../../src/types/review';

describe('Review', () => {
  const mockReviewData: ReviewData = {
    id: 789,
    authorProfileId: 100,
    subjectProfileId: 200,
    score: 'positive',
    comment: 'Great person to work with!',
    archived: false,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T15:45:00Z',
  };

  describe('constructor', () => {
    it('should create review from data', () => {
      const review = new Review(mockReviewData);

      expect(review.id).toBe(789);
      expect(review.authorProfileId).toBe(100);
      expect(review.subjectProfileId).toBe(200);
      expect(review.score).toBe('positive');
      expect(review.comment).toBe('Great person to work with!');
    });

    it('should handle missing optional fields', () => {
      const minimalData: ReviewData = {
        id: 1,
        authorProfileId: 10,
        subjectProfileId: 20,
        score: 'neutral',
        archived: false,
      };

      const review = new Review(minimalData);

      expect(review.comment).toBeUndefined();
      expect(review.createdAt).toBeUndefined();
    });

    it('should parse dates', () => {
      const review = new Review(mockReviewData);

      expect(review.createdAt).toBeInstanceOf(Date);
      expect(review.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('isPositive', () => {
    it('should return true for positive score', () => {
      const review = new Review(mockReviewData);

      expect(review.isPositive).toBe(true);
    });

    it('should return false for non-positive score', () => {
      const data = { ...mockReviewData, score: 'negative' as const };
      const review = new Review(data);

      expect(review.isPositive).toBe(false);
    });
  });

  describe('isNegative', () => {
    it('should return true for negative score', () => {
      const data = { ...mockReviewData, score: 'negative' as const };
      const review = new Review(data);

      expect(review.isNegative).toBe(true);
    });

    it('should return false for non-negative score', () => {
      const review = new Review(mockReviewData);

      expect(review.isNegative).toBe(false);
    });
  });

  describe('isNeutral', () => {
    it('should return true for neutral score', () => {
      const data = { ...mockReviewData, score: 'neutral' as const };
      const review = new Review(data);

      expect(review.isNeutral).toBe(true);
    });

    it('should return false for non-neutral score', () => {
      const review = new Review(mockReviewData);

      expect(review.isNeutral).toBe(false);
    });
  });

  describe('aliases', () => {
    it('should return reviewerId as authorProfileId', () => {
      const review = new Review(mockReviewData);

      expect(review.reviewerId).toBe(100);
    });

    it('should return targetId as subjectProfileId', () => {
      const review = new Review(mockReviewData);

      expect(review.targetId).toBe(200);
    });

    it('should return targetProfileId as subjectProfileId', () => {
      const review = new Review(mockReviewData);

      expect(review.targetProfileId).toBe(200);
    });
  });

  describe('toJSON', () => {
    it('should convert to plain object', () => {
      const review = new Review(mockReviewData);
      const json = review.toJSON();

      expect(json.id).toBe(789);
      expect(json.score).toBe('positive');
      expect(json.comment).toBe('Great person to work with!');
      expect(json.createdAt).toBe('2024-01-15T10:30:00.000Z');
    });
  });
});
