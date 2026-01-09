/**
 * Score types for Ethos credibility scores.
 */

export interface ScoreBreakdown {
  reviews: number;
  vouches: number;
  attestations: number;
  activity: number;
  history: number;
}

export interface ScoreData {
  profileId: number;
  address?: string;
  value: number;
  breakdown: ScoreBreakdown;
  percentile?: number;
  updatedAt?: string;
}

/**
 * A credibility score on Ethos Network.
 *
 * Scores represent the overall trustworthiness of a profile,
 * calculated from reviews, vouches, attestations, and activity.
 *
 * Score ranges:
 * - 0-799: Untrusted
 * - 800-1199: Questionable
 * - 1200-1599: Neutral
 * - 1600-1999: Reputable
 * - 2000-2800: Exemplary
 */
export class Score {
  readonly profileId: number;
  readonly address?: string;
  readonly value: number;
  readonly breakdown: ScoreBreakdown;
  readonly percentile?: number;
  readonly updatedAt?: Date;

  constructor(data: ScoreData) {
    this.profileId = data.profileId;
    this.address = data.address;
    this.value = data.value ?? 0;
    this.breakdown = data.breakdown ?? {
      reviews: 0,
      vouches: 0,
      attestations: 0,
      activity: 0,
      history: 0,
    };
    this.percentile = data.percentile;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : undefined;
  }

  /**
   * Get the credibility level based on score value.
   */
  get level(): string {
    if (this.value < 800) return 'untrusted';
    if (this.value < 1200) return 'questionable';
    if (this.value < 1600) return 'neutral';
    if (this.value < 2000) return 'reputable';
    return 'exemplary';
  }

  /**
   * Check if score indicates trusted status (reputable or better).
   */
  get isTrusted(): boolean {
    return this.value >= 1600;
  }

  /**
   * Check if score indicates untrusted status.
   */
  get isUntrusted(): boolean {
    return this.value < 800;
  }

  /**
   * Convert to plain object.
   */
  toJSON(): ScoreData {
    return {
      profileId: this.profileId,
      address: this.address,
      value: this.value,
      breakdown: this.breakdown,
      percentile: this.percentile,
      updatedAt: this.updatedAt?.toISOString(),
    };
  }
}
