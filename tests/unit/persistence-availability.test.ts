import { classifyError } from '@/data/persistence-availability';

/**
 * classifyError must recover the underlying IndexedDB failure reason from
 * both a raw DOMException and a Dexie-wrapped error (Dexie stashes the
 * original under `.inner` or `.cause`). Before the fix, wrapped errors all
 * degraded to `unknown` because `instanceof DOMException` was false.
 */
describe('classifyError', () => {
  describe('raw DOMException', () => {
    it.each([
      ['SecurityError', 'disabled'],
      ['QuotaExceededError', 'quota-exceeded'],
      ['InvalidStateError', 'private-mode'],
    ] as const)('maps %s to reason %s', (name, reason) => {
      const result = classifyError(new DOMException('boom', name));
      expect(result).toEqual({ status: 'degraded', reason });
    });

    it('maps an unrecognized DOMException to unknown', () => {
      expect(classifyError(new DOMException('boom', 'AbortError'))).toEqual({
        status: 'degraded',
        reason: 'unknown',
      });
    });
  });

  describe('Dexie-wrapped errors', () => {
    it('recovers the reason from a `.inner` DOMException', () => {
      const wrapped = Object.assign(new Error('open failed'), {
        name: 'OpenFailedError',
        inner: new DOMException('private', 'InvalidStateError'),
      });
      expect(classifyError(wrapped)).toEqual({
        status: 'degraded',
        reason: 'private-mode',
      });
    });

    it('recovers the reason from a `.cause` chain', () => {
      const wrapped = new Error('open failed', {
        cause: new DOMException('full', 'QuotaExceededError'),
      });
      expect(classifyError(wrapped)).toEqual({
        status: 'degraded',
        reason: 'quota-exceeded',
      });
    });

    it('matches when the wrapper itself carries the name', () => {
      const wrapped = Object.assign(new Error('blocked'), {
        name: 'SecurityError',
      });
      expect(classifyError(wrapped)).toEqual({
        status: 'degraded',
        reason: 'disabled',
      });
    });
  });

  it('degrades to unknown for a non-error value', () => {
    expect(classifyError('nope')).toEqual({
      status: 'degraded',
      reason: 'unknown',
    });
  });
});
