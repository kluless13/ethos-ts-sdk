/**
 * Tests for index exports
 */

import { describe, it, expect } from 'vitest';
import * as EthosSDK from '../src/index';

describe('Index exports', () => {
  it('should export Ethos client', () => {
    expect(EthosSDK.Ethos).toBeDefined();
  });

  it('should export EthosConfig', () => {
    expect(EthosSDK.EthosConfig).toBeDefined();
  });

  it('should export HTTPClient', () => {
    expect(EthosSDK.HTTPClient).toBeDefined();
  });

  describe('Types', () => {
    it('should export Profile', () => {
      expect(EthosSDK.Profile).toBeDefined();
    });

    it('should export Vouch', () => {
      expect(EthosSDK.Vouch).toBeDefined();
    });

    it('should export Review', () => {
      expect(EthosSDK.Review).toBeDefined();
    });

    it('should export Market', () => {
      expect(EthosSDK.Market).toBeDefined();
    });

    it('should export Activity', () => {
      expect(EthosSDK.Activity).toBeDefined();
    });

    it('should export Score', () => {
      expect(EthosSDK.Score).toBeDefined();
    });
  });

  describe('Resources', () => {
    it('should export Profiles', () => {
      expect(EthosSDK.Profiles).toBeDefined();
    });

    it('should export Vouches', () => {
      expect(EthosSDK.Vouches).toBeDefined();
    });

    it('should export Reviews', () => {
      expect(EthosSDK.Reviews).toBeDefined();
    });

    it('should export Markets', () => {
      expect(EthosSDK.Markets).toBeDefined();
    });

    it('should export Activities', () => {
      expect(EthosSDK.Activities).toBeDefined();
    });

    it('should export Scores', () => {
      expect(EthosSDK.Scores).toBeDefined();
    });
  });

  describe('Errors', () => {
    it('should export EthosError', () => {
      expect(EthosSDK.EthosError).toBeDefined();
    });

    it('should export EthosAPIError', () => {
      expect(EthosSDK.EthosAPIError).toBeDefined();
    });

    it('should export EthosNotFoundError', () => {
      expect(EthosSDK.EthosNotFoundError).toBeDefined();
    });

    it('should export EthosRateLimitError', () => {
      expect(EthosSDK.EthosRateLimitError).toBeDefined();
    });

    it('should export EthosValidationError', () => {
      expect(EthosSDK.EthosValidationError).toBeDefined();
    });

    it('should export EthosAuthenticationError', () => {
      expect(EthosSDK.EthosAuthenticationError).toBeDefined();
    });
  });
});
