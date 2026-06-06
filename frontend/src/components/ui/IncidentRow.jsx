import SeverityBadge from "./SeverityBadge";

export default function IncidentRow({ incident, onClick }) {
  const formatTime = (mins) => `${mins}m`;
  const formatTimestamp = (ts) => {
    if (!ts) return "—";
    const d = new Date(ts);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <tr
      className="border-b border-outline-variant hover:bg-surface-container transition-colors group cursor-pointer"
      onClick={() => onClick && onClick(incident)}
    >
      <td className="px-4 py-3 text-primary group-hover:underline font-mono text-data-mono">
        {incident.id}
      </td>
      <td className="px-4 py-3 text-on-surface font-mono text-data-mono">
        {incident.service_name}
      </td>
      <td className="px-4 py-3">
        <SeverityBadge severity={incident.severity} />
      </td>
      <td className="px-4 py-3 text-on-surface-variant font-mono text-data-mono">
        {incident.time_to_resolve_mins
          ? formatTime(incident.time_to_resolve_mins)
          : "—"}
      </td>
      <td className="px-4 py-3 text-on-surface-variant font-mono text-data-mono">
        {formatTimestamp(incident.timestamp)}
      </td>
    </tr>
  );
}
