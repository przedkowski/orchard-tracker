interface PhiBadgeProps {
  sprayedAt: string;
  phiDays: number;
  testid?: string;
}

export function PhiBadge({ sprayedAt, phiDays, testid }: PhiBadgeProps) {
  const clearDate = new Date(sprayedAt);
  clearDate.setDate(clearDate.getDate() + phiDays);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  clearDate.setHours(0, 0, 0, 0);

  const daysLeft = Math.ceil(
    (clearDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  const cleared = daysLeft <= 0;

  return (
    <span
      data-testid={testid}
      className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        cleared
          ? "bg-emerald-900/40 text-emerald-400"
          : "bg-amber-900/40 text-amber-400"
      }`}
    >
      {cleared
        ? `PHI cleared (${phiDays}d)`
        : `PHI: ${daysLeft}d remaining`}
    </span>
  );
}
