interface StatCardProps {
  value: string | number;
  label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="bg-bg-secondary border border-border rounded-[12px] p-4 sm:p-5">
      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-1">{value}</div>
      <div className="text-xs sm:text-sm text-text-muted">{label}</div>
    </div>
  );
}
