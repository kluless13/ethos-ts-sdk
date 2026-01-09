import { describe, it, expect } from 'vitest';
import { Ethos } from '../src/client';
import { EthosConfig } from '../src/config';

describe('Ethos', () => {
  describe('constructor', () => {
    it('should create client with default config', () => {
      const client = new Ethos();
      expect(client.config).toBeInstanceOf(EthosConfig);
      expect(client.config.baseUrl).toBe('https://api.ethos.network/api/v2');
    });

    it('should create client with custom config', () => {
      const client = new Ethos({
        baseUrl: 'https://custom.api.com',
        clientName: 'my-app',
      });
      expect(client.config.baseUrl).toBe('https://custom.api.com');
      expect(client.config.clientName).toBe('my-app');
    });
  });

  describe('resources', () => {
    it('should have profiles resource', () => {
      const client = new Ethos();
      expect(client.profiles).toBeDefined();
      expect(typeof client.profiles.get).toBe('function');
      expect(typeof client.profiles.getByTwitter).toBe('function');
      expect(typeof client.profiles.getByAddress).toBe('function');
      expect(typeof client.profiles.search).toBe('function');
    });

    it('should have vouches resource', () => {
      const client = new Ethos();
      expect(client.vouches).toBeDefined();
      expect(typeof client.vouches.get).toBe('function');
      expect(typeof client.vouches.forProfile).toBe('function');
      expect(typeof client.vouches.byProfile).toBe('function');
    });

    it('should have reviews resource', () => {
      const client = new Ethos();
      expect(client.reviews).toBeDefined();
      expect(typeof client.reviews.get).toBe('function');
      expect(typeof client.reviews.forProfile).toBe('function');
      expect(typeof client.reviews.positiveFor).toBe('function');
    });

    it('should have markets resource', () => {
      const client = new Ethos();
      expect(client.markets).toBeDefined();
      expect(typeof client.markets.get).toBe('function');
      expect(typeof client.markets.getByProfile).toBe('function');
      expect(typeof client.markets.topByVolume).toBe('function');
    });

    it('should have activities resource', () => {
      const client = new Ethos();
      expect(client.activities).toBeDefined();
      expect(typeof client.activities.get).toBe('function');
      expect(typeof client.activities.forProfile).toBe('function');
      expect(typeof client.activities.recent).toBe('function');
    });

    it('should have scores resource', () => {
      const client = new Ethos();
      expect(client.scores).toBeDefined();
      expect(typeof client.scores.get).toBe('function');
      expect(typeof client.scores.getByProfile).toBe('function');
      expect(typeof client.scores.breakdown).toBe('function');
    });
  });
});
