# ethos-ts-sdk

Unofficial TypeScript SDK for the [Ethos Network](https://ethos.network) API.

## Installation

```bash
npm install ethos-ts-sdk
```

## Quick Start

```typescript
import { Ethos } from 'ethos-ts-sdk';

const client = new Ethos();

// Get profile by Twitter handle
const profile = await client.profiles.getByTwitter('vitalikbuterin');
console.log(profile.credibilityScore); // 1850
console.log(profile.scoreLevel);       // "reputable"

// Get vouches received
const vouches = await client.vouches.forProfile(profile.id);
for (const vouch of vouches) {
  console.log(`${vouch.voucherId} vouched ${vouch.amountEth} ETH`);
}

// Search profiles
const results = await client.profiles.search({ query: 'defi' });
```

## API Reference

### Client

```typescript
const client = new Ethos({
  baseUrl: 'https://api.ethos.network/api/v2', // optional
  clientName: 'my-app',                         // optional
  timeout: 30000,                               // optional, ms
  rateLimit: 500,                               // optional, ms between requests
  maxRetries: 3,                                // optional
});
```

### Profiles

```typescript
// Get by ID
const profile = await client.profiles.get(123);

// Get by Ethereum address
const profile = await client.profiles.getByAddress('0x...');

// Get by Twitter handle
const profile = await client.profiles.getByTwitter('username');

// Get by userkey
const profile = await client.profiles.getByUserkey('x.com/user/username');

// Search
const profiles = await client.profiles.search({ query: 'test', limit: 20 });

// List all (async generator)
for await (const profile of client.profiles.list()) {
  console.log(profile.displayName);
}

// Recent profiles
const recent = await client.profiles.recent(20);
```

### Vouches

```typescript
// Get by ID
const vouch = await client.vouches.get(123);

// List with filters
for await (const vouch of client.vouches.list({ 
  authorProfileId: 10,
  targetProfileId: 20,
  staked: true 
})) {
  console.log(vouch.amountEth);
}

// Get vouches received by a profile
const received = await client.vouches.forProfile(profileId);

// Get vouches given by a profile
const given = await client.vouches.byProfile(profileId);

// Check if vouch exists between two profiles
const vouch = await client.vouches.between(voucherId, targetId);
```

### Reviews

```typescript
// Get by ID
const review = await client.reviews.get(123);

// List with filters
for await (const review of client.reviews.list({ 
  targetProfileId: 20,
  score: 'positive' 
})) {
  console.log(review.comment);
}

// Get positive/negative reviews
const positive = await client.reviews.positiveFor(profileId);
const negative = await client.reviews.negativeFor(profileId);
```

### Markets

```typescript
// Get by ID
const market = await client.markets.get(123);

// Get by profile
const market = await client.markets.getByProfile(profileId);

// Top markets
const topVolume = await client.markets.topByVolume(20);
const trusted = await client.markets.mostTrusted(20);
const distrusted = await client.markets.mostDistrusted(20);
```

### Activities

```typescript
// Get by ID
const activity = await client.activities.get(123);

// Get for profile (as author or target)
const activities = await client.activities.forProfile(profileId);

// Get recent
const recent = await client.activities.recent(20);

// Filter by type
for await (const vouch of client.activities.vouches()) {
  console.log(vouch.etherscanUrl);
}
```

### Scores

```typescript
// Get by address
const score = await client.scores.get('0x...');

// Get by profile ID
const score = await client.scores.getByProfile(profileId);

// Get detailed breakdown
const score = await client.scores.breakdown('0x...');
console.log(score.breakdown.reviews);
console.log(score.breakdown.vouches);
```

## Types

All responses are typed with helper properties:

```typescript
// Profile
profile.twitterHandle      // extracted from userkeys
profile.scoreLevel         // 'untrusted' | 'questionable' | 'neutral' | 'reputable' | 'exemplary'
profile.credibilityScore   // alias for score
profile.vouchesReceivedCount
profile.reviewsPositive

// Vouch
vouch.amountWei           // BigInt
vouch.amountEth           // number
vouch.isActive            // staked && !archived

// Review
review.isPositive
review.isNegative
review.isNeutral

// Market
market.trustPercentage    // 0-100
market.marketSentiment    // 'bullish' | 'bearish' | 'neutral'
market.isVolatile

// Activity
activity.isVouch
activity.isReview
activity.etherscanUrl     // basescan.org link

// Score
score.level               // credibility level
score.isTrusted           // score >= 1600
score.isUntrusted         // score < 800
```

## Error Handling

```typescript
import { 
  EthosNotFoundError, 
  EthosRateLimitError,
  EthosAPIError 
} from 'ethos-ts-sdk';

try {
  const profile = await client.profiles.get(99999);
} catch (error) {
  if (error instanceof EthosNotFoundError) {
    console.log('Profile not found');
  } else if (error instanceof EthosRateLimitError) {
    console.log(`Rate limited, retry after ${error.retryAfter}s`);
  } else if (error instanceof EthosAPIError) {
    console.log(`API error: ${error.statusCode} - ${error.message}`);
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build
npm run build

# Lint
npm run lint
```

## License

MIT
