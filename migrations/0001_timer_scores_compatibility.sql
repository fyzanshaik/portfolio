ALTER TABLE timer_scores ADD COLUMN player_id TEXT;
ALTER TABLE timer_scores ADD COLUMN error_ms INTEGER;
ALTER TABLE timer_scores ADD COLUMN is_flagged_legacy INTEGER NOT NULL DEFAULT 0;

UPDATE timer_scores
SET player_id = 'legacy:' || name,
    error_ms = CAST(ROUND(score * 1000) AS INTEGER),
    is_flagged_legacy = CASE WHEN score < 0.02 THEN 1 ELSE 0 END
WHERE player_id IS NULL;
