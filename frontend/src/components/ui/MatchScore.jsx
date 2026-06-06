export default function MatchScore({ score }) {
  const pct = Math.round(score * 100);
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 bg-outline-variant rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-data-mono text-primary whitespace-nowrap">
        {pct}%
      </span>
    </div>
  );
}
