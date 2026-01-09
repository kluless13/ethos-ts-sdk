/**
 * Profile types for Ethos users.
 */

export interface ProfileStatsReviewReceived {
  positive: number;
  neutral: number;
  negative: number;
}

export interface ProfileStatsReview {
  received: ProfileStatsReviewReceived;
}

export interface ProfileStatsVouchGiven {
  count: number;
  amountWeiTotal: number;
}

export interface ProfileStatsVouchReceived {
  count: number;
  amountWeiTotal: number;
}

export interface ProfileStatsVouch {
  given: ProfileStatsVouchGiven;
  received: ProfileStatsVouchReceived;
}

export interface ProfileStats {
  review: ProfileStatsReview;
  vouch: ProfileStatsVouch;
}

export interface ProfileLinks {
  profile?: string;
  scoreBreakdown?: string;
}

export interface ProfileData {
  id: number;
  profileId?: number;
  address?: string;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
  description?: string;
  score: number;
  status: string;
  userkeys: string[];
  xpTotal: number;
  xpStreakDays: number;
  xpRemovedDueToAbuse: boolean;
  influenceFactor: number;
  influenceFactorPercentile: number;
  links: ProfileLinks;
  stats: ProfileStats;
  createdAt?: string;
}

/**
 * Profile class with helper methods and properties.
 */
export class Profile {
  readonly id: number;
  readonly profileId?: number;
  readonly address?: string;
  readonly displayName?: string;
  readonly username?: string;
  readonly avatarUrl?: string;
  readonly description?: string;
  readonly score: number;
  readonly status: string;
  readonly userkeys: string[];
  readonly xpTotal: number;
  readonly xpStreakDays: number;
  readonly xpRemovedDueToAbuse: boolean;
  readonly influenceFactor: number;
  readonly influenceFactorPercentile: number;
  readonly links: ProfileLinks;
  readonly stats: ProfileStats;
  readonly createdAt?: Date;

  constructor(data: ProfileData) {
    this.id = data.id;
    this.profileId = data.profileId;
    this.address = data.address;
    this.displayName = data.displayName;
    this.username = data.username;
    this.avatarUrl = data.avatarUrl;
    this.description = data.description;
    this.score = data.score ?? 0;
    this.status = data.status ?? 'ACTIVE';
    this.userkeys = data.userkeys ?? [];
    this.xpTotal = data.xpTotal ?? 0;
    this.xpStreakDays = data.xpStreakDays ?? 0;
    this.xpRemovedDueToAbuse = data.xpRemovedDueToAbuse ?? false;
    this.influenceFactor = data.influenceFactor ?? 0;
    this.influenceFactorPercentile = data.influenceFactorPercentile ?? 0;
    this.links = data.links ?? {};
    this.stats = data.stats ?? {
      review: { received: { positive: 0, neutral: 0, negative: 0 } },
      vouch: {
        given: { count: 0, amountWeiTotal: 0 },
        received: { count: 0, amountWeiTotal: 0 },
      },
    };
    this.createdAt = data.createdAt ? new Date(data.createdAt) : undefined;
  }

  /**
   * Extract Twitter handle from userkeys if present.
   */
  get twitterHandle(): string | undefined {
    for (const key of this.userkeys) {
      if (key.startsWith('x.com/user/')) {
        return key.replace('x.com/user/', '');
      }
      if (key.startsWith('twitter.com/user/')) {
        return key.replace('twitter.com/user/', '');
      }
    }
    return undefined;
  }

  /**
   * Get the primary Ethereum address.
   */
  get ethereumAddress(): string | undefined {
    return this.address;
  }

  /**
   * Alias for score.
   */
  get credibilityScore(): number {
    return this.score;
  }

  /**
   * Get the credibility level based on score.
   *
   * Score ranges (from Ethos docs):
   * - 0-799: Untrusted
   * - 800-1199: Questionable
   * - 1200-1599: Neutral
   * - 1600-1999: Reputable
   * - 2000-2800: Exemplary
   */
  get scoreLevel(): string {
    if (this.score < 800) return 'untrusted';
    if (this.score < 1200) return 'questionable';
    if (this.score < 1600) return 'neutral';
    if (this.score < 2000) return 'reputable';
    return 'exemplary';
  }

  /**
   * Number of vouches received.
   */
  get vouchesReceivedCount(): number {
    return this.stats.vouch.received.count;
  }

  /**
   * Number of vouches given.
   */
  get vouchesGivenCount(): number {
    return this.stats.vouch.given.count;
  }

  /**
   * Number of positive reviews received.
   */
  get reviewsPositive(): number {
    return this.stats.review.received.positive;
  }

  /**
   * Number of negative reviews received.
   */
  get reviewsNegative(): number {
    return this.stats.review.received.negative;
  }

  /**
   * Convert to plain object.
   */
  toJSON(): ProfileData {
    return {
      id: this.id,
      profileId: this.profileId,
      address: this.address,
      displayName: this.displayName,
      username: this.username,
      avatarUrl: this.avatarUrl,
      description: this.description,
      score: this.score,
      status: this.status,
      userkeys: this.userkeys,
      xpTotal: this.xpTotal,
      xpStreakDays: this.xpStreakDays,
      xpRemovedDueToAbuse: this.xpRemovedDueToAbuse,
      influenceFactor: this.influenceFactor,
      influenceFactorPercentile: this.influenceFactorPercentile,
      links: this.links,
      stats: this.stats,
      createdAt: this.createdAt?.toISOString(),
    };
  }
}
