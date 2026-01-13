import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Profiles } from '../src/resources/profiles';
import { Vouches } from '../src/resources/vouches';
import { Reviews } from '../src/resources/reviews';
import { Markets } from '../src/resources/markets';
import { Activities } from '../src/resources/activities';
import { Scores } from '../src/resources/scores';
import { HTTPClient } from '../src/http';
import { EthosConfig } from '../src/config';
import { Profile } from '../src/types/profile';
import { Vouch } from '../src/types/vouch';
import { Review } from '../src/types/review';
import { Market } from '../src/types/market';
import { Activity } from '../src/types/activity';
import { Score } from '../src/types/score';

describe('Resources', () => {
  let http: HTTPClient;

  beforeEach(() => {
    http = new HTTPClient(new EthosConfig({ rateLimit: 0 }));
  });

  describe('Profiles', () => {
    let profiles: Profiles;

    beforeEach(() => {
      profiles = new Profiles(http);
    });

    it('should get profile by ID', async () => {
      const mockData = { id: 1, score: 1500, status: 'ACTIVE', userkeys: [], stats: { review: { received: { positive: 0, neutral: 0, negative: 0 } }, vouch: { given: { count: 0, amountWeiTotal: 0 }, received: { count: 0, amountWeiTotal: 0 } } }, links: {} };
      vi.spyOn(http, 'get').mockResolvedValueOnce(mockData);

      const profile = await profiles.get(1);

      expect(http.get).toHaveBeenCalledWith('/profiles/1');
      expect(profile).toBeInstanceOf(Profile);
      expect(profile.id).toBe(1);
    });

    it('should get profile by address', async () => {
      const mockData = { id: 1, address: '0x123', score: 1500, status: 'ACTIVE', userkeys: [], stats: { review: { received: { positive: 0, neutral: 0, negative: 0 } }, vouch: { given: { count: 0, amountWeiTotal: 0 }, received: { count: 0, amountWeiTotal: 0 } } }, links: {} };
      vi.spyOn(http, 'get').mockResolvedValueOnce(mockData);

      const profile = await profiles.getByAddress('0x123');

      expect(http.get).toHaveBeenCalledWith('/profiles/address/0x123');
      expect(profile.address).toBe('0x123');
    });

    it('should get profile by twitter handle', async () => {
      const mockData = { id: 1, score: 1500, status: 'ACTIVE', userkeys: ['x.com/user/testuser'], stats: { review: { received: { positive: 0, neutral: 0, negative: 0 } }, vouch: { given: { count: 0, amountWeiTotal: 0 }, received: { count: 0, amountWeiTotal: 0 } } }, links: {} };
      vi.spyOn(http, 'get').mockResolvedValueOnce(mockData);

      const profile = await profiles.getByTwitter('@testuser');

      expect(http.get).toHaveBeenCalledWith('/user/by/x/testuser');
    });

    it('should search profiles', async () => {
      const mockData = { values: [{ id: 1, score: 1500, status: 'ACTIVE', userkeys: [], stats: { review: { received: { positive: 0, neutral: 0, negative: 0 } }, vouch: { given: { count: 0, amountWeiTotal: 0 }, received: { count: 0, amountWeiTotal: 0 } } }, links: {} }] };
      vi.spyOn(http, 'get').mockResolvedValueOnce(mockData);

      const results = await profiles.search({ query: 'test' });

      expect(http.get).toHaveBeenCalledWith('/profiles/search', { query: 'test', limit: 20, offset: 0 });
      expect(results).toHaveLength(1);
      expect(results[0]).toBeInstanceOf(Profile);
    });
  });

  describe('Vouches', () => {
    let vouches: Vouches;

    beforeEach(() => {
      vouches = new Vouches(http);
    });

    it('should get vouch by ID', async () => {
      const mockData = { id: 1, authorProfileId: 10, subjectProfileId: 20, staked: true, archived: false, unhealthy: false, balance: '0', activityCheckpoints: {} };
      vi.spyOn(http, 'get').mockResolvedValueOnce(mockData);

      const vouch = await vouches.get(1);

      expect(http.get).toHaveBeenCalledWith('/vouches/1');
      expect(vouch).toBeInstanceOf(Vouch);
    });

    it('should get vouches for profile', async () => {
      const mockData = { values: [{ id: 1, authorProfileId: 10, subjectProfileId: 20, staked: true, archived: false, unhealthy: false, balance: '0', activityCheckpoints: {} }], total: 1 };
      vi.spyOn(http, 'post').mockResolvedValueOnce(mockData).mockResolvedValueOnce({ values: [], total: 0 });

      const results = await vouches.forProfile(20);

      expect(results).toHaveLength(1);
    });

    it('should check vouch between profiles', async () => {
      const mockData = { values: [{ id: 1, authorProfileId: 10, subjectProfileId: 20, staked: true, archived: false, unhealthy: false, balance: '0', activityCheckpoints: {} }], total: 1 };
      vi.spyOn(http, 'post').mockResolvedValueOnce(mockData);

      const vouch = await vouches.between(10, 20);

      expect(vouch).toBeInstanceOf(Vouch);
    });

    it('should return null when no vouch between profiles', async () => {
      vi.spyOn(http, 'post').mockResolvedValueOnce({ values: [], total: 0 });

      const vouch = await vouches.between(10, 20);

      expect(vouch).toBeNull();
    });
  });

  describe('Reviews', () => {
    let reviews: Reviews;

    beforeEach(() => {
      reviews = new Reviews(http);
    });

    it('should get review by ID', async () => {
      const mockData = { id: 1, authorProfileId: 10, subjectProfileId: 20, score: 'positive', archived: false };
      vi.spyOn(http, 'get').mockResolvedValueOnce(mockData);

      const review = await reviews.get(1);

      expect(review).toBeInstanceOf(Review);
      expect(review.score).toBe('positive');
    });

    it('should get positive reviews for profile', async () => {
      const mockData = [{ id: 1, authorProfileId: 10, subjectProfileId: 20, score: 'positive', archived: false }];
      vi.spyOn(http, 'get').mockResolvedValueOnce(mockData).mockResolvedValueOnce([]);

      const results = await reviews.positiveFor(20);

      expect(results).toHaveLength(1);
      expect(results[0].isPositive).toBe(true);
    });
  });

  describe('Markets', () => {
    let markets: Markets;

    beforeEach(() => {
      markets = new Markets(http);
    });

    it('should get market by ID', async () => {
      const mockData = { id: 1, profileId: 10, trustVotes: 100, distrustVotes: 50, trustPrice: 0.7, distrustPrice: 0.3, totalVolume: 1000, isActive: true };
      vi.spyOn(http, 'get').mockResolvedValueOnce(mockData);

      const market = await markets.get(1);

      expect(market).toBeInstanceOf(Market);
      expect(market.trustPrice).toBe(0.7);
    });

    it('should get market by profile ID', async () => {
      const mockData = { id: 1, profileId: 10, trustVotes: 100, distrustVotes: 50, trustPrice: 0.7, distrustPrice: 0.3, totalVolume: 1000, isActive: true };
      vi.spyOn(http, 'get').mockResolvedValueOnce(mockData);

      const market = await markets.getByProfile(10);

      expect(http.get).toHaveBeenCalledWith('/markets/profile/10');
    });
  });

  describe('Activities', () => {
    let activities: Activities;

    beforeEach(() => {
      activities = new Activities(http);
    });

    it('should get activity by ID', async () => {
      const mockData = { id: 1, type: 'vouch', authorProfileId: 10, subjectProfileId: 20, data: {} };
      vi.spyOn(http, 'get').mockResolvedValueOnce(mockData);

      const activity = await activities.get(1);

      expect(activity).toBeInstanceOf(Activity);
      expect(activity.isVouch).toBe(true);
    });

    it('should get recent activities', async () => {
      const mockData = [{ id: 1, type: 'vouch', data: {} }, { id: 2, type: 'review', data: {} }];
      vi.spyOn(http, 'get').mockResolvedValueOnce(mockData);

      const results = await activities.recent(2);

      expect(results).toHaveLength(2);
    });
  });

  describe('Scores', () => {
    let scores: Scores;

    beforeEach(() => {
      scores = new Scores(http);
    });

    it('should get score by address', async () => {
      const mockData = { profileId: 1, address: '0x123', value: 1700, breakdown: { reviews: 500, vouches: 800, attestations: 200, activity: 100, history: 100 } };
      vi.spyOn(http, 'get').mockResolvedValueOnce(mockData);

      const score = await scores.get('0x123');

      expect(score).toBeInstanceOf(Score);
      expect(score.value).toBe(1700);
      expect(score.level).toBe('reputable');
    });

    it('should get score by profile ID', async () => {
      const mockData = { profileId: 1, value: 1700, breakdown: { reviews: 500, vouches: 800, attestations: 200, activity: 100, history: 100 } };
      vi.spyOn(http, 'get').mockResolvedValueOnce(mockData);

      const score = await scores.getByProfile(1);

      expect(http.get).toHaveBeenCalledWith('/score/profile/1');
    });

    it('should get score breakdown', async () => {
      const mockData = { profileId: 1, value: 1700, breakdown: { reviews: 500, vouches: 800, attestations: 200, activity: 100, history: 100 } };
      vi.spyOn(http, 'get').mockResolvedValueOnce(mockData);

      const score = await scores.breakdown('0x123');

      expect(http.get).toHaveBeenCalledWith('/score/0x123/breakdown');
      expect(score.breakdown.reviews).toBe(500);
    });
  });
});
