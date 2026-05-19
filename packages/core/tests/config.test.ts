import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadConfig } from '../src/config/loader';
import * as fs from 'fs';
import * as path from 'path';

vi.mock('fs');
vi.mock('path');

describe('Config Loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load config from yaml and merge defaults', () => {
    const yamlConfig = `
seller:
  wallet: '0x1234567890123456789012345678901234567890'
  networks:
    - base-sepolia
routes:
  "GET /api":
    price: "$0.01"
`;

    // @ts-ignore
    vi.spyOn(fs, 'existsSync').mockImplementation((file) => file.endsWith('paygate.config.yaml'));
    // @ts-ignore
    vi.spyOn(fs, 'readFileSync').mockReturnValue(yamlConfig);
    // @ts-ignore
    vi.spyOn(path, 'join').mockImplementation((...args) => args.join('/'));
    // @ts-ignore
    vi.spyOn(path, 'extname').mockImplementation((file) => '.yaml');
    
    // @ts-ignore
    vi.spyOn(process, 'cwd').mockReturnValue('/cwd');

    const config = loadConfig();

    expect(config.seller.wallet).toBe('0x1234567890123456789012345678901234567890');
    expect(config.seller.networks).toContain('base-sepolia');
    expect(config.seller.facilitator).toBe('testnet'); // default
    expect(config.dashboard.enabled).toBe(false); // default
  });

  it('should throw error on invalid config', () => {
    const invalidConfig = `
seller:
  networks: [] # empty networks is invalid
`;
    // @ts-ignore
    vi.spyOn(fs, 'existsSync').mockImplementation((file) => file.endsWith('paygate.config.yaml'));
    // @ts-ignore
    vi.spyOn(fs, 'readFileSync').mockReturnValue(invalidConfig);
    // @ts-ignore
    vi.spyOn(path, 'extname').mockImplementation((file) => '.yaml');

    expect(() => loadConfig()).toThrow('Invalid paygate config');
  });
});
