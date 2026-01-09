/**
 * Review types for Ethos reviews.
 */

export type ReviewScore = 'positive' | 'neutral' | 'negative';

export interface ReviewData {
  id: number;
  authorProfileId: number;
  subjectProfileId: number;
  score: ReviewScore;
  comment?: string;
  archived: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * A review on Ethos Network.
 *
 * Reviews are public ratings that users leave for other users,
 * contributing to their credibility score.
 */
export class Review {
  readonly id: number;
  readonly authorProfileId: number;
  readonly subjectProfileId: number;
  readonly score: ReviewScore;
  readonly comment?: string;
  readonly archived: boolean;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(data: ReviewData) {
    this.id = data.id;
    this.authorProfileId = data.authorProfileId;
    this.subjectProfileId = data.subjectProfileId;
    this.score = data.score;
    this.comment = data.comment;
    this.archived = data.archived ?? false;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : undefined;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : undefined;
  }

  /**
   * Alias for subjectProfileId.
   */
  get targetProfileId(): number {
    return this.subjectProfileId;
  }

  /**
   * Check if this is a positive review.
   */
  get isPositive(): boolean {
    return this.score === 'positive';
  }

  /**
   * Check if this is a negative review.
   */
  get isNegative(): boolean {
    return this.score === 'negative';
  }

  /**
   * Check if this is a neutral review.
   */
  get isNeutral(): boolean {
    return this.score === 'neutral';
  }

  /**
   * Alias for authorProfileId.
   */
  get reviewerId(): number {
    return this.authorProfileId;
  }

  /**
   * Alias for subjectProfileId.
   */
  get targetId(): number {
    return this.subjectProfileId;
  }

  /**
   * Convert to plain object.
   */
  toJSON(): ReviewData {
    return {
      id: this.id,
      authorProfileId: this.authorProfileId,
      subjectProfileId: this.subjectProfileId,
      score: this.score,
      comment: this.comment,
      archived: this.archived,
      createdAt: this.createdAt?.toISOString(),
      updatedAt: this.updatedAt?.toISOString(),
    };
  }
}
