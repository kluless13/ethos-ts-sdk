/**
 * Activities resource for Ethos API.
 */

import { HTTPClient } from '../http';
import { Activity, ActivityData } from '../types/activity';
import { BaseResource } from './base';

export interface ActivitiesListParams {
  authorProfileId?: number;
  targetProfileId?: number;
  activityType?: string;
  limit?: number;
}

/**
 * Activities API resource.
 *
 * Access on-chain activities (vouches, reviews, etc.).
 */
export class Activities extends BaseResource<Activity, ActivityData> {
  protected readonly path = '/activities';

  constructor(http: HTTPClient) {
    super(http);
  }

  protected parseItem(data: ActivityData): Activity {
    return new Activity(data);
  }

  /**
   * Get an activity by ID.
   */
  async get(activityId: number): Promise<Activity> {
    const data = await this.http.get<ActivityData>(
      `${this.path}/${activityId}`
    );
    return this.parseItem(data);
  }

  /**
   * Async generator for listing activities with optional filtering.
   */
  async *list(params: ActivitiesListParams = {}): AsyncGenerator<Activity> {
    const queryParams: Record<string, unknown> = {};

    if (params.authorProfileId !== undefined) {
      queryParams['authorProfileId'] = params.authorProfileId;
    }
    if (params.targetProfileId !== undefined) {
      queryParams['subjectProfileId'] = params.targetProfileId;
    }
    if (params.activityType !== undefined) {
      queryParams['type'] = params.activityType;
    }

    yield* this.paginate(this.path, queryParams, params.limit ?? 100);
  }

  /**
   * Get all activities as array.
   */
  async listAll(params: ActivitiesListParams = {}): Promise<Activity[]> {
    return this.collectAll(this.list(params));
  }

  /**
   * Get all activities involving a profile (as actor or target).
   */
  async forProfile(profileId: number): Promise<Activity[]> {
    const asAuthor = await this.listAll({ authorProfileId: profileId });
    const asTarget = await this.listAll({ targetProfileId: profileId });

    // Combine and dedupe by ID
    const seen = new Set<number>();
    const combined: Activity[] = [];

    for (const activity of [...asAuthor, ...asTarget]) {
      if (!seen.has(activity.id)) {
        seen.add(activity.id);
        combined.push(activity);
      }
    }

    // Sort by created_at descending
    return combined.sort((a, b) => {
      const aTime = a.createdAt?.getTime() ?? 0;
      const bTime = b.createdAt?.getTime() ?? 0;
      return bTime - aTime;
    });
  }

  /**
   * Async generator for vouch activities.
   */
  async *vouches(limit = 100): AsyncGenerator<Activity> {
    yield* this.list({ activityType: 'vouch', limit });
  }

  /**
   * Async generator for review activities.
   */
  async *reviews(limit = 100): AsyncGenerator<Activity> {
    yield* this.list({ activityType: 'review', limit });
  }

  /**
   * Get recent activities.
   */
  async recent(limit = 20): Promise<Activity[]> {
    const activities: Activity[] = [];
    for await (const activity of this.list({ limit })) {
      activities.push(activity);
      if (activities.length >= limit) break;
    }
    return activities;
  }
}
