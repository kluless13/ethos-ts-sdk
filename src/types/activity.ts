/**
 * Activity types for Ethos on-chain activities.
 */

export type ActivityType =
  | 'vouch'
  | 'unvouch'
  | 'review'
  | 'attestation'
  | 'invite_accepted'
  | 'profile_created'
  | 'score_updated';

export interface ActivityData {
  id: number;
  type: string;
  authorProfileId?: number;
  subjectProfileId?: number;
  txHash?: string;
  blockNumber?: number;
  data: Record<string, unknown>;
  createdAt?: string;
}

/**
 * An on-chain activity on Ethos Network.
 *
 * Activities represent all actions taken on the network,
 * including vouches, reviews, attestations, and more.
 */
export class Activity {
  readonly id: number;
  readonly type: string;
  readonly authorProfileId?: number;
  readonly subjectProfileId?: number;
  readonly txHash?: string;
  readonly blockNumber?: number;
  readonly data: Record<string, unknown>;
  readonly createdAt?: Date;

  constructor(data: ActivityData) {
    this.id = data.id;
    this.type = data.type;
    this.authorProfileId = data.authorProfileId;
    this.subjectProfileId = data.subjectProfileId;
    this.txHash = data.txHash;
    this.blockNumber = data.blockNumber;
    this.data = data.data ?? {};
    this.createdAt = data.createdAt ? new Date(data.createdAt) : undefined;
  }

  /**
   * Alias for subjectProfileId.
   */
  get targetProfileId(): number | undefined {
    return this.subjectProfileId;
  }

  /**
   * Check if this is a vouch activity.
   */
  get isVouch(): boolean {
    return this.type === 'vouch';
  }

  /**
   * Check if this is a review activity.
   */
  get isReview(): boolean {
    return this.type === 'review';
  }

  /**
   * Alias for authorProfileId.
   */
  get actorId(): number | undefined {
    return this.authorProfileId;
  }

  /**
   * Get Basescan URL for this transaction.
   */
  get etherscanUrl(): string | undefined {
    if (this.txHash) {
      return `https://basescan.org/tx/${this.txHash}`;
    }
    return undefined;
  }

  /**
   * Convert to plain object.
   */
  toJSON(): ActivityData {
    return {
      id: this.id,
      type: this.type,
      authorProfileId: this.authorProfileId,
      subjectProfileId: this.subjectProfileId,
      txHash: this.txHash,
      blockNumber: this.blockNumber,
      data: this.data,
      createdAt: this.createdAt?.toISOString(),
    };
  }
}
