/**
 * Which class of a subject this is, e.g. "2 z 4", with a dot per class:
 * the earlier ones grey, this one a dark pill, the later ones hollow.
 */
export function ClassCount({ n, total, className = '' }: { n: number; total: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[7px] ${className}`}>
      {total > 1 && total <= 10 && (
        <span aria-hidden="true" className="flex items-center gap-[3px]">
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={
                i + 1 < n ? 'h-1.5 w-1.5 rounded-full bg-ink-3/70'
                  : i + 1 === n ? 'h-1.5 w-3.5 rounded-full bg-ink'
                    : 'h-1.5 w-1.5 rounded-full border-[1.5px] border-line-strong'
              }
            />
          ))}
        </span>
      )}
      <span className="whitespace-nowrap tabular-nums text-xs font-bold leading-4">
        <span className="sr-only">zajęcia </span>
        {n}
        <span className="font-medium text-ink-2"> z {total}</span>
      </span>
    </span>
  );
}
