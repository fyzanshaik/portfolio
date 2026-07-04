import { env as cfEnv } from 'cloudflare:workers';

export const prerender = false;

interface Env {
  TIMER_GAME_DB: D1Database;
  TIMER_GAME_KV: KVNamespace;
  TIMER_GAME_API_KEY: string;
}

const env = cfEnv as unknown as Env;

const ALLOWED_MODES = [1, 5, 10, 15];
const MIN_SCORE = 0.02;
const MAX_SCORE = 30;
const SCORE_LIMIT = 20;
const SCORE_LIMIT_TTL = 60 * 60;
const SCORE_TOKEN_LIMIT = 10;
const BLOCKED_NAME_PARTS = ['fuck', 'shit', 'bitch', 'cunt', 'nigger', 'nigga'];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

interface ScoreEntry {
  name: string;
  score: number;
  mode: number;
  created_at?: string;
}

interface UserScores {
  [mode: string]: number;
}

export async function GET({ request }: { request: Request }) {
  const url = new URL(request.url);
  const mode = parseInt(url.searchParams.get('mode') || '1');
  const username = url.searchParams.get('user');

  if (!ALLOWED_MODES.includes(mode)) {
    return jsonResponse({ error: 'Invalid mode' }, 400);
  }

  if (!env?.TIMER_GAME_KV && !env?.TIMER_GAME_DB) {
    return jsonResponse({
      highScore: null,
      leaderboard: [],
      userScore: null,
      userScores: {},
      isNewUser: true,
    });
  }

  let leaderboard: ScoreEntry[] = [];
  let highScore: number | null = null;
  let userScore: number | null = null;
  let userScores: UserScores = {};
  let isNewUser = true;

  try {
    if (env?.TIMER_GAME_KV) {
      const cachedLeaderboard = await env.TIMER_GAME_KV.get(
        `leaderboard:${mode}`,
        'json'
      );
      if (cachedLeaderboard) {
        leaderboard = cachedLeaderboard as ScoreEntry[];
        highScore = leaderboard.length > 0 ? leaderboard[0].score : null;
      }

      if (username) {
        const cachedUserScores = await env.TIMER_GAME_KV.get(
          `user:${username}`,
          'json'
        );
        if (cachedUserScores) {
          userScores = cachedUserScores as UserScores;
          userScore = userScores[mode.toString()] ?? null;
          isNewUser = false;
        }
      }
    }
  } catch (kvError) {
    console.error('KV error:', kvError);
  }

  try {
    if (leaderboard.length === 0 && env?.TIMER_GAME_DB) {
      const result = await env.TIMER_GAME_DB.prepare(
        `SELECT name, score, mode, created_at FROM timer_scores WHERE mode = ? ORDER BY score ASC LIMIT 10`
      )
        .bind(mode)
        .all<ScoreEntry>();

      leaderboard = result.results || [];
      highScore = leaderboard.length > 0 ? leaderboard[0].score : null;

      if (env?.TIMER_GAME_KV && leaderboard.length > 0) {
        await env.TIMER_GAME_KV.put(
          `leaderboard:${mode}`,
          JSON.stringify(leaderboard),
          { expirationTtl: 300 }
        ).catch(() => {});
      }
    }

    if (
      username &&
      Object.keys(userScores).length === 0 &&
      env?.TIMER_GAME_DB
    ) {
      const userResults = await env.TIMER_GAME_DB.prepare(
        `SELECT mode, score FROM timer_scores WHERE name = ?`
      )
        .bind(username)
        .all<{ mode: number; score: number }>();

      if (userResults.results && userResults.results.length > 0) {
        for (const row of userResults.results) {
          userScores[row.mode.toString()] = row.score;
        }
        userScore = userScores[mode.toString()] ?? null;
        isNewUser = false;

        if (env?.TIMER_GAME_KV) {
          await env.TIMER_GAME_KV.put(
            `user:${username}`,
            JSON.stringify(userScores),
            { expirationTtl: 600 }
          ).catch(() => {});
        }
      }
    }
  } catch (dbError) {
    console.error('D1 error:', dbError);
  }

  return jsonResponse({
    highScore,
    leaderboard: leaderboard.slice(0, 10),
    userScore,
    userScores,
    isNewUser: username ? isNewUser : true,
  });
}

function generateAnonName(): string {
  const num = Math.floor(Math.random() * 99999)
    .toString()
    .padStart(5, '0');
  return `anon${num}`;
}

async function findUniqueAnonName(
  db: D1Database,
  baseName: string,
  maxAttempts = 10
): Promise<string> {
  let name = baseName;
  for (let i = 0; i < maxAttempts; i++) {
    const exists = await db
      .prepare(`SELECT 1 FROM timer_scores WHERE name = ? LIMIT 1`)
      .bind(name)
      .first();
    if (!exists) return name;
    name = generateAnonName();
  }
  return name;
}

function isBlockedName(name: string): boolean {
  const normalizedName = name.toLowerCase();
  return BLOCKED_NAME_PARTS.some(part => normalizedName.includes(part));
}

