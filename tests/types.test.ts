import { describe, it, expect } from 'vitest';
import { Profile, ProfileData } from '../src/types/profile';
import { Vouch, VouchData } from '../src/types/vouch';
import { Review, ReviewData } from '../src/types/review';
import { Market, MarketData } from '../src/types/market';
import { Activity, ActivityData } from '../src/types/activity';
import { Score, ScoreData } from '../src/types/score';

describe('Profile', () => {
  const baseData: ProfileData = {
    id: 1,
    profileId: 1,
    address: '0x1234567890abcdef',
    displayName: 'Test User',
    username: 'testuser',
    score: 1500,
    status: 'ACTIVE',
    userkeys: ['x.com/user/testhandle', 'farcaster.xyz/user/123'],
    xpTotal: 100,
    xpStreakDays: 5,
    xpRemovedDueToAbuse: false,
    influenceFactor: 0.5,
    influenceFactorPercentile: 75,
    links: { profile: 'https://ethos.network/profile/1' },
    stats: {
      review: { received: { positive: 10, neutral: 2, negative: 1 } },
      vouch: {
        given: { count: 5, amountWeiTotal: 1000000 },
        received: { count: 3, amountWeiTotal: 500000 },
      },
    },
    createdAt: '2024-01-01T00:00:00Z',
  };

  it('should create profile from data', () => {
    const profile = new Profile(baseData);
    expect(profile.id).toBe(1);
    expect(profile.displayName).toBe('Test User');
    expect(profile.score).toBe(1500);
  });

  it('should extract twitter handle', () => {
    const profile = new Profile(baseData);
    expect(profile.twitterHandle).toBe('testhandle');
  });

  it('should return undefined for missing twitter', () => {
    const profile = new Profile({ ...baseData, userkeys: [] });
    expect(profile.twitterHandle).toBeUndefined();
  });

  it('should get ethereum address', () => {
    const profile = new Profile(baseData);
    expect(profile.ethereumAddress).toBe('0x1234567890abcdef');
  });

  it('should get credibility score', () => {
    const profile = new Profile(baseData);
    expect(profile.credibilityScore).toBe(1500);
  });

  describe('scoreLevel', () => {
    it('should return untrusted for score < 800', () => {
      const profile = new Profile({ ...baseData, score: 500 });
      expect(profile.scoreLevel).toBe('untrusted');
    });

    it('should return questionable for 800-1199', () => {
      const profile = new Profile({ ...baseData, score: 1000 });
      expect(profile.scoreLevel).toBe('questionable');
    });

    it('should return neutral for 1200-1599', () => {
      const profile = new Profile({ ...baseData, score: 1400 });
      expect(profile.scoreLevel).toBe('neutral');
    });

    it('should return reputable for 1600-1999', () => {
      const profile = new Profile({ ...baseData, score: 1800 });
      expect(profile.scoreLevel).toBe('reputable');
    });

    it('should return exemplary for 2000+', () => {
      const profile = new Profile({ ...baseData, score: 2200 });
      expect(profile.scoreLevel).toBe('exemplary');
    });
  });

  it('should get vouch counts', () => {
    const profile = new Profile(baseData);
    expect(profile.vouchesReceivedCount).toBe(3);
    expect(profile.vouchesGivenCount).toBe(5);
  });

  it('should get review counts', () => {
    const profile = new Profile(baseData);
    expect(profile.reviewsPositive).toBe(10);
    expect(profile.reviewsNegative).toBe(1);
  });

  it('should convert to JSON', () => {
    const profile = new Profile(baseData);
    const json = profile.toJSON();
    expect(json.id).toBe(1);
    expect(json.displayName).toBe('Test User');
  });

  it('should parse createdAt as Date', () => {
    const profile = new Profile(baseData);
    expect(profile.createdAt).toBeInstanceOf(Date);
  });
});

describe('Vouch', () => {
  const baseData: VouchData = {
    id: 1,
    authorProfileId: 10,
    subjectProfileId: 20,
    staked: true,
    archived: false,
    unhealthy: false,
    balance: '1000000000000000000',
    activityCheckpoints: {},
    createdAt: '2024-01-01T00:00:00Z',
  };

  it('should create vouch from data', () => {
    const vouch = new Vouch(baseData);
    expect(vouch.id).toBe(1);
    expect(vouch.authorProfileId).toBe(10);
    expect(vouch.subjectProfileId).toBe(20);
  });

  it('should calculate amount in wei', () => {
    const vouch = new Vouch(baseData);
    expect(vouch.amountWei).toBe(BigInt('1000000000000000000'));
  });

  it('should calculate amount in ETH', () => {
    const vouch = new Vouch(baseData);
    expect(vouch.amountEth).toBe(1);
  });

  it('should check if active', () => {
    const vouch = new Vouch(baseData);
    expect(vouch.isActive).toBe(true);
  });

  it('should check if inactive when archived', () => {
    const vouch = new Vouch({ ...baseData, archived: true });
    expect(vouch.isActive).toBe(false);
  });

  it('should provide alias getters', () => {
    const vouch = new Vouch(baseData);
    expect(vouch.voucherId).toBe(10);
    expect(vouch.targetId).toBe(20);
    expect(vouch.targetProfileId).toBe(20);
  });

  it('should convert to JSON', () => {
    const vouch = new Vouch(baseData);
    const json = vouch.toJSON();
    expect(json.id).toBe(1);
  });
});

