/**
 * The caller's network address, for per-address limits (D135). The platform's own headers
 * come first: Cloudflare sets cf-connecting-ip and the gateway sets x-real-ip, and neither
 * can be supplied by the caller. x-forwarded-for is the last resort, because its first entry
 * is whatever the caller wrote there (security audit, 2026-10-17). Null when none is present.
 */
export function clientIp(req: Request): string | null {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return req.headers.get('cf-connecting-ip') ?? req.headers.get('x-real-ip') ?? (forwarded || null);
}
