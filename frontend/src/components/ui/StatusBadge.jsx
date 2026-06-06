const config = {
  OPERATIONAL: {
    border: "border-primary",
    text: "text-primary",
    bg: "bg-primary/15",
    label: "Operational",
  },
  DEGRADED: {
    border: "border-warning",
    text: "text-warning",
    bg: "bg-warning/15",
    label: "Degraded",
  },
  DOWN: {
    border: "border-error",
    text: "text-error",
    bg: "bg-error/15",
    label: "Down",
  },
};

export default function StatusBadge({ status }) {
  const s = config[status] || config.OPERATIONAL;
  return (
    <span
      className={`px-2 py-1 rounded-[2px] ${s.bg} border ${s.border} ${s.text} font-mono text-[10px] uppercase`}
    >
      {s.label}
    </span>
  );
}
