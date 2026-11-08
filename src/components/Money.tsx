import { formatEur, formatUah } from "@/lib/money";

export function Money({
  uah,
  locale,
  eurRate,
}: {
  uah: number;
  locale: string;
  eurRate: number | null;
}) {
  return (
    <span>
      <span className="tabular-nums">{formatUah(uah, locale)}</span>
      {eurRate ? (
        <span className="ml-2 text-muted tabular-nums">≈ {formatEur(uah, eurRate, locale)}</span>
      ) : null}
    </span>
  );
}
