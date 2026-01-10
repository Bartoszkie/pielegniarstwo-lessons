import { useEffect } from 'react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    number: 1,
    title: 'Pobierz swój plan zajęć',
    description: 'Pobierz plik Excel z planem zajęć ze strony uczelni',
    gradient: 'from-blue-500 to-cyan-500',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
  {
    number: 2,
    title: 'Prześlij plik',
    description: 'Kliknij zielony przycisk "Prześlij nowy plan zajęć" i wybierz pobrany plik',
    gradient: 'from-emerald-500 to-green-500',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    ),
  },
  {
    number: 3,
    title: 'Gotowe!',
    description: 'Wybierz swoją grupę w panelu po prawej i kliknij w dzień zajęciowy po szczegóły',
    gradient: 'from-purple-500 to-pink-500',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-bg-card rounded-[24px] border border-border max-w-[480px] w-full max-h-[80vh] overflow-y-auto shadow-[0_25px_80px_rgba(0,0,0,0.5)] modal-animate">
        {/* Modal Header */}
        <div className="p-6 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Jak to działa?</h2>
            <p className="text-sm text-text-muted mt-1">3 proste kroki</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 border-none bg-bg-secondary text-text-muted rounded-xl cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-bg-hover hover:text-text-primary"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-6">
          <div className="space-y-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative overflow-hidden rounded-2xl bg-bg-secondary border border-border p-5"
              >
                {/* Gradient accent line */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${step.gradient}`} />

                <div className="flex gap-4 items-start pl-3">
                  {/* Number badge with gradient */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white shadow-lg`}>
                    {step.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wider bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`}>
                        Krok {step.number}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-text-primary mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Help link */}
          <a
            href="https://github.com/Bartoszkie/pielegniarstwo-lessons/blob/main/README.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 mt-5 py-3 px-4 text-sm font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 hover:text-blue-300 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Szczegółowa instrukcja na GitHub
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60">
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </a>

          {/* Footer button */}
          <button
            onClick={onClose}
            className="w-full mt-3 py-3 px-4 bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
          >
            Rozumiem!
          </button>
        </div>
      </div>
    </div>
  );
}
