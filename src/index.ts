/**
 * Ethos Network TypeScript SDK
 */

// Client
export { Ethos } from './client';
export { EthosConfig } from './config';
export type { EthosConfigOptions } from './config';
export { HTTPClient } from './http';

// Types - classes
export { Profile } from './types/profile';
export type { ProfileData, ProfileStats, ProfileLinks } from './types/profile';
export { Vouch } from './types/vouch';
export type { VouchData } from './types/vouch';
export { Review } from './types/review';
export type { ReviewData, ReviewScore } from './types/review';
export { Market } from './types/market';
export type { MarketData } from './types/market';
export { Activity } from './types/activity';
export type { ActivityData, ActivityType } from './types/activity';
export { Score } from './types/score';
export type { ScoreData, ScoreBreakdown } from './types/score';

// Errors
export { EthosError, EthosAPIError, EthosNotFoundError, EthosRateLimitError, EthosValidationError, EthosAuthenticationError } from './errors';

// Resources
export { Profiles } from './resources/profiles';
export type { ProfilesListParams, ProfilesSearchParams } from './resources/profiles';
export { Vouches } from './resources/vouches';
export type { VouchesListParams } from './resources/vouches';
export { Reviews } from './resources/reviews';
export type { ReviewsListParams } from './resources/reviews';
export { Markets } from './resources/markets';
export type { MarketsListParams } from './resources/markets';
export { Activities } from './resources/activities';
export type { ActivitiesListParams } from './resources/activities';
export { Scores } from './resources/scores';
