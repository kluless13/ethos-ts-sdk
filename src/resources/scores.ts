/**
 * Scores resource for Ethos API.
 */

import { HTTPClient } from '../http';
import { Score, ScoreData } from '../types/score';
import { BaseResource } from './base';

/**
 * Scores API resource.
 *
 * Access credibility scores for profiles.
 */
export class Scores extends BaseResource<Score, ScoreData> {
  protected readonly path = '/score';

  constructor(http: HTTPClient) {
    super(http);
  }

  protected parseItem(data: ScoreData): Score {
    return new Score(data);
  }

  /**
   * Get the credibility score for an address.
   */
  async get(address: string): Promise<Score> {
    const data = await this.http.get<ScoreData>(`${this.path}/${address}`);
    return this.parseItem(data);
  }

  /**
   * Get the credibility score for a profile ID.
   */
  async getByProfile(profileId: number): Promise<Score> {
    const data = await this.http.get<ScoreData>(
      `${this.path}/profile/${profileId}`
    );
    return this.parseItem(data);
  }

  /**
   * Get detailed score breakdown for an address.
   */
  async breakdown(address: string): Promise<Score> {
    const data = await this.http.get<ScoreData>(
      `${this.path}/${address}/breakdown`
    );
    return this.parseItem(data);
  }
}
