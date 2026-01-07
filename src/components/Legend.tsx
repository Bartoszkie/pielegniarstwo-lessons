export function Legend() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mt-6 p-5 bg-bg-secondary rounded-[12px] border border-border">
      <div className="flex items-center gap-2.5 text-sm text-text-secondary">
        <div className="w-3.5 h-3.5 rounded event-podstawy" />
        <span>Podstawy pielęgniarstwa</span>
      </div>
      <div className="flex items-center gap-2.5 text-sm text-text-secondary">
        <div className="w-3.5 h-3.5 rounded event-badanie" />
        <span>Badanie fizykalne</span>
      </div>
    </div>
  );
}
