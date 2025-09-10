export function getPlanWeek(today = new Date()): number {
  const startStr = process.env.PLAN_START_DATE; // YYYY-MM-DD
  if (!startStr) return 1; // fallback
  const start = new Date(startStr + 'T00:00:00');
  const diffMs = today.getTime() - start.getTime();
  if (diffMs < 0) return 1;
  const week = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
  // Clamp to 1..52
  const num = Math.min(52, Math.max(1, week));
  return num;
}

export function getNextPlanWeek(today = new Date()): number {
  const w = getPlanWeek(today);
  return Math.min(52, w + 1);
}

