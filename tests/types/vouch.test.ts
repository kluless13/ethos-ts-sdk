/**
 * Tests for Vouch type
 */

import { describe, it, expect } from 'vitest';
import { Vouch, VouchData } from '../../src/types/vouch';

describe('Vouch', () => {
  const mockVouchData: VouchData = {
    id: 456,
    authorProfileId: 100,
    subjectProfileId: 200,
    staked: true,
    archived: false,
    unhealthy: false,
    balance: '1500000000000000000', // 1.5 ETH in wei
    activityCheckpoints: { lastCheck: '2024-01-01' },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T15:45:00Z',
  };

  describe('constructor', () => {
    it('should create vouch from data', () => {
      const vouch = new Vouch(mockVouchData);

      expect(vouch.id).toBe(456);
      expect(vouch.authorProfileId).toBe(100);
      expect(vouch.subjectProfileId).toBe(200);
      expect(vouch.staked).toBe(true);
      expect(vouch.archived).toBe(false);
      expect(vouch.balance).toBe('1500000000000000000');
    });

    it('should handle default values', () => {
      const minimalData: VouchData = {
        id: 1,
        authorProfileId: 10,
        subjectProfileId: 20,
        staked: true,
        archived: false,
        unhealthy: false,
        balance: '0',
        activityCheckpoints: {},
      };

      const vouch = new Vouch(minimalData);

      expect(vouch.balance).toBe('0');
      expect(vouch.createdAt).toBeUndefined();
    });

    it('should parse dates', () => {
      const vouch = new Vouch(mockVouchData);

      expect(vouch.createdAt).toBeInstanceOf(Date);
      expect(vouch.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('amountWei', () => {
    it('should return balance as bigint', () => {
      const vouch = new Vouch(mockVouchData);

      expect(vouch.amountWei).toBe(BigInt('1500000000000000000'));
    });

    it('should handle zero balance', () => {
      const data = { ...mockVouchData, balance: '0' };
      const vouch = new Vouch(data);

      expect(vouch.amountWei).toBe(BigInt(0));
    });
  });

  describe('amountEth', () => {
    it('should convert wei to ETH', () => {
      const vouch = new Vouch(mockVouchData);

      expect(vouch.amountEth).toBe(1.5);
    });

    it('should handle small amounts', () => {
      const data = { ...mockVouchData, balance: '100000000000000000' }; // 0.1 ETH
      const vouch = new Vouch(data);

      expect(vouch.amountEth).toBe(0.1);
    });

    it('should handle zero', () => {
      const data = { ...mockVouchData, balance: '0' };
      const vouch = new Vouch(data);

      expect(vouch.amountEth).toBe(0);
    });
  });

  describe('isActive', () => {
    it('should return true when staked and not archived', () => {
      const vouch = new Vouch(mockVouchData);

      expect(vouch.isActive).toBe(true);
    });

    it('should return false when not staked', () => {
      const data = { ...mockVouchData, staked: false };
      const vouch = new Vouch(data);

      expect(vouch.isActive).toBe(false);
    });

    it('should return false when archived', () => {
      const data = { ...mockVouchData, archived: true };
      const vouch = new Vouch(data);

      expect(vouch.isActive).toBe(false);
    });

    it('should return false when not staked and archived', () => {
      const data = { ...mockVouchData, staked: false, archived: true };
      const vouch = new Vouch(data);

      expect(vouch.isActive).toBe(false);
    });
  });

  describe('aliases', () => {
    it('should return voucherId as authorProfileId', () => {
      const vouch = new Vouch(mockVouchData);

      expect(vouch.voucherId).toBe(100);
    });

    it('should return targetId as subjectProfileId', () => {
      const vouch = new Vouch(mockVouchData);

      expect(vouch.targetId).toBe(200);
    });

    it('should return targetProfileId as subjectProfileId', () => {
      const vouch = new Vouch(mockVouchData);

      expect(vouch.targetProfileId).toBe(200);
    });
  });

  describe('toJSON', () => {
    it('should convert to plain object', () => {
      const vouch = new Vouch(mockVouchData);
      const json = vouch.toJSON();

      expect(json.id).toBe(456);
      expect(json.authorProfileId).toBe(100);
      expect(json.balance).toBe('1500000000000000000');
      expect(json.createdAt).toBe('2024-01-15T10:30:00.000Z');
    });
  });
});
