CREATE TABLE IF NOT EXISTS timer_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL,
  name TEXT NOT NULL,
  score REAL NOT NULL,
  error_ms INTEGER NOT NULL CHECK(error_ms >= 0 AND error_ms <= 30000),
  mode INTEGER NOT NULL,
  is_flagged_legacy INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(player_id, mode)
);

CREATE INDEX IF NOT EXISTS idx_timer_scores_mode_error ON timer_scores(mode, is_flagged_legacy, error_ms ASC);
