import { beforeEach, describe, expect, it } from 'vitest';

import { useProfileStore } from '@/stores/profile-store';

describe('profile-store setLoadError', () => {
  beforeEach(() => {
    useProfileStore.setState({
      profile: null,
      status: 'loading',
      loadError: null,
    });
  });

  it('maps storage-blocked to status: ready', () => {
    useProfileStore.getState().setLoadError('storage-blocked');
    expect(useProfileStore.getState().status).toBe('ready');
    expect(useProfileStore.getState().loadError).toBe('storage-blocked');
  });

  it('maps schema-invalid to status: error', () => {
    useProfileStore.getState().setLoadError('schema-invalid');
    expect(useProfileStore.getState().status).toBe('error');
    expect(useProfileStore.getState().loadError).toBe('schema-invalid');
  });

  it('maps unknown to status: error', () => {
    useProfileStore.getState().setLoadError('unknown');
    expect(useProfileStore.getState().status).toBe('error');
    expect(useProfileStore.getState().loadError).toBe('unknown');
  });
});
