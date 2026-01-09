import { describe, it, expect } from 'vitest';
import { EthosConfig } from '../src/config';

describe('EthosConfig', () => {
  describe('constructor', () => {
    it('should use default values when no options provided', () => {
      const config = new EthosConfig();
      
      expect(config.baseUrl).toBe('https://api.ethos.network/api/v2');
      expect(config.clientName).toBe('ethos-ts-sdk');
      expect(config.timeout).toBe(30000);
      expect(config.rateLimit).toBe(500);
      expect(config.maxRetries).toBe(3);
    });

    it('should accept custom options', () => {
      const config = new EthosConfig({
        baseUrl: 'https://custom.api.com',
        clientName: 'my-app',
        timeout: 60000,
        rateLimit: 1000,
        maxRetries: 5,
      });
      
      expect(config.baseUrl).toBe('https://custom.api.com');
      expect(config.clientName).toBe('my-app');
      expect(config.timeout).toBe(60000);
      expect(config.rateLimit).toBe(1000);
      expect(config.maxRetries).toBe(5);
    });

    it('should allow partial options', () => {
      const config = new EthosConfig({
        clientName: 'partial-app',
      });
      
      expect(config.clientName).toBe('partial-app');
      expect(config.baseUrl).toBe('https://api.ethos.network/api/v2');
    });
  });

  describe('static constants', () => {
    it('should have correct default values', () => {
      expect(EthosConfig.DEFAULT_BASE_URL).toBe('https://api.ethos.network/api/v2');
      expect(EthosConfig.DEFAULT_CLIENT_NAME).toBe('ethos-ts-sdk');
      expect(EthosConfig.DEFAULT_TIMEOUT).toBe(30000);
      expect(EthosConfig.DEFAULT_RATE_LIMIT).toBe(500);
      expect(EthosConfig.DEFAULT_MAX_RETRIES).toBe(3);
    });
  });
});
