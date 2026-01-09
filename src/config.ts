/**
 * Ethos SDK Configuration
 *
 * Configuration management for the SDK.
 */

export interface EthosConfigOptions {
  /** Base URL for the Ethos API */
  baseUrl?: string;
  /** Name identifying your application (sent as X-Ethos-Client header) */
  clientName?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Minimum milliseconds between requests */
  rateLimit?: number;
  /** Number of retries for failed requests */
  maxRetries?: number;
}

export class EthosConfig {
  readonly baseUrl: string;
  readonly clientName: string;
  readonly timeout: number;
  readonly rateLimit: number;
  readonly maxRetries: number;

  static readonly DEFAULT_BASE_URL = 'https://api.ethos.network/api/v2';
  static readonly DEFAULT_CLIENT_NAME = 'ethos-ts-sdk';
  static readonly DEFAULT_TIMEOUT = 30000;
  static readonly DEFAULT_RATE_LIMIT = 500;
  static readonly DEFAULT_MAX_RETRIES = 3;

  constructor(options: EthosConfigOptions = {}) {
    this.baseUrl = options.baseUrl ?? EthosConfig.DEFAULT_BASE_URL;
    this.clientName = options.clientName ?? EthosConfig.DEFAULT_CLIENT_NAME;
    this.timeout = options.timeout ?? EthosConfig.DEFAULT_TIMEOUT;
    this.rateLimit = options.rateLimit ?? EthosConfig.DEFAULT_RATE_LIMIT;
    this.maxRetries = options.maxRetries ?? EthosConfig.DEFAULT_MAX_RETRIES;
  }

  /**
   * Create configuration from environment variables.
   */
  static fromEnv(): EthosConfig {
    return new EthosConfig({
      baseUrl: process.env['ETHOS_API_BASE_URL'],
      clientName: process.env['ETHOS_CLIENT_NAME'],
      timeout: process.env['ETHOS_TIMEOUT']
        ? parseInt(process.env['ETHOS_TIMEOUT'], 10)
        : undefined,
      rateLimit: process.env['ETHOS_RATE_LIMIT']
        ? parseInt(process.env['ETHOS_RATE_LIMIT'], 10)
        : undefined,
      maxRetries: process.env['ETHOS_MAX_RETRIES']
        ? parseInt(process.env['ETHOS_MAX_RETRIES'], 10)
        : undefined,
    });
  }
}
