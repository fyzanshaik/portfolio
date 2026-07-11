import { env as cfEnv } from 'cloudflare:workers';
import {
  ALLOWED_MODES,
  formatDuration,
  isValidErrorMs,
  sanitizePlayerName,
} from '../../lib/timer-game';

export const prerender = false;

interface Env {
  TIMER_GAME_DB: D1Database;
  TIMER_GAME_KV: KVNamespace;
  TIMER_GAME_API_KEY: string;
}

interface ScoreEntry {
  name: string;
  errorMs: number;
  isFlaggedLegacy: boolean;
}

const env = cfEnv as unknown as Env;
const SCORE_LIMIT = 100;
const SCORE_LIMIT_TTL = 60 * 60;
const BLOCKED_NAME_PARTS = ['fuck', 'shit', 'bitch', 'cunt', 'nigger', 'nigga'];

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function validPlayerId(playerId: unknown): playerId is string {
  return typeof playerId === 'string' && /^[a-zA-Z0-9-]{16,64}$/.test(playerId);
}

function isBlockedName(name: string): boolean {
  const normalized = name.toLowerCase();
  return BLOCKED_NAME_PARTS.some(part => normalized.includes(part));
}

function base64UrlEncode(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return base64UrlEncode(
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  );
}

async function createScoreToken(): Promise<string> {
  if (!env?.TIMER_GAME_API_KEY) return '';
  const payload = `${Date.now() + SCORE_LIMIT_TTL * 1000}.${crypto.randomUUID()}`;
  return `${payload}.${await sign(payload, env.TIMER_GAME_API_KEY)}`;
}

async function verifyScoreToken(token: string): Promise<boolean> {
  if (!env?.TIMER_GAME_API_KEY) return false;
  const [expiresAt, nonce, signature, ...extra] = token.split('.');
  if (
    extra.length ||
    !expiresAt ||
    !nonce ||
    !signature ||
    Number(expiresAt) < Date.now()
  )
    return false;
  return (
    signature === (await sign(`${expiresAt}.${nonce}`, env.TIMER_GAME_API_KEY))
  );
}

async function checkRateLimit(request: Request): Promise<Response | null> {
  if (!env?.TIMER_GAME_KV) return null;
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = `score-limit:${ip}`;
  const count = Number((await env.TIMER_GAME_KV.get(key)) || '0');
  if (count >= SCORE_LIMIT)
    return json({ error: 'Too many attempts. Try again later.' }, 429);
  await env.TIMER_GAME_KV.put(key, String(count + 1), {
    expirationTtl: SCORE_LIMIT_TTL,
  });
  return null;
}

function serialize(entry: {
  name: string;
  error_ms: number;
  is_flagged_legacy: number;
}): ScoreEntry {
  return {
    name: entry.name,
    errorMs: entry.error_ms,
    isFlaggedLegacy: Boolean(entry.is_flagged_legacy),
  };
}

async function hasPlayerIdentitySchema(): Promise<boolean> {
  try {
    const marker = await env.TIMER_GAME_DB.prepare(
      "SELECT value FROM timer_game_metadata WHERE key = 'player_identity_schema'"
    ).first();
    return Boolean(marker);
  } catch {
    return false;
  }
}

