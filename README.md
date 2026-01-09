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

// Initialize client
const client = new Ethos();

// Get a profile by Twitter handle
const profile = await client.profiles.getByTwitter('vitalikbuterin');
console.log(`${profile.twitterHandle}: ${profile.credibilityScore}`);

// List all vouches
for await (const vouch of client.vouches.list()) {
  console.log(`${vouch.voucherId} vouched for ${vouch.subjectProfileId}`);
}

// Get vouches for a specific profile
const vouches = await client.vouches.forProfile(123);

// Search users
const users = await client.profiles.search({ query: 'ethereum' });
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

## Usage

### Profiles

```typescript
import { Ethos } from 'ethos-ts-sdk';

const client = new Ethos();

// Get profile by ID
const profile = await client.profiles.get(123);

// Get profile by Ethereum address
const profile = await client.profiles.getByAddress('0x123...');

// Get profile by Twitter handle
const profile = await client.profiles.getByTwitter('username');

// Search profiles
const profiles = await client.profiles.search({ query: 'defi', limit: 20 });

// List all profiles (async generator)
for await (const profile of client.profiles.list()) {
  console.log(profile.credibilityScore);
}

// Helper properties
console.log(profile.scoreLevel);        // "reputable"
console.log(profile.twitterHandle);     // "vitalikbuterin"
console.log(profile.vouchesReceivedCount);
```

### Vouches

```typescript
// List all vouches
for await (const vouch of client.vouches.list()) {
  console.log(`Amount: ${vouch.amountEth} ETH`);
}

// Filter vouches
for await (const vouch of client.vouches.list({
  targetProfileId: 123,      // Vouches received by profile
  authorProfileId: 456,      // Vouches given by profile
  staked: true,              // Only active vouches
})) {
  console.log(vouch.amountWei);
}

// Get vouches for a profile
const received = await client.vouches.forProfile(profileId);
const given = await client.vouches.byProfile(profileId);

// Check if vouch exists between two profiles
const vouch = await client.vouches.between(voucherId, targetId);
```

### Reviews

```typescript
// List all reviews
for await (const review of client.reviews.list()) {
  console.log(review.comment);
}

// Filter by target
for await (const review of client.reviews.list({ targetProfileId: 123 })) {
  console.log(review.score);
}

// Filter by sentiment
const positive = await client.reviews.positiveFor(profileId);
const negative = await client.reviews.negativeFor(profileId);

// Helper properties
console.log(review.isPositive);  // true
console.log(review.isNegative);  // false
```

### Markets (Reputation Trading)

```typescript
// List reputation markets
for await (const market of client.markets.list()) {
  console.log(`Trust: ${market.trustPrice}, Distrust: ${market.distrustPrice}`);
}

// Get specific market
const market = await client.markets.get(1);
const market = await client.markets.getByProfile(profileId);

// Top markets
const topVolume = await client.markets.topByVolume(20);
const mostTrusted = await client.markets.mostTrusted(20);
const mostDistrusted = await client.markets.mostDistrusted(20);

// Helper properties
console.log(market.trustPercentage);   // 75
console.log(market.marketSentiment);   // "bullish"
```

### Activities

```typescript
// List all activities
for await (const activity of client.activities.list()) {
  console.log(activity.type);
}

// Filter by type
for await (const activity of client.activities.vouches()) {
  console.log(activity.etherscanUrl);
}

for await (const activity of client.activities.reviews()) {
  console.log(activity.data);
}

// Get activities for a profile
const activities = await client.activities.forProfile(profileId);
const recent = await client.activities.recent(20);
```

### Credibility Scores

```typescript
// Get score for an address
const score = await client.scores.get('0x123...');
console.log(`Score: ${score.value}`);
console.log(`Level: ${score.level}`);  // "untrusted", "neutral", "reputable", etc.

// Get by profile ID
const score = await client.scores.getByProfile(profileId);

// Get detailed breakdown
const score = await client.scores.breakdown('0x123...');
console.log(score.breakdown.reviews);
console.log(score.breakdown.vouches);

// Helper properties
console.log(score.isTrusted);    // score >= 1600
console.log(score.isUntrusted);  // score < 800
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