function base64UrlEncode(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function signToken(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload)
  );

  return base64UrlEncode(signature);
}

async function verifyScoreToken(
  token: string,
  env: Env | undefined
): Promise<boolean> {
  const secret = env?.TIMER_GAME_API_KEY;
  if (!secret) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [expiresAt, nonce, signature] = parts;
  const expiry = Number(expiresAt);
  if (!Number.isFinite(expiry) || expiry < Date.now() || !nonce || !signature) {
    return false;
  }

  const expectedSignature = await signToken(`${expiresAt}.${nonce}`, secret);
  return signature === expectedSignature;
}

async function checkScoreToken(
  token: string,
  env: Env | undefined
): Promise<Response | null> {
  if (!(await verifyScoreToken(token, env))) {
    return jsonResponse({ error: 'Invalid score token' }, 403);
  }

  if (!env?.TIMER_GAME_KV) return null;

  const nonce = token.split('.')[1];
  const key = `score-token:${nonce}`;
  const count = parseInt((await env.TIMER_GAME_KV.get(key)) || '0');

  if (count >= SCORE_TOKEN_LIMIT) {
    return jsonResponse({ error: 'Score token expired' }, 403);
  }

  await env.TIMER_GAME_KV.put(key, String(count + 1), {
    expirationTtl: SCORE_LIMIT_TTL,
  });

  return null;
}

function getRateLimitKey(request: Request): string {
  const ip =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown';

  return `score-limit:${ip}`;
}

async function checkRateLimit(
  request: Request,
  kv: KVNamespace | undefined
): Promise<Response | null> {
  if (!kv) return null;

  const key = getRateLimitKey(request);
  const count = parseInt((await kv.get(key)) || '0');

  if (count >= SCORE_LIMIT) {
    return jsonResponse({ error: 'Too many attempts. Try again later.' }, 429);
  }

  await kv.put(key, String(count + 1), { expirationTtl: SCORE_LIMIT_TTL });
  return null;
}

export async function POST({ request }: { request: Request }) {
  try {
    const body = (await request.json()) as {
      name: string;
      score: number;
      mode: number;
      generateUnique?: boolean;
      scoreToken: string;
    };
    const { name, score, mode, generateUnique, scoreToken } = body;

    if (
      !name ||
      typeof score !== 'number' ||
      !ALLOWED_MODES.includes(mode) ||
      typeof scoreToken !== 'string'
    ) {
      return jsonResponse({ error: 'Invalid input' }, 400);
    }

    let sanitizedName = name.slice(0, 12).replace(/[^a-zA-Z0-9_-]/g, '');
    if (!sanitizedName) {
      return jsonResponse({ error: 'Invalid name' }, 400);
    }

    if (isBlockedName(sanitizedName)) {
      return jsonResponse({ error: 'Invalid name' }, 400);
    }

    if (!Number.isFinite(score) || score < MIN_SCORE || score > MAX_SCORE) {
      return jsonResponse({ error: 'Invalid score' }, 400);
    }

    const scoreTokenResult = await checkScoreToken(scoreToken, env);
    if (scoreTokenResult) {
      return scoreTokenResult;
    }

    const rateLimitResult = await checkRateLimit(request, env?.TIMER_GAME_KV);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    if (!env?.TIMER_GAME_DB) {
      return jsonResponse({ success: true, saved: false });
    }

    if (generateUnique && sanitizedName.startsWith('anon')) {
      sanitizedName = await findUniqueAnonName(
        env.TIMER_GAME_DB,
        sanitizedName
      );
    }

    const existing = await env.TIMER_GAME_DB.prepare(
      `SELECT score FROM timer_scores WHERE name = ? AND mode = ?`
    )
      .bind(sanitizedName, mode)
      .first<{ score: number }>();

    if (existing && existing.score <= score) {
      return jsonResponse({
        success: true,
        saved: false,
        reason: 'existing_better',
        currentBest: existing.score,
        assignedName: sanitizedName,
      });
    }

    if (existing) {
      await env.TIMER_GAME_DB.prepare(
        `UPDATE timer_scores SET score = ?, created_at = datetime('now') WHERE name = ? AND mode = ?`
      )
        .bind(score, sanitizedName, mode)
        .run();
    } else {
      await env.TIMER_GAME_DB.prepare(
        `INSERT INTO timer_scores (name, score, mode, created_at) VALUES (?, ?, ?, datetime('now'))`
      )
        .bind(sanitizedName, score, mode)
        .run();
    }

    if (env?.TIMER_GAME_KV) {
      await Promise.all([
        env.TIMER_GAME_KV.delete(`leaderboard:${mode}`),
        env.TIMER_GAME_KV.delete(`user:${sanitizedName}`),
      ]).catch(() => {});
    }

    return jsonResponse({
      success: true,
      saved: true,
      newBest: score,
      assignedName: sanitizedName,
    });
  } catch (error) {
    console.error('Timer game POST error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}
