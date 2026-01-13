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

interface VouchesQueryBody {
  authorProfileIds?: number[];
  subjectProfileIds?: number[];
  staked?: boolean;
  archived?: boolean;
  limit: number;
  offset: number;
}

interface VouchesQueryResponse {
  total: number;
  values: VouchData[];
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
   * Query vouches using POST endpoint with body parameters.
   */
  private async query(body: VouchesQueryBody): Promise<VouchesQueryResponse> {
    return this.http.post<VouchesQueryResponse>(this.path, body);
  }

  /**
   * Async generator for listing vouches with optional filtering.
   * Uses POST /vouches with body parameters.
   */
  async *list(params: VouchesListParams = {}): AsyncGenerator<Vouch> {
    const limit = params.limit ?? 100;
    let offset = 0;

    while (true) {
      const body: VouchesQueryBody = { limit, offset };

      if (params.authorProfileId !== undefined) {
        body.authorProfileIds = [params.authorProfileId];
      }
      if (params.targetProfileId !== undefined) {
        body.subjectProfileIds = [params.targetProfileId];
      }
      if (params.staked !== undefined) {
        body.staked = params.staked;
      }
      if (params.archived !== undefined) {
        body.archived = params.archived;
      }

      const response = await this.query(body);
      const items = response.values ?? [];

      if (items.length === 0) {
        break;
      }

      for (const item of items) {
        yield this.parseItem(item);
      }

      if (items.length < limit) {
        break;
      }

      offset += limit;
    }
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
