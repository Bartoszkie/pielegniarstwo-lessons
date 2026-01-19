export function Footer() {
  return (
    <footer className="mt-8 sm:mt-12 pt-6 pb-4 selection:bg-white/20">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/20 to-transparent mb-6" />
      <div className="flex flex-col items-center gap-1 text-center text-xs text-white/20">
        <span>Pielęgniarstwo (2025/2026)</span>
        <span>Crafted by: Bartosz Słysz</span>
        <span>Version: {__APP_VERSION__}</span>
      </div>
    </footer>
  );
}