export async function GET({ request }: { request: Request }) {
  const url = new URL(request.url);
  if (url.searchParams.get('token') === '1')
    return json({ scoreToken: await createScoreToken() });

  const mode = Number(url.searchParams.get('mode') || '1');
  const playerId = url.searchParams.get('playerId');
  if (!ALLOWED_MODES.includes(mode as (typeof ALLOWED_MODES)[number]))
    return json({ error: 'Invalid mode' }, 400);
  if (!env?.TIMER_GAME_DB)
    return json({
      leaderboard: [],
      legacyEntries: [],
      userScores: {},
      playerCount: 0,
    });

  const [validResult, legacyResult, countResult, userResult] =
    await Promise.all([
      env.TIMER_GAME_DB.prepare(
        'SELECT name, error_ms, is_flagged_legacy FROM timer_scores WHERE mode = ? AND is_flagged_legacy = 0 ORDER BY error_ms ASC LIMIT 10'
      )
        .bind(mode)
        .all<{ name: string; error_ms: number; is_flagged_legacy: number }>(),
      env.TIMER_GAME_DB.prepare(
        'SELECT name, error_ms, is_flagged_legacy FROM timer_scores WHERE mode = ? AND is_flagged_legacy = 1 ORDER BY error_ms ASC LIMIT 10'
      )
        .bind(mode)
        .all<{ name: string; error_ms: number; is_flagged_legacy: number }>(),
      env.TIMER_GAME_DB.prepare(
        'SELECT COUNT(DISTINCT player_id) AS count FROM timer_scores'
      ).first<{ count: number }>(),
      validPlayerId(playerId)
        ? env.TIMER_GAME_DB.prepare(
            'SELECT mode, error_ms FROM timer_scores WHERE player_id = ?'
          )
            .bind(playerId)
            .all<{ mode: number; error_ms: number }>()
        : Promise.resolve({ results: [] }),
    ]);
  const userScores: Record<string, number> = {};
  for (const row of userResult.results || [])
    userScores[row.mode] = row.error_ms;
  const leaderboard = (validResult.results || []).map(serialize);
  return json({
    leaderboard,
    legacyEntries: (legacyResult.results || []).map(serialize),
    highScore: leaderboard[0]?.errorMs ?? null,
    userScores,
    playerCount: countResult?.count ?? 0,
  });
}

export async function POST({ request }: { request: Request }) {
  try {
    const body = (await request.json()) as {
      name?: string;
      playerId?: string;
      errorMs?: unknown;
      mode?: number;
      scoreToken?: string;
    };
    if (
      !validPlayerId(body.playerId) ||
      !ALLOWED_MODES.includes(body.mode as (typeof ALLOWED_MODES)[number]) ||
      !isValidErrorMs(body.errorMs) ||
      typeof body.scoreToken !== 'string'
    )
      return json({ error: 'Invalid input' }, 400);
    const name = sanitizePlayerName(body.name || '');
    if (!name || isBlockedName(name))
      return json({ error: 'Invalid name' }, 400);
    if (!(await verifyScoreToken(body.scoreToken)))
      return json({ error: 'Invalid score token' }, 403);
    const limited = await checkRateLimit(request);
    if (limited) return limited;
    if (!env?.TIMER_GAME_DB)
      return json({ saved: false, error: 'Score storage is unavailable' }, 503);

    if (!(await hasPlayerIdentitySchema())) {
      const nameOwner = await env.TIMER_GAME_DB.prepare(
        'SELECT player_id FROM timer_scores WHERE name = ? AND mode = ?'
      )
        .bind(name, body.mode)
        .first<{ player_id: string }>();
      if (nameOwner && nameOwner.player_id !== body.playerId) {
        return json(
          { error: 'That display name is temporarily unavailable.' },
          409
        );
      }
    }

    const result = await env.TIMER_GAME_DB.prepare(
      `INSERT INTO timer_scores (player_id, name, score, error_ms, mode, is_flagged_legacy, created_at)
       VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
       ON CONFLICT DO UPDATE SET name = excluded.name, score = excluded.score, error_ms = excluded.error_ms, created_at = excluded.created_at
       WHERE excluded.error_ms < timer_scores.error_ms`
    )
      .bind(body.playerId, name, body.errorMs / 1000, body.errorMs, body.mode)
      .run();
    const current = await env.TIMER_GAME_DB.prepare(
      'SELECT error_ms FROM timer_scores WHERE player_id = ? AND mode = ?'
    )
      .bind(body.playerId, body.mode)
      .first<{ error_ms: number }>();
    return json({
      saved: result.meta.changes > 0,
      assignedName: name,
      currentBest: current?.error_ms ?? null,
      currentBestLabel: current ? formatDuration(current.error_ms) : null,
    });
  } catch (error) {
    console.error('Timer game POST error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
}
