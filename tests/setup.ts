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
