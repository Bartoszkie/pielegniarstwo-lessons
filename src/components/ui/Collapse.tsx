/**
 * Animates its content open and closed (height and fade). The content stays mounted,
 * hidden from focus and screen readers while closed.
 */
export function Collapse({ open, id, children }: { open: boolean; id?: string; children: React.ReactNode }) {
  return (
    <div
      id={id}
      inert={!open}
      aria-hidden={!open}
      className={`grid shrink-0 transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      }`}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}
