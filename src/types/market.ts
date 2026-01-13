/**
 * Market types for Ethos reputation markets.
 */

/**
 * User info embedded in market data from API.
 */
export interface MarketUserData {
  profileId: number;
  username?: string;
  score?: number;
}

export interface MarketData {
  id: number;
  profileId?: number;
  user?: MarketUserData;
  trustVotes: number;
  distrustVotes: number;
  trustPrice: number;
  distrustPrice: number;
  totalVolume: number;
  liquidityParameter?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * A reputation market on Ethos Markets.
 *
 * Reputation markets allow users to trade trust/distrust votes
 * on a person's reputation using an LMSR-based AMM.
 * These markets are perpetual (never resolve).
 */
export class Market {
  readonly id: number;
  readonly profileId: number;
  readonly username?: string;
  readonly userScore?: number;
  readonly trustVotes: number;
  readonly distrustVotes: number;
  readonly trustPrice: number;
  readonly distrustPrice: number;
  readonly totalVolume: number;
  readonly liquidityParameter?: number;
  readonly isActive: boolean;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(data: MarketData) {
    this.id = data.id;
    // Extract profileId from either top-level or nested user object
    this.profileId = data.profileId ?? data.user?.profileId ?? data.id;
    this.username = data.user?.username;
    this.userScore = data.user?.score;
    this.trustVotes = data.trustVotes ?? 0;
    this.distrustVotes = data.distrustVotes ?? 0;
    this.trustPrice = data.trustPrice ?? 0.5;
    this.distrustPrice = data.distrustPrice ?? 0.5;
    this.totalVolume = data.totalVolume ?? 0;
    this.liquidityParameter = data.liquidityParameter;
    this.isActive = data.isActive ?? true;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : undefined;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : undefined;
  }

  /**
   * Get trust as a percentage (0-100).
   */
  get trustPercentage(): number {
    return this.trustPrice * 100;
  }

  /**
   * Get distrust as a percentage (0-100).
   */
  get distrustPercentage(): number {
    return this.distrustPrice * 100;
  }

  /**
   * Get overall market sentiment.
   *
   * @returns "bullish" if trust > 60%, "bearish" if distrust > 60%, "neutral" otherwise
   */
  get marketSentiment(): 'bullish' | 'bearish' | 'neutral' {
    if (this.trustPrice > 0.6) return 'bullish';
    if (this.distrustPrice > 0.6) return 'bearish';
    return 'neutral';
  }

  /**
   * Check if market is volatile (close to 50/50).
   */
  get isVolatile(): boolean {
    return this.trustPrice >= 0.4 && this.trustPrice <= 0.6;
  }

  /**
   * Convert to plain object.
   */
  toJSON(): MarketData {
    return {
      id: this.id,
      profileId: this.profileId,
      user: this.username
        ? {
            profileId: this.profileId,
            username: this.username,
            score: this.userScore,
          }
        : undefined,
      trustVotes: this.trustVotes,
      distrustVotes: this.distrustVotes,
      trustPrice: this.trustPrice,
      distrustPrice: this.distrustPrice,
      totalVolume: this.totalVolume,
      liquidityParameter: this.liquidityParameter,
      isActive: this.isActive,
      createdAt: this.createdAt?.toISOString(),
      updatedAt: this.updatedAt?.toISOString(),
    };
  }
}
