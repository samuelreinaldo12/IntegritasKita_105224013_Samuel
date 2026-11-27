import { describe, expect, it } from 'vitest';
import { isAdminSession } from './session';

describe('admin session response guard', () => {
  it('accepts a server-confirmed admin session', () => {
    expect(isAdminSession({ authenticated: true, role: 'admin' })).toBe(true);
  });

  it('rejects a user session', () => {
    expect(isAdminSession({ authenticated: true, role: 'user' })).toBe(false);
  });

  it('rejects an unauthenticated admin role', () => {
    expect(isAdminSession({ authenticated: false, role: 'admin' })).toBe(false);
  });

  it('rejects missing and malformed responses', () => {
    expect(isAdminSession(null)).toBe(false);
    expect(isAdminSession({ role: 'admin' })).toBe(false);
  });
});
