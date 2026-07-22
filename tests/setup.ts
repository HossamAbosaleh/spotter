import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import '@/i18n';

// JSDOM doesn't implement ResizeObserver, which Radix primitives
// (RadioGroup, Select, Slider) rely on. Stub it so component tests can
// render those primitives without crashing.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Node >=26 ships an experimental global `localStorage` gated behind the
// `--localstorage-file` flag; without that flag it reads as undefined and
// shadows JSDOM's storage, so every test that touches localStorage crashes.
// CI runs on Node 22 (JSDOM provides real storage), so this guard is a no-op
// there; locally on Node >=26 it installs a working in-memory Storage.
if (typeof globalThis.localStorage === 'undefined') {
  class MemoryStorage implements Storage {
    private store = new Map<string, string>();
    get length(): number {
      return this.store.size;
    }
    clear(): void {
      this.store.clear();
    }
    getItem(key: string): string | null {
      return this.store.has(key) ? (this.store.get(key) as string) : null;
    }
    key(index: number): string | null {
      return Array.from(this.store.keys())[index] ?? null;
    }
    removeItem(key: string): void {
      this.store.delete(key);
    }
    setItem(key: string, value: string): void {
      this.store.set(key, String(value));
    }
  }
  // Expose the polyfill as the global `Storage` too, so tests that
  // `vi.spyOn(Storage.prototype, 'setItem')` intercept the instance's methods
  // (class methods live on MemoryStorage.prototype). Only runs on the Node >=26
  // path where storage was missing, so JSDOM's Storage stays untouched on CI.
  const StorageCtor = MemoryStorage as unknown as typeof Storage;
  Object.defineProperty(globalThis, 'Storage', {
    value: StorageCtor,
    configurable: true,
  });
  const storage = new MemoryStorage();
  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    configurable: true,
  });
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Storage', {
      value: StorageCtor,
      configurable: true,
    });
    Object.defineProperty(window, 'localStorage', {
      value: storage,
      configurable: true,
    });
  }
}
