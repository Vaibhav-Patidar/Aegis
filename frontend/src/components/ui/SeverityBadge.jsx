const config = {
  CRITICAL: {
    border: "border-error",
    text: "text-error",
    bg: "bg-error/15",
    label: "Critical",
  },
  HIGH: {
    border: "border-warning",
    text: "text-warning",
    bg: "bg-warning/15",
    label: "High",
  },
  MEDIUM: {
    border: "border-primary",
    text: "text-primary",
    bg: "bg-primary/15",
    label: "Medium",
  },
  LOW: {
    border: "border-on-surface-variant",
    text: "text-on-surface-variant",
    bg: "bg-on-surface-variant/15",
    label: "Low",
  },
};

export default function SeverityBadge({ severity }) {
  const s = config[severity] || config.LOW;
  return (
    <span
      className={`px-2 py-0.5 rounded-[2px] ${s.bg} border ${s.border} ${s.text} font-mono text-[10px] uppercase`}
    >
      {s.label}
    </span>
  );
}
