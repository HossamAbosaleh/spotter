import { create } from 'zustand';

/**
 * Global toast queue.
 *
 * Why a store: Radix Toast is declarative — each <Toast> needs `open`
 * state managed by a consumer. To fire a toast from anywhere
 * (handlers, effects, error branches) and have it survive route
 * changes, we publish to a queue here and let <ToastRoot> render the
 * queue inside a single <ToastProvider> mounted at the app root.
 *
 * Toasts auto-dequeue after their `durationMs` elapses. Callers can
 * also dequeue explicitly via the returned id if they need to dismiss
 * programmatically (not exercised today; reserved for future use
 * like autosave's "Saving… → Saved." transition).
 */

export type ToastVariant = 'default' | 'destructive';

export type ToastInput = {
  variant?: ToastVariant;
  title: string;
  description?: string;
  durationMs?: number;
};

export type Toast = Required<
  Pick<ToastInput, 'title' | 'variant' | 'durationMs'>
> & {
  id: string;
  description?: string;
};

const DEFAULT_DURATION_MS = 5000;

type ToastStore = {
  toasts: Toast[];
  enqueue: (input: ToastInput) => string;
  dequeue: (id: string) => void;
  clear: () => void;
};

function generateId(): string {
  // Date.now + random suffix is enough — toasts are short-lived and
  // collisions across milliseconds are vanishingly unlikely. Keeping
  // this off crypto.randomUUID avoids a polyfill in JSDOM tests.
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  enqueue: (input) => {
    const id = generateId();
    const toast: Toast = {
      id,
      title: input.title,
      variant: input.variant ?? 'default',
      durationMs: input.durationMs ?? DEFAULT_DURATION_MS,
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
    };
    set((state) => ({ toasts: [...state.toasts, toast] }));
    return id;
  },
  dequeue: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));
