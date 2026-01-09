/**
 * Reviews resource for Ethos API.
 */

import { HTTPClient } from '../http';
import { Review, ReviewData, ReviewScore } from '../types/review';
import { BaseResource } from './base';

export interface ReviewsListParams {
  authorProfileId?: number;
  targetProfileId?: number;
  score?: ReviewScore;
  archived?: boolean;
  limit?: number;
}

/**
 * Reviews API resource.
 *
 * Access reviews left between profiles.
 */
export class Reviews extends BaseResource<Review, ReviewData> {
  protected readonly path = '/reviews';

  constructor(http: HTTPClient) {
    super(http);
  }

  protected parseItem(data: ReviewData): Review {
    return new Review(data);
  }

  /**
   * Get a review by ID.
   */
  async get(reviewId: number): Promise<Review> {
    const data = await this.http.get<ReviewData>(`${this.path}/${reviewId}`);
    return this.parseItem(data);
  }

  /**
   * Async generator for listing reviews with optional filtering.
   */
  async *list(params: ReviewsListParams = {}): AsyncGenerator<Review> {
    const queryParams: Record<string, unknown> = {};

    if (params.authorProfileId !== undefined) {
      queryParams['authorProfileId'] = params.authorProfileId;
    }
    if (params.targetProfileId !== undefined) {
      queryParams['subjectProfileId'] = params.targetProfileId;
    }
    if (params.score !== undefined) {
      queryParams['score'] = params.score;
    }
    if (params.archived !== undefined) {
      queryParams['archived'] = params.archived;
    }

    yield* this.paginate(this.path, queryParams, params.limit ?? 100);
  }

  /**
   * Get all reviews as array.
   */
  async listAll(params: ReviewsListParams = {}): Promise<Review[]> {
    return this.collectAll(this.list(params));
  }

  /**
   * Get all reviews received by a profile.
   */
  async forProfile(profileId: number): Promise<Review[]> {
    return this.listAll({ targetProfileId: profileId });
  }

  /**
   * Get all reviews given by a profile.
   */
  async byProfile(profileId: number): Promise<Review[]> {
    return this.listAll({ authorProfileId: profileId });
  }

  /**
   * Get positive reviews received by a profile.
   */
  async positiveFor(profileId: number): Promise<Review[]> {
    return this.listAll({ targetProfileId: profileId, score: 'positive' });
  }

  /**
   * Get negative reviews received by a profile.
   */
  async negativeFor(profileId: number): Promise<Review[]> {
    return this.listAll({ targetProfileId: profileId, score: 'negative' });
  }
}
