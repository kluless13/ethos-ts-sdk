/**
 * Vouch types for Ethos vouching relationships.
 */

export interface VouchData {
  id: number;
  authorProfileId: number;
  subjectProfileId: number;
  staked: boolean;
  archived: boolean;
  unhealthy: boolean;
  balance: string;
  activityCheckpoints: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * A vouch relationship on Ethos Network.
 *
 * A vouch represents one user staking ETH on another user's reputation,
 * signaling trust and confidence in that person.
 */
export class Vouch {
  readonly id: number;
  readonly authorProfileId: number;
  readonly subjectProfileId: number;
  readonly staked: boolean;
  readonly archived: boolean;
  readonly unhealthy: boolean;
  readonly balance: string;
  readonly activityCheckpoints: Record<string, unknown>;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(data: VouchData) {
    this.id = data.id;
    this.authorProfileId = data.authorProfileId;
    this.subjectProfileId = data.subjectProfileId;
    this.staked = data.staked ?? true;
    this.archived = data.archived ?? false;
    this.unhealthy = data.unhealthy ?? false;
    this.balance = data.balance ?? '0';
    this.activityCheckpoints = data.activityCheckpoints ?? {};
    this.createdAt = data.createdAt ? new Date(data.createdAt) : undefined;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : undefined;
  }

  /**
   * Alias for authorProfileId.
   */
  get targetProfileId(): number {
    return this.subjectProfileId;
  }

  /**
   * Get the vouch amount in wei as a bigint.
   */
  get amountWei(): bigint {
    return BigInt(this.balance);
  }

  /**
   * Get the vouch amount in ETH.
   */
  get amountEth(): number {
    return Number(this.amountWei) / 1e18;
  }

  /**
   * Check if the vouch is currently active.
   */
  get isActive(): boolean {
    return this.staked && !this.archived;
  }

  /**
   * Alias for authorProfileId.
   */
  get voucherId(): number {
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
  toJSON(): VouchData {
    return {
      id: this.id,
      authorProfileId: this.authorProfileId,
      subjectProfileId: this.subjectProfileId,
      staked: this.staked,
      archived: this.archived,
      unhealthy: this.unhealthy,
      balance: this.balance,
      activityCheckpoints: this.activityCheckpoints,
      createdAt: this.createdAt?.toISOString(),
      updatedAt: this.updatedAt?.toISOString(),
    };
  }
}
