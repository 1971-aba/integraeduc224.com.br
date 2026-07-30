export function PresencaBadge({ percentual }: { percentual: number }) {
  const tone =
    percentual >= 75
      ? "bg-green-100 text-green-800"
      : percentual >= 50
        ? "bg-amber-100 text-amber-800"
        : "bg-red-100 text-red-800";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {percentual}%
    </span>
  );
}
