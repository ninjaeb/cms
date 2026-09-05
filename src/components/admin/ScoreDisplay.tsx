import type { ChecklistItem } from "@/lib/seo";

export function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-green-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
      <div className={`h-full ${color}`} style={{ width: `${score}%` }} />
    </div>
  );
}

export function ChecklistList({ items }: { items: ChecklistItem[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="flex gap-2 text-sm">
          <span className={item.passed ? "text-green-600" : "text-neutral-300"}>
            {item.passed ? "✓" : "○"}
          </span>
          <div>
            <p className={item.passed ? "text-neutral-700" : "text-neutral-500"}>{item.label}</p>
            <p className="text-xs text-neutral-400">{item.hint}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
