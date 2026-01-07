import { useEffect } from 'react';
import { ScheduleDay } from '../types';
import { parseDescription } from '../utils/eventUtils';
import { getGroupColor } from '../constants/groupColors';
import { mergeClasses } from '../utils/classMerger';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ScheduleDay | null;
}

export function EventModal({ isOpen, onClose, data }: EventModalProps) {
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

  if (!isOpen || !data) return null;

  const date = new Date(data.date);
  const formattedDate = date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-bg-card rounded-[20px] border border-border max-w-[500px] w-full max-h-[80vh] overflow-y-auto shadow-[0_25px_80px_rgba(0,0,0,0.5)] modal-animate">
        {/* Modal Header */}
        <div className="p-6 border-b border-border flex justify-between items-start">
          <div>
            <div className="text-xl font-bold text-text-primary">{formattedDate}</div>
            <div className="text-sm text-text-muted mt-1 capitalize">{data.day}</div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 border-none bg-bg-secondary text-text-muted rounded-lg cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-bg-hover hover:text-text-primary"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {mergeClasses(data.classes).map((mergedClass, index) => {
            const parsed = parseDescription(mergedClass.description);

            return (
              <div
                key={index}
                className="p-5 bg-bg-secondary rounded-xl border border-border mb-4 last:mb-0"
              >
                <div className="flex items-center justify-between mb-3 gap-2">
                  <div className="font-mono text-sm text-accent-secondary font-medium flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {mergedClass.start_time} - {mergedClass.end_time}
                  </div>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {mergedClass.groups.sort().map(group => {
                      const groupColor = getGroupColor(group);
                      return (
                        <span
                          key={group}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold"
                          style={{
                            background: groupColor.backgroundGradient,
                            color: groupColor.text
                          }}
                        >
                          {group}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="text-base font-semibold text-text-primary mb-2 leading-relaxed">
                  {parsed.title}
                </div>
                <div className="text-sm text-text-secondary leading-relaxed">
                  {parsed.instructor && <div>{parsed.instructor}</div>}
                  {parsed.notes && (
                    <div className="text-event-secondary mt-2">{parsed.notes}</div>
                  )}
                </div>
                {parsed.location && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border text-text-muted text-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {parsed.location}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
