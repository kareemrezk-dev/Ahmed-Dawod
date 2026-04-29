import { NextRequest, NextResponse } from "next/server";

// ─── In-memory sliding-window rate limiter ────────────────────────────────────
// Works on Vercel Serverless / Edge. No external dependencies.
// For multi-instance deployments, swap with Upstash Redis if needed.

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

/**
 * Rate limit configuration per endpoint tier.
 */
export interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Max requests allowed within the window */
  max: number;
  /** Identifier prefix (e.g. "ai-chat", "orders") */
  prefix: string;
}

/**
 * Pre-configured rate limit tiers for different endpoint types.
 */
export const RATE_LIMITS = {
  /** AI endpoints — expensive (Gemini API calls): 10 req/min */
  ai: {
    windowMs: 60 * 1000,
    max: 10,
    prefix: "ai",
  },
  /** Image search — very expensive (Vision API): 5 req/min */
  imageSearch: {
    windowMs: 60 * 1000,
    max: 5,
    prefix: "img",
  },
  /** Orders — moderate: 5 req/min */
  orders: {
    windowMs: 60 * 1000,
    max: 5,
    prefix: "ord",
  },
  /** Coupons — moderate: 10 req/min */
  coupons: {
    windowMs: 60 * 1000,
    max: 10,
    prefix: "cpn",
  },
  /** Admin login — strict (brute-force protection): 5 req/5min */
  adminLogin: {
    windowMs: 5 * 60 * 1000,
    max: 5,
    prefix: "adm",
  },
  /** General API — relaxed: 30 req/min */
  general: {
    windowMs: 60 * 1000,
    max: 30,
    prefix: "gen",
  },
} as const satisfies Record<string, RateLimitConfig>;

/**
 * Extract the client IP from the request.
 * Supports Vercel (x-forwarded-for), Cloudflare (cf-connecting-ip), and fallbacks.
 */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Check rate limit for a request. Returns null if allowed, or a 429 response if blocked.
 *
 * @example
 * ```ts
 * export async function POST(request: NextRequest) {
 *   const limited = rateLimit(request, RATE_LIMITS.ai);
 *   if (limited) return limited;
 *   // ... handle request
 * }
 * ```
 */
export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): NextResponse | null {
  const ip = getClientIp(request);
  const key = `${config.prefix}:${ip}`;
  const now = Date.now();

  // Periodic cleanup
  cleanup(config.windowMs);

  // Get or create entry
  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter(
    (t) => now - t < config.windowMs
  );

  // Check if over limit
  if (entry.timestamps.length >= config.max) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfter = Math.ceil(
      (config.windowMs - (now - oldestInWindow)) / 1000
    );

    return NextResponse.json(
      {
        error: "Too many requests",
        error_ar: "عدد الطلبات كتير. حاول تاني بعد شوية.",
        retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(config.max),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(
            Math.ceil((oldestInWindow + config.windowMs) / 1000)
          ),
        },
      }
    );
  }

  // Record this request
  entry.timestamps.push(now);

  return null; // Allowed
}
