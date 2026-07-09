import Badge from "../ui/Badge";
import { STATUS_META } from "../../utils/status";

export default function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.moderate;
  return (
    <Badge tone={meta.tone}>
      <span>{meta.emoji}</span>
      {meta.label}
    </Badge>
  );
}