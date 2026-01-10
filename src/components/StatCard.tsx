interface StatCardProps {
  value: string | number;
  label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="bg-bg-secondary border border-border rounded-lg sm:rounded-[12px] p-2 sm:p-4 lg:p-5">
      <div className="text-base sm:text-2xl lg:text-4xl font-bold text-text-primary mb-0.5 sm:mb-1">{value}</div>
      <div className="text-[10px] sm:text-xs lg:text-sm text-text-muted truncate">{label}</div>
    </div>
  );
}
