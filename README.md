# ethos-ts-sdk

**The unofficial TypeScript SDK for [Ethos Network](https://ethos.network) API**

First TypeScript client for interacting with Ethos Network's on-chain reputation protocol.

[![npm version](https://img.shields.io/npm/v/ethos-ts-sdk.svg)](https://www.npmjs.com/package/ethos-ts-sdk)
[![npm downloads](https://img.shields.io/npm/dm/ethos-ts-sdk.svg)](https://www.npmjs.com/package/ethos-ts-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Test Coverage](https://img.shields.io/badge/coverage-97.78%25-brightgreen.svg)](https://github.com/kluless13/ethos-ts-sdk)

---

## Installation

```bash
npm install ethos-ts-sdk
```

---

## Quick Start

```typescript
import { Ethos } from 'ethos-ts-sdk';

const client = new Ethos();

// Get a profile by Twitter handle
const profile = await client.profiles.getByTwitter('vitalikbuterin');
console.log(`Score: ${profile.score}`);  // 2334

// Get global stats
const stats = await client.profiles.stats();
console.log(`Active profiles: ${stats.activeProfiles}`);

// Get vouches for a profile
const vouches = await client.vouches.forProfile(8);
console.log(`Received ${vouches.length} vouches`);

// Iterate through markets
for await (const market of client.markets.list({ limit: 10 })) {
  console.log(`Profile #${market.profileId}: ${market.trustVotes} trust votes`);
}
```

---

## Features

- **Simple, intuitive API** - Resource-based design (`client.vouches.list()`)
- **Full TypeScript support** - Complete type definitions and autocomplete
- **Typed response objects** - Classes with helper properties and methods
- **Async generators** - Iterate through paginated results seamlessly
- **Built-in rate limiting** - Respects API limits automatically
- **Retry with backoff** - Handles transient failures gracefully
- **Custom error classes** - Catch specific errors like `EthosNotFoundError`

---

## API Reference

### Profiles

```typescript
import { Ethos } from 'ethos-ts-sdk';

const client = new Ethos();

// ─────────────────────────────────────────────────────────────────
// Get profile by Twitter/X handle
// ─────────────────────────────────────────────────────────────────
const profile = await client.profiles.getByTwitter('edoweb3');
console.log(profile.id);                          // 6694
console.log(profile.score);                       // 1783 (credibility score)
console.log(profile.xpTotal);                     // 122887
console.log(profile.status);                      // "ACTIVE"
console.log(profile.stats.vouch.received.count);  // 24
console.log(profile.stats.review.received.positive);  // 931

// ─────────────────────────────────────────────────────────────────
// Other lookup methods
// ─────────────────────────────────────────────────────────────────
const byId = await client.profiles.get(123);
const byAddress = await client.profiles.getByAddress('0x123...');
const byUserkey = await client.profiles.getByUserkey('farcaster.xyz/user/fid/12345');

// ─────────────────────────────────────────────────────────────────
// Search profiles
// ─────────────────────────────────────────────────────────────────
const results = await client.profiles.search({ query: 'ethereum', limit: 20 });

// ─────────────────────────────────────────────────────────────────
// Global statistics
// ─────────────────────────────────────────────────────────────────
const stats = await client.profiles.stats();
console.log(stats.activeProfiles);    // 35831
console.log(stats.invitesAvailable);  // 39315

// ─────────────────────────────────────────────────────────────────
// Helper properties
// ─────────────────────────────────────────────────────────────────
console.log(profile.scoreLevel);           // "reputable" | "exemplary" | "neutral" | etc.
console.log(profile.twitterHandle);        // "edoweb3"
console.log(profile.vouchesReceivedCount); // 24
console.log(profile.vouchesGivenCount);    // 5
console.log(profile.reviewsPositive);      // 931
console.log(profile.reviewsNegative);      // 3
```

### Vouches

The vouches API uses POST internally for efficient querying.

```typescript
// ─────────────────────────────────────────────────────────────────
// Iterate through vouches (async generator)
// ─────────────────────────────────────────────────────────────────
for await (const vouch of client.vouches.list()) {
  console.log(vouch.authorProfileId);   // Who gave the vouch
  console.log(vouch.subjectProfileId);  // Who received it
  console.log(vouch.amountEth);         // Staked amount in ETH (e.g., "1.5")
  console.log(vouch.amountWei);         // Raw wei amount
  console.log(vouch.staked);            // true if active
  console.log(vouch.archived);          // true if withdrawn
}

// ─────────────────────────────────────────────────────────────────
// Filter vouches
// ─────────────────────────────────────────────────────────────────
for await (const vouch of client.vouches.list({
  targetProfileId: 123,   // Vouches received by this profile
  authorProfileId: 456,   // Vouches given by this profile
  staked: true,           // Only active vouches
  archived: false,        // Exclude withdrawn vouches
})) {
  console.log(vouch.id);
}

// ─────────────────────────────────────────────────────────────────
// Get vouches for a specific profile (returns array)
// ─────────────────────────────────────────────────────────────────
const received = await client.vouches.forProfile(6694);  // Vouches received
const given = await client.vouches.byProfile(6694);      // Vouches given

console.log(`Received ${received.length} vouches`);
for (const v of received.slice(0, 3)) {
  console.log(`  From profile #${v.authorProfileId}`);
}

// ─────────────────────────────────────────────────────────────────
// Check if vouch exists between two profiles
// ─────────────────────────────────────────────────────────────────
const vouch = await client.vouches.between(voucherId, targetId);
if (vouch) {
  console.log(`Vouch exists: ${vouch.amountEth} ETH`);
}
```

### Markets (Reputation Trading)

Markets allow users to trade trust/distrust votes on profiles.

```typescript
// ─────────────────────────────────────────────────────────────────
// Iterate through markets (async generator)
// ─────────────────────────────────────────────────────────────────
for await (const market of client.markets.list()) {
  console.log(market.profileId);      // 15172
  console.log(market.trustVotes);     // 492
  console.log(market.distrustVotes);  // 1
  console.log(market.trustPrice);     // 0.50 (50% probability)
  console.log(market.distrustPrice);  // 0.50
  console.log(market.totalVolume);    // Total trading volume
  console.log(market.isActive);       // true
}

// With limit
for await (const market of client.markets.list({ limit: 10 })) {
  console.log(market.id);
}

// ─────────────────────────────────────────────────────────────────
// Get all markets as array (returns Promise<Market[]>)
// ─────────────────────────────────────────────────────────────────
const allMarkets = await client.markets.listAll();
console.log(`Total markets: ${allMarkets.length}`);  // 219

// ─────────────────────────────────────────────────────────────────
// Get specific market
// ─────────────────────────────────────────────────────────────────
const market = await client.markets.get(123);
const marketByProfile = await client.markets.getByProfile(profileId);

// ─────────────────────────────────────────────────────────────────
// Top markets (returns Promise<Market[]>)
// ─────────────────────────────────────────────────────────────────
const topVolume = await client.markets.topByVolume(20);
const mostTrusted = await client.markets.mostTrusted(20);
const mostDistrusted = await client.markets.mostDistrusted(20);

// ─────────────────────────────────────────────────────────────────
// Helper properties
// ─────────────────────────────────────────────────────────────────
console.log(market.trustPercentage);   // 75 (0-100)
console.log(market.distrustPercentage); // 25
console.log(market.marketSentiment);   // "bullish" | "bearish" | "neutral"
console.log(market.isVolatile);        // true if close to 50/50
```

> **Note:** `list()` returns an `AsyncGenerator` for streaming. Use `listAll()`, `topByVolume()`, `mostTrusted()`, etc. when you need an array.

### Reviews

```typescript
// ─────────────────────────────────────────────────────────────────
// Iterate through reviews (async generator)
// ─────────────────────────────────────────────────────────────────
for await (const review of client.reviews.list()) {
  console.log(review.authorProfileId);
  console.log(review.subjectProfileId);
  console.log(review.score);      // "positive" | "neutral" | "negative"
  console.log(review.comment);
  console.log(review.archived);
}

// ─────────────────────────────────────────────────────────────────
// Filter by target profile
// ─────────────────────────────────────────────────────────────────
for await (const review of client.reviews.list({ targetProfileId: 123 })) {
  console.log(review.comment);
}

// ─────────────────────────────────────────────────────────────────
// Get reviews by sentiment (returns array)
// ─────────────────────────────────────────────────────────────────
const positive = await client.reviews.positiveFor(profileId);
const negative = await client.reviews.negativeFor(profileId);

// ─────────────────────────────────────────────────────────────────
// Helper properties
// ─────────────────────────────────────────────────────────────────
console.log(review.isPositive);  // true
console.log(review.isNegative);  // false
console.log(review.isNeutral);   // false
```

### Activities

```typescript
// ─────────────────────────────────────────────────────────────────
// Iterate through activities (async generator)
// ─────────────────────────────────────────────────────────────────
for await (const activity of client.activities.list()) {
  console.log(activity.type);             // "vouch" | "review" | "unvouch" | etc.
  console.log(activity.authorProfileId);
  console.log(activity.subjectProfileId);
  console.log(activity.data);
}

// ─────────────────────────────────────────────────────────────────
// Filter by type
// ─────────────────────────────────────────────────────────────────
for await (const activity of client.activities.vouches()) {
  console.log(activity.etherscanUrl);
}

for await (const activity of client.activities.reviews()) {
  console.log(activity.data);
}

// ─────────────────────────────────────────────────────────────────
// Get recent activities
// ─────────────────────────────────────────────────────────────────
const recent = await client.activities.recent(20);
const forProfile = await client.activities.forProfile(profileId);

// ─────────────────────────────────────────────────────────────────
// Helper properties
// ─────────────────────────────────────────────────────────────────
console.log(activity.isVouch);
console.log(activity.isReview);
```

### Credibility Scores

```typescript
// ─────────────────────────────────────────────────────────────────
// Get score for an address
// ─────────────────────────────────────────────────────────────────
const score = await client.scores.get('0x123...');
console.log(score.value);   // 1700
console.log(score.level);   // "reputable"

// ─────────────────────────────────────────────────────────────────
// Get by profile ID
// ─────────────────────────────────────────────────────────────────
const score = await client.scores.getByProfile(profileId);

// ─────────────────────────────────────────────────────────────────
// Get detailed breakdown
// ─────────────────────────────────────────────────────────────────
const score = await client.scores.breakdown('0x123...');
console.log(score.breakdown.reviews);      // 500
console.log(score.breakdown.vouches);      // 800
console.log(score.breakdown.attestations); // 200
console.log(score.breakdown.activity);     // 100
console.log(score.breakdown.history);      // 100

// ─────────────────────────────────────────────────────────────────
// Helper properties
// ─────────────────────────────────────────────────────────────────
console.log(score.isTrusted);     // true if score >= 1600
console.log(score.isUntrusted);   // true if score < 800
console.log(score.isExemplary);   // true if score >= 2000
```

### Score Levels

| Score Range | Level |
|-------------|-------|
| 0-799 | Untrusted |
| 800-1199 | Questionable |
| 1200-1599 | Neutral |
| 1600-1999 | Reputable |
| 2000-2800 | Exemplary |

---

## Important: Generators vs Arrays

Some methods return **async generators** (for streaming pagination), while others return **arrays**:

| Method | Returns | Usage |
|--------|---------|-------|
| `markets.list()` | `AsyncGenerator<Market>` | `for await (const m of ...)` |
| `markets.listAll()` | `Promise<Market[]>` | `const arr = await ...` |
| `markets.topByVolume()` | `Promise<Market[]>` | `const arr = await ...` |
| `markets.mostTrusted()` | `Promise<Market[]>` | `const arr = await ...` |
| `vouches.list()` | `AsyncGenerator<Vouch>` | `for await (const v of ...)` |
| `vouches.forProfile()` | `Promise<Vouch[]>` | `const arr = await ...` |
| `vouches.byProfile()` | `Promise<Vouch[]>` | `const arr = await ...` |

```typescript
// ✅ Correct: Use for await with generators
for await (const market of client.markets.list()) {
  console.log(market);
}

// ✅ Correct: Use await with array-returning methods
const allMarkets = await client.markets.listAll();
const topMarkets = await client.markets.topByVolume(10);

// ❌ Wrong: Don't use for await on array methods
// for await (const m of client.markets.listAll()) { } // Error!
```

---

## Configuration

```typescript
const client = new Ethos({
  baseUrl: 'https://api.ethos.network/api/v2',  // API endpoint
  clientName: 'my-app',                          // X-Ethos-Client header
  timeout: 30000,                                // Request timeout (ms)
  rateLimit: 500,                                // Min ms between requests
  maxRetries: 3,                                 // Retry failed requests
});

// Or use environment variables
// ETHOS_API_BASE_URL, ETHOS_CLIENT_NAME, ETHOS_TIMEOUT, etc.
```

---

## Error Handling

```typescript
import {
  EthosNotFoundError,
  EthosRateLimitError,
  EthosAuthenticationError,
  EthosAPIError,
} from 'ethos-ts-sdk';

try {
  const profile = await client.profiles.get(99999);
} catch (error) {
  if (error instanceof EthosNotFoundError) {
    console.log('Profile not found');
  } else if (error instanceof EthosRateLimitError) {
    console.log(`Rate limited, retry after ${error.retryAfter}s`);
  } else if (error instanceof EthosAuthenticationError) {
    console.log('Authentication failed');
  } else if (error instanceof EthosAPIError) {
    console.log(`API error: ${error.statusCode} - ${error.message}`);
  }
}
```

---

## TypeScript Types

All types are exported for use in your application:

```typescript
import {
  // Client
  Ethos,
  EthosConfig,
  
  // Types
  Profile,
  ProfileData,
  Vouch,
  VouchData,
  Review,
  ReviewData,
  Market,
  MarketData,
  Activity,
  ActivityData,
  Score,
  ScoreData,
  
  // Errors
  EthosError,
  EthosAPIError,
  EthosNotFoundError,
  EthosRateLimitError,
} from 'ethos-ts-sdk';
```

---

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

---

## License

MIT

---

## Disclaimer

This is an unofficial SDK and is not affiliated with or endorsed by Ethos Network.
