/**
 * A date title with day numbers in bold and words in light: "**12–18** października 2026".
 * Without day numbers ("Październik 2026") the first word is bold.
 */
export function DisplayTitle({ text }: { text: string }) {
  const parts = text.split(/\b(\d{1,2}(?:–\d{1,2})?)\b/);
  if (parts.length === 1) {
    const [first, ...rest] = text.split(' ');
    return (
      <>
        <span className="font-bold">{first}</span>
        {rest.length > 0 && <span className="font-light"> {rest.join(' ')}</span>}
      </>
    );
  }
  return (
    <>
      {parts.map((part, i) => part && <span key={i} className={i % 2 ? 'font-bold' : 'font-light'}>{part}</span>)}
    </>
  );
}
