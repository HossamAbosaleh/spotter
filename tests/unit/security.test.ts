import { describe, it, expect } from 'vitest';
import { isSafeImageUrl } from '@/utils/security';

describe('isSafeImageUrl', () => {
  describe('accepts', () => {
    it.each([
      'https://example.com/img.jpg',
      'https://cdn.example.com/path/to/image.png?v=1',
      'https://localhost:8080/img.webp',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/',
      'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAA',
    ])('%s', (src) => {
      expect(isSafeImageUrl(src)).toBe(true);
    });
  });

  describe('rejects', () => {
    it.each([
      ['empty string', ''],
      ['null', null],
      ['undefined', undefined],
      ['number', 42],
      ['object', { src: 'https://example.com' }],
      ['http:', 'http://example.com/img.jpg'],
      ['javascript:', 'javascript:alert(1)'],
      ['vbscript:', 'vbscript:msgbox(1)'],
      ['protocol-relative', '//example.com/img.jpg'],
      ['relative path', '/img.jpg'],
      ['file:', 'file:///etc/passwd'],
      ['data:image/svg+xml', 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='],
      [
        'data:image/gif (not whitelisted)',
        'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
      ],
      ['data:text/html', 'data:text/html,<script>alert(1)</script>'],
      ['data:image/png without base64', 'data:image/png,not-encoded'],
      ['malformed URL', 'https://'],
      ['just whitespace', '   '],
    ])('rejects %s', (_label, src) => {
      expect(isSafeImageUrl(src)).toBe(false);
    });
  });
});
