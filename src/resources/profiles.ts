/**
 * Profiles resource for Ethos API.
 */

import { HTTPClient } from '../http';
import { Profile, ProfileData } from '../types/profile';
import { BaseResource } from './base';

export interface ProfilesListParams {
  limit?: number;
  offset?: number;
  orderBy?: string;
}

export interface ProfilesSearchParams {
  query: string;
  limit?: number;
  offset?: number;
}

/**
 * Profiles API resource.
 *
 * Access Ethos user profiles by ID, address, or Twitter handle.
 */
export class Profiles extends BaseResource<Profile, ProfileData> {
  protected readonly path = '/profiles';

  constructor(http: HTTPClient) {
    super(http);
  }

  protected parseItem(data: ProfileData): Profile {
    return new Profile(data);
  }

  /**
   * Get a profile by ID.
   */
  async get(profileId: number): Promise<Profile> {
    const data = await this.http.get<ProfileData>(`${this.path}/${profileId}`);
    return this.parseItem(data);
  }

  /**
   * Get a profile by Ethereum address.
   */
  async getByAddress(address: string): Promise<Profile> {
    const data = await this.http.get<ProfileData>(
      `${this.path}/address/${address}`
    );
    return this.parseItem(data);
  }

  /**
   * Get a profile by Twitter/X handle.
   */
  async getByTwitter(handle: string): Promise<Profile> {
    const cleanHandle = handle.replace(/^@/, '');
    const userkey = `x.com/user/${cleanHandle}`;
    const data = await this.http.get<ProfileData>(
      `${this.path}/userkey/${encodeURIComponent(userkey)}`
    );
    return this.parseItem(data);
  }

  /**
   * Get a profile by userkey.
   */
  async getByUserkey(userkey: string): Promise<Profile> {
    const data = await this.http.get<ProfileData>(
      `${this.path}/userkey/${encodeURIComponent(userkey)}`
    );
    return this.parseItem(data);
  }

  /**
   * Search profiles by name or username.
   */
  async search(params: ProfilesSearchParams): Promise<Profile[]> {
    const response = await this.http.get<unknown>(`${this.path}/search`, {
      query: params.query,
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    });
    const items = this.extractItems(response);
    return this.parseList(items);
  }

  /**
   * Async generator for listing all profiles.
   */
  async *list(params: ProfilesListParams = {}): AsyncGenerator<Profile> {
    const queryParams: Record<string, unknown> = {};
    if (params.orderBy) {
      queryParams['orderBy'] = params.orderBy;
    }
    yield* this.paginate(this.path, queryParams, params.limit ?? 100);
  }

  /**
   * Get all profiles as array (use with caution for large datasets).
   */
  async listAll(params: ProfilesListParams = {}): Promise<Profile[]> {
    return this.collectAll(this.list(params));
  }

  /**
   * Get recently created profiles.
   */
  async recent(limit = 20): Promise<Profile[]> {
    const response = await this.http.get<unknown>(`${this.path}/recent`, {
      limit,
    });
    const items = this.extractItems(response);
    return this.parseList(items);
  }
}
