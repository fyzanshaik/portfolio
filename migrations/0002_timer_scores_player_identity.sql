BEGIN TRANSACTION;

CREATE TABLE timer_scores_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL,
  name TEXT NOT NULL,
  score REAL NOT NULL,
  error_ms INTEGER NOT NULL CHECK(error_ms >= 0 AND error_ms <= 30000),
  mode INTEGER NOT NULL CHECK(mode IN (1, 5, 10, 15)),
  is_flagged_legacy INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(player_id, mode)
);

INSERT INTO timer_scores_new (id, player_id, name, score, error_ms, mode, is_flagged_legacy, created_at)
SELECT id, player_id, name, score, error_ms, mode, is_flagged_legacy, created_at
FROM timer_scores;

DROP TABLE timer_scores;
ALTER TABLE timer_scores_new RENAME TO timer_scores;
CREATE INDEX idx_timer_scores_mode_error ON timer_scores(mode, is_flagged_legacy, error_ms ASC);
CREATE TABLE timer_game_metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
INSERT INTO timer_game_metadata (key, value) VALUES ('player_identity_schema', '1');

COMMIT;
