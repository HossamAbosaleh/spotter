import { beforeEach, describe, expect, it } from 'vitest';

import { useToastStore } from '@/stores/toast-store';

describe('toast-store', () => {
  beforeEach(() => {
    useToastStore.getState().clear();
  });

  it('enqueue returns a unique id and pushes the toast onto the queue', () => {
    const { enqueue } = useToastStore.getState();
    const id1 = enqueue({ title: 'A' });
    const id2 = enqueue({ title: 'B' });
    expect(id1).not.toBe(id2);
    const toasts = useToastStore.getState().toasts;
    expect(toasts.map((t) => t.id)).toEqual([id1, id2]);
    expect(toasts.map((t) => t.title)).toEqual(['A', 'B']);
  });

  it('applies defaults for variant and durationMs when omitted', () => {
    const id = useToastStore.getState().enqueue({ title: 'Hello' });
    const toast = useToastStore.getState().toasts.find((t) => t.id === id);
    expect(toast?.variant).toBe('default');
    expect(toast?.durationMs).toBe(5000);
  });

  it('dequeue removes only the matching toast', () => {
    const { enqueue, dequeue } = useToastStore.getState();
    const id1 = enqueue({ title: 'A' });
    const id2 = enqueue({ title: 'B' });
    dequeue(id1);
    const remaining = useToastStore.getState().toasts;
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.id).toBe(id2);
  });
});