describe('Review', () => {
  const baseData: ReviewData = {
    id: 1,
    authorProfileId: 10,
    subjectProfileId: 20,
    score: 'positive',
    comment: 'Great person!',
    archived: false,
  };

  it('should create review from data', () => {
    const review = new Review(baseData);
    expect(review.id).toBe(1);
    expect(review.score).toBe('positive');
  });

  it('should check positive review', () => {
    const review = new Review(baseData);
    expect(review.isPositive).toBe(true);
    expect(review.isNegative).toBe(false);
    expect(review.isNeutral).toBe(false);
  });

  it('should check negative review', () => {
    const review = new Review({ ...baseData, score: 'negative' });
    expect(review.isNegative).toBe(true);
  });

  it('should check neutral review', () => {
    const review = new Review({ ...baseData, score: 'neutral' });
    expect(review.isNeutral).toBe(true);
  });

  it('should provide alias getters', () => {
    const review = new Review(baseData);
    expect(review.reviewerId).toBe(10);
    expect(review.targetId).toBe(20);
    expect(review.targetProfileId).toBe(20);
  });
});

describe('Market', () => {
  const baseData: MarketData = {
    id: 1,
    profileId: 10,
    trustVotes: 100,
    distrustVotes: 50,
    trustPrice: 0.7,
    distrustPrice: 0.3,
    totalVolume: 1000,
    isActive: true,
  };

  it('should create market from data', () => {
    const market = new Market(baseData);
    expect(market.id).toBe(1);
    expect(market.trustPrice).toBe(0.7);
  });

  it('should calculate percentages', () => {
    const market = new Market(baseData);
    expect(market.trustPercentage).toBe(70);
    expect(market.distrustPercentage).toBe(30);
  });

  it('should determine bullish sentiment', () => {
    const market = new Market(baseData);
    expect(market.marketSentiment).toBe('bullish');
  });

  it('should determine bearish sentiment', () => {
    const market = new Market({ ...baseData, trustPrice: 0.3, distrustPrice: 0.7 });
    expect(market.marketSentiment).toBe('bearish');
  });

  it('should determine neutral sentiment', () => {
    const market = new Market({ ...baseData, trustPrice: 0.5, distrustPrice: 0.5 });
    expect(market.marketSentiment).toBe('neutral');
  });

  it('should check volatility', () => {
    const market = new Market({ ...baseData, trustPrice: 0.5 });
    expect(market.isVolatile).toBe(true);
  });
});

describe('Activity', () => {
  const baseData: ActivityData = {
    id: 1,
    type: 'vouch',
    authorProfileId: 10,
    subjectProfileId: 20,
    txHash: '0xabcdef123456',
    blockNumber: 12345,
    data: { extra: 'info' },
  };

  it('should create activity from data', () => {
    const activity = new Activity(baseData);
    expect(activity.id).toBe(1);
    expect(activity.type).toBe('vouch');
  });

  it('should check if vouch', () => {
    const activity = new Activity(baseData);
    expect(activity.isVouch).toBe(true);
    expect(activity.isReview).toBe(false);
  });

  it('should check if review', () => {
    const activity = new Activity({ ...baseData, type: 'review' });
    expect(activity.isReview).toBe(true);
  });

  it('should generate etherscan URL', () => {
    const activity = new Activity(baseData);
    expect(activity.etherscanUrl).toBe('https://basescan.org/tx/0xabcdef123456');
  });

  it('should return undefined for missing txHash', () => {
    const activity = new Activity({ ...baseData, txHash: undefined });
    expect(activity.etherscanUrl).toBeUndefined();
  });

  it('should provide alias getters', () => {
    const activity = new Activity(baseData);
    expect(activity.actorId).toBe(10);
    expect(activity.targetProfileId).toBe(20);
  });
});

describe('Score', () => {
  const baseData: ScoreData = {
    profileId: 1,
    address: '0x123',
    value: 1700,
    breakdown: {
      reviews: 500,
      vouches: 800,
      attestations: 200,
      activity: 100,
      history: 100,
    },
    percentile: 85,
  };

  it('should create score from data', () => {
    const score = new Score(baseData);
    expect(score.value).toBe(1700);
    expect(score.profileId).toBe(1);
  });

  describe('level', () => {
    it('should return untrusted for < 800', () => {
      const score = new Score({ ...baseData, value: 500 });
      expect(score.level).toBe('untrusted');
    });

    it('should return reputable for 1600-1999', () => {
      const score = new Score(baseData);
      expect(score.level).toBe('reputable');
    });

    it('should return exemplary for 2000+', () => {
      const score = new Score({ ...baseData, value: 2500 });
      expect(score.level).toBe('exemplary');
    });
  });

  it('should check if trusted', () => {
    const score = new Score(baseData);
    expect(score.isTrusted).toBe(true);
  });

  it('should check if untrusted', () => {
    const score = new Score({ ...baseData, value: 500 });
    expect(score.isUntrusted).toBe(true);
  });
});
