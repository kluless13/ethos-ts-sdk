/**
 * Tests for Activity type
 */

import { describe, it, expect } from 'vitest';
import { Activity, ActivityData } from '../../src/types/activity';

describe('Activity', () => {
  const mockActivityData: ActivityData = {
    id: 999,
    type: 'vouch',
    authorProfileId: 100,
    subjectProfileId: 200,
    txHash: '0xabc123def456789',
    blockNumber: 12345678,
    data: { amount: '1000000000000000000' },
    createdAt: '2024-01-15T10:30:00Z',
  };

  describe('constructor', () => {
    it('should create activity from data', () => {
      const activity = new Activity(mockActivityData);

      expect(activity.id).toBe(999);
      expect(activity.type).toBe('vouch');
      expect(activity.authorProfileId).toBe(100);
      expect(activity.subjectProfileId).toBe(200);
      expect(activity.txHash).toBe('0xabc123def456789');
      expect(activity.blockNumber).toBe(12345678);
    });

    it('should handle missing optional fields', () => {
      const minimalData: ActivityData = {
        id: 1,
        type: 'review',
        data: {},
      };

      const activity = new Activity(minimalData);

      expect(activity.authorProfileId).toBeUndefined();
      expect(activity.txHash).toBeUndefined();
      expect(activity.createdAt).toBeUndefined();
    });

    it('should parse createdAt as Date', () => {
      const activity = new Activity(mockActivityData);

      expect(activity.createdAt).toBeInstanceOf(Date);
    });

    it('should preserve data object', () => {
      const activity = new Activity(mockActivityData);

      expect(activity.data).toEqual({ amount: '1000000000000000000' });
    });
  });

  describe('isVouch', () => {
    it('should return true for vouch type', () => {
      const activity = new Activity(mockActivityData);

      expect(activity.isVouch).toBe(true);
    });

    it('should return false for non-vouch type', () => {
      const data = { ...mockActivityData, type: 'review' };
      const activity = new Activity(data);

      expect(activity.isVouch).toBe(false);
    });
  });

  describe('isReview', () => {
    it('should return true for review type', () => {
      const data = { ...mockActivityData, type: 'review' };
      const activity = new Activity(data);

      expect(activity.isReview).toBe(true);
    });

    it('should return false for non-review type', () => {
      const activity = new Activity(mockActivityData);

      expect(activity.isReview).toBe(false);
    });
  });

  describe('aliases', () => {
    it('should return actorId as authorProfileId', () => {
      const activity = new Activity(mockActivityData);

      expect(activity.actorId).toBe(100);
    });

    it('should return targetProfileId as subjectProfileId', () => {
      const activity = new Activity(mockActivityData);

      expect(activity.targetProfileId).toBe(200);
    });
  });

  describe('etherscanUrl', () => {
    it('should return Basescan URL when txHash present', () => {
      const activity = new Activity(mockActivityData);

      expect(activity.etherscanUrl).toBe(
        'https://basescan.org/tx/0xabc123def456789'
      );
    });

    it('should return undefined when txHash not present', () => {
      const data = { ...mockActivityData, txHash: undefined };
      const activity = new Activity(data);

      expect(activity.etherscanUrl).toBeUndefined();
    });
  });

  describe('toJSON', () => {
    it('should convert to plain object', () => {
      const activity = new Activity(mockActivityData);
      const json = activity.toJSON();

      expect(json.id).toBe(999);
      expect(json.type).toBe('vouch');
      expect(json.txHash).toBe('0xabc123def456789');
      expect(json.createdAt).toBe('2024-01-15T10:30:00.000Z');
    });
  });
});
