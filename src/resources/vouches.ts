/**
 * Vouches resource for Ethos API.
 */

import { HTTPClient } from '../http';
import { Vouch, VouchData } from '../types/vouch';
import { BaseResource } from './base';

export interface VouchesListParams {
  authorProfileId?: number;
  targetProfileId?: number;
  staked?: boolean;
  archived?: boolean;
  limit?: number;
}

/**
 * Vouches API resource.
 *
 * Access vouch relationships between profiles.
 */
export class Vouches extends BaseResource<Vouch, VouchData> {
  protected readonly path = '/vouches';

  constructor(http: HTTPClient) {
    super(http);
  }

  protected parseItem(data: VouchData): Vouch {
    return new Vouch(data);
  }

  /**
   * Get a vouch by ID.
   */
  async get(vouchId: number): Promise<Vouch> {
    const data = await this.http.get<VouchData>(`${this.path}/${vouchId}`);
    return this.parseItem(data);
  }

  /**
   * Async generator for listing vouches with optional filtering.
   */
  async *list(params: VouchesListParams = {}): AsyncGenerator<Vouch> {
    const queryParams: Record<string, unknown> = {};

    if (params.authorProfileId !== undefined) {
      queryParams['authorProfileId'] = params.authorProfileId;
    }
    if (params.targetProfileId !== undefined) {
      queryParams['subjectProfileId'] = params.targetProfileId;
    }
    if (params.staked !== undefined) {
      queryParams['staked'] = params.staked;
    }
    if (params.archived !== undefined) {
      queryParams['archived'] = params.archived;
    }

    yield* this.paginate(this.path, queryParams, params.limit ?? 100);
  }

  /**
   * Get all vouches as array.
   */
  async listAll(params: VouchesListParams = {}): Promise<Vouch[]> {
    return this.collectAll(this.list(params));
  }

  /**
   * Get all vouches received by a profile.
   */
  async forProfile(profileId: number): Promise<Vouch[]> {
    return this.listAll({ targetProfileId: profileId });
  }

  /**
   * Get all vouches given by a profile.
   */
  async byProfile(profileId: number): Promise<Vouch[]> {
    return this.listAll({ authorProfileId: profileId });
  }

  /**
   * Get the vouch between two profiles if it exists.
   */
  async between(voucherId: number, targetId: number): Promise<Vouch | null> {
    const vouches: Vouch[] = [];
    for await (const vouch of this.list({
      authorProfileId: voucherId,
      targetProfileId: targetId,
      limit: 1,
    })) {
      vouches.push(vouch);
      break;
    }
    return vouches[0] ?? null;
  }
}
