export const ALLOWED_MODES = [1, 5, 10, 15] as const;
export const MAX_ERROR_MS = 30_000;

export function calculateErrorMs(
  elapsedMs: number,
  targetSeconds: number
): number {
  return Math.abs(Math.round(elapsedMs) - targetSeconds * 1_000);
}

export function isValidErrorMs(errorMs: unknown): errorMs is number {
  return (
    typeof errorMs === 'number' &&
    Number.isInteger(errorMs) &&
    errorMs >= 0 &&
    errorMs <= MAX_ERROR_MS
  );
}

export function formatDuration(milliseconds: number): string {
  return `${(milliseconds / 1_000).toFixed(3)}s`;
}

export function sanitizePlayerName(name: string): string {
  return name.slice(0, 12).replace(/[^a-zA-Z0-9_-]/g, '');
}
