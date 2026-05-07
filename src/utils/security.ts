/*
 * Security utilities.
 *
 * Constitution P5: real (not theatrical) security. These helpers run at the
 * boundary between user/AI-controlled data and the DOM. They reject anything
 * that doesn't match a positive whitelist — never a denylist.
 */

// Whitelist of safe data: image schemes. SVG is explicitly excluded — it can
// carry <script> elements and is therefore a script-carrier risk.
const SAFE_DATA_IMAGE_PATTERN =
  /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;

/*
 * Returns true iff `src` is a string and matches one of:
 *   - https: URL with a non-empty host
 *   - data:image/(png|jpeg|webp);base64,... data URI
 *
 * Returns false for everything else: null/undefined, http:, javascript:,
 * vbscript:, protocol-relative (//host/...), data:image/svg+xml,
 * data:text/*, malformed URLs, empty strings.
 *
 * The caller MUST NOT render an <img> with `src` if this returns false.
 */
export function isSafeImageUrl(src: unknown): src is string {
  if (typeof src !== 'string' || src.length === 0) {
    return false;
  }

  if (src.startsWith('data:')) {
    return SAFE_DATA_IMAGE_PATTERN.test(src);
  }

  try {
    const url = new URL(src);
    return url.protocol === 'https:' && url.host.length > 0;
  } catch {
    return false;
  }
}
