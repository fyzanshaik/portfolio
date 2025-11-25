CREATE TABLE IF NOT EXISTS timer_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  score REAL NOT NULL,
  mode INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(name, mode)
);

CREATE INDEX IF NOT EXISTS idx_timer_scores_mode_score ON timer_scores(mode, score ASC);

