/**
 * Main Ethos client class.
 */

import { EthosConfig, EthosConfigOptions } from './config';
import { HTTPClient } from './http';
import { Profiles } from './resources/profiles';
import { Vouches } from './resources/vouches';
import { Reviews } from './resources/reviews';
import { Markets } from './resources/markets';
import { Activities } from './resources/activities';
import { Scores } from './resources/scores';

/**
 * Ethos Network API client.
 *
 * @example
 * ```typescript
 * import { Ethos } from 'ethos-ts-sdk';
 *
 * const client = new Ethos();
 * const profile = await client.profiles.getByTwitter('vitalikbuterin');
 * console.log(profile.credibilityScore);
 * ```
 */
export class Ethos {
  readonly config: EthosConfig;
  private readonly http: HTTPClient;

  readonly profiles: Profiles;
  readonly vouches: Vouches;
  readonly reviews: Reviews;
  readonly markets: Markets;
  readonly activities: Activities;
  readonly scores: Scores;

  constructor(options: EthosConfigOptions = {}) {
    this.config = new EthosConfig(options);
    this.http = new HTTPClient(this.config);

    this.profiles = new Profiles(this.http);
    this.vouches = new Vouches(this.http);
    this.reviews = new Reviews(this.http);
    this.markets = new Markets(this.http);
    this.activities = new Activities(this.http);
    this.scores = new Scores(this.http);
  }
}
