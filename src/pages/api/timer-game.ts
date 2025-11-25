export const prerender = false;

interface Env {
  TIMER_GAME_DB: D1Database;
  TIMER_GAME_KV: KVNamespace;
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

export async function GET({
  request,
  locals,
}: {
  request: Request;
  locals: { runtime: { env: Env } };
}) {
  const url = new URL(request.url);
  const mode = parseInt(url.searchParams.get('mode') || '1');
  const username = url.searchParams.get('user');

  if (![1, 5, 10, 15].includes(mode)) {
    return new Response(JSON.stringify({ error: 'Invalid mode' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const env = locals.runtime?.env;

  if (!env?.TIMER_GAME_KV && !env?.TIMER_GAME_DB) {
    return new Response(
      JSON.stringify({
        highScore: null,
        leaderboard: [],
        userScore: null,
        userScores: {},
        isNewUser: true,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
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

  return new Response(
    JSON.stringify({
      highScore,
      leaderboard: leaderboard.slice(0, 10),
      userScore,
      userScores,
      isNewUser: username ? isNewUser : true,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
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

export async function POST({
  request,
  locals,
}: {
  request: Request;
  locals: { runtime: { env: Env } };
}) {
  try {
    const body = (await request.json()) as {
      name: string;
      score: number;
      mode: number;
      generateUnique?: boolean;
    };
    const { name, score, mode, generateUnique } = body;

    if (!name || typeof score !== 'number' || ![1, 5, 10, 15].includes(mode)) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let sanitizedName = name.slice(0, 12).replace(/[^a-zA-Z0-9_-]/g, '');
    if (!sanitizedName) {
      return new Response(JSON.stringify({ error: 'Invalid name' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (score < 0 || score > 30) {
      return new Response(JSON.stringify({ error: 'Invalid score' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const env = locals.runtime?.env;

    if (!env?.TIMER_GAME_DB) {
      return new Response(JSON.stringify({ success: true, saved: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
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
      return new Response(
        JSON.stringify({
          success: true,
          saved: false,
          reason: 'existing_better',
          currentBest: existing.score,
          assignedName: sanitizedName,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
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

    return new Response(
      JSON.stringify({
        success: true,
        saved: true,
        newBest: score,
        assignedName: sanitizedName,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Timer game POST error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
