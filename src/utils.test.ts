import { describe, expect, it } from 'vitest';
import { getBaseUrl } from './utils';

describe('getBaseUrl', () => {
  it('resolves the sandbox shortcut', () => {
    expect(getBaseUrl('sandbox')).toBe('https://api.sandbox.pawapay.io');
  });

  it('resolves the production shortcut', () => {
    expect(getBaseUrl('production')).toBe('https://api.pawapay.io');
  });

  it('passes through a custom https URL, stripping a trailing slash', () => {
    expect(getBaseUrl('https://custom.example.com/')).toBe('https://custom.example.com');
  });

  it('throws for an unrecognized value', () => {
    expect(() => getBaseUrl('not-a-url')).toThrow('Invalid baseUrl provided');
  });
});
