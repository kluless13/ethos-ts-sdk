/**
 * Tests for Profile type
 */

import { describe, it, expect } from 'vitest';
import { Profile, ProfileData } from '../../src/types/profile';

describe('Profile', () => {
  const mockProfileData: ProfileData = {
    id: 123,
    profileId: 123,
    address: '0x1234567890abcdef1234567890abcdef12345678',
    displayName: 'Test User',
    username: 'testuser',
    avatarUrl: 'https://example.com/avatar.png',
    description: 'A test user',
    score: 1650,
    status: 'ACTIVE',
    userkeys: ['x.com/user/testhandle', 'farcaster.xyz/user/fid/12345'],
    xpTotal: 1000,
    xpStreakDays: 5,
    xpRemovedDueToAbuse: false,
    influenceFactor: 0.75,
    influenceFactorPercentile: 85,
    links: {
      profile: 'https://ethos.network/profile/123',
      scoreBreakdown: 'https://ethos.network/profile/123/score',
    },
    stats: {
      review: {
        received: { positive: 10, neutral: 2, negative: 1 },
      },
      vouch: {
        given: { count: 5, amountWeiTotal: 1000000000000000000 },
        received: { count: 8, amountWeiTotal: 2000000000000000000 },
      },
    },
    createdAt: '2024-01-15T10:30:00Z',
  };

  describe('constructor', () => {
    it('should create profile from data', () => {
      const profile = new Profile(mockProfileData);

      expect(profile.id).toBe(123);
      expect(profile.address).toBe(
        '0x1234567890abcdef1234567890abcdef12345678'
      );
      expect(profile.displayName).toBe('Test User');
      expect(profile.score).toBe(1650);
      expect(profile.status).toBe('ACTIVE');
    });

    it('should handle missing optional fields', () => {
      const minimalData: ProfileData = {
        id: 1,
        score: 1200,
        status: 'ACTIVE',
        userkeys: [],
        xpTotal: 0,
        xpStreakDays: 0,
        xpRemovedDueToAbuse: false,
        influenceFactor: 0,
        influenceFactorPercentile: 0,
        links: {},
        stats: {
          review: { received: { positive: 0, neutral: 0, negative: 0 } },
          vouch: {
            given: { count: 0, amountWeiTotal: 0 },
            received: { count: 0, amountWeiTotal: 0 },
          },
        },
      };

      const profile = new Profile(minimalData);

      expect(profile.id).toBe(1);
      expect(profile.address).toBeUndefined();
      expect(profile.displayName).toBeUndefined();
    });

    it('should parse createdAt as Date', () => {
      const profile = new Profile(mockProfileData);

      expect(profile.createdAt).toBeInstanceOf(Date);
      expect(profile.createdAt?.toISOString()).toBe('2024-01-15T10:30:00.000Z');
    });
  });

  describe('twitterHandle', () => {
    it('should extract Twitter handle from x.com userkey', () => {
      const profile = new Profile(mockProfileData);

      expect(profile.twitterHandle).toBe('testhandle');
    });

    it('should extract Twitter handle from twitter.com userkey', () => {
      const data = {
        ...mockProfileData,
        userkeys: ['twitter.com/user/oldhandle'],
      };
      const profile = new Profile(data);

      expect(profile.twitterHandle).toBe('oldhandle');
    });

    it('should return undefined when no Twitter userkey', () => {
      const data = {
        ...mockProfileData,
        userkeys: ['farcaster.xyz/user/fid/12345'],
      };
      const profile = new Profile(data);

      expect(profile.twitterHandle).toBeUndefined();
    });

    it('should return undefined when userkeys empty', () => {
      const data = { ...mockProfileData, userkeys: [] };
      const profile = new Profile(data);

      expect(profile.twitterHandle).toBeUndefined();
    });
  });

  describe('scoreLevel', () => {
    it('should return untrusted for score < 800', () => {
      const data = { ...mockProfileData, score: 500 };
      expect(new Profile(data).scoreLevel).toBe('untrusted');
    });

    it('should return questionable for score 800-1199', () => {
      const data = { ...mockProfileData, score: 1000 };
      expect(new Profile(data).scoreLevel).toBe('questionable');
    });

    it('should return neutral for score 1200-1599', () => {
      const data = { ...mockProfileData, score: 1400 };
      expect(new Profile(data).scoreLevel).toBe('neutral');
    });

    it('should return reputable for score 1600-1999', () => {
      const data = { ...mockProfileData, score: 1800 };
      expect(new Profile(data).scoreLevel).toBe('reputable');
    });

    it('should return exemplary for score >= 2000', () => {
      const data = { ...mockProfileData, score: 2500 };
      expect(new Profile(data).scoreLevel).toBe('exemplary');
    });
  });

  describe('stats helpers', () => {
    it('should return vouchesReceivedCount', () => {
      const profile = new Profile(mockProfileData);
      expect(profile.vouchesReceivedCount).toBe(8);
    });

    it('should return vouchesGivenCount', () => {
      const profile = new Profile(mockProfileData);
      expect(profile.vouchesGivenCount).toBe(5);
    });

    it('should return reviewsPositive', () => {
      const profile = new Profile(mockProfileData);
      expect(profile.reviewsPositive).toBe(10);
    });

    it('should return reviewsNegative', () => {
      const profile = new Profile(mockProfileData);
      expect(profile.reviewsNegative).toBe(1);
    });
  });

  describe('toJSON', () => {
    it('should convert to plain object', () => {
      const profile = new Profile(mockProfileData);
      const json = profile.toJSON();

      expect(json.id).toBe(123);
      expect(json.displayName).toBe('Test User');
      expect(json.createdAt).toBe('2024-01-15T10:30:00.000Z');
    });
  });
});
