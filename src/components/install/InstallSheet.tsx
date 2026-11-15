import * as Dialog from '@radix-ui/react-dialog';
import { ReactNode } from 'react';
import { toast } from 'sonner';
import { useApp } from '../../app/AppContext';
import { InstallState } from '../../utils/install';
import { Sheet } from '../Dialogs';
import { Copy, ExternalLink, MoreVertical, Share } from '../ui/icons';

const GUIDE_URL = 'https://github.com/Bartoszkie/pielegniarstwo-lessons/blob/main/docs/1-instalacja.md';
const APP_URL = `${window.location.origin}${import.meta.env.BASE_URL}`;
/** Android hands this link to Chrome itself, out of the in-app browser */
const CHROME_INTENT = `intent://${window.location.host}${import.meta.env.BASE_URL}#Intent;scheme=https;package=com.android.chrome;end`;

const B = ({ children }: { children: ReactNode }) => <span className="font-semibold text-ink">{children}</span>;
const Inline = ({ children }: { children: ReactNode }) => (
  <span className="mx-0.5 inline-grid h-6 min-w-[24px] place-items-center rounded-md bg-surface-2 px-1 align-middle text-ink">{children}</span>
);

interface Guide {
  title: string;
  subtitle: string;
  steps: ReactNode[];
  /** Section of the photo guide on GitHub */
  anchor?: string;
}

function guideFor(install: InstallState): Guide {
  const lastStep = <>Otwieraj plan z ikony <B>Plan Zajęć</B> na ekranie głównym, nie z przeglądarki.</>;
  switch (install.guide) {
    case 'ios-safari':
    case 'ios-other':
      return {
        title: 'Dodaj do ekranu początkowego',
        subtitle: 'Na iPhonie aplikację dodaje się z menu Udostępnij.',
        anchor: '#iphone-safari-lub-chrome',
        steps: [
          install.guide === 'ios-safari'
            ? <>Stuknij <B>Udostępnij</B> <Inline><Share size={15} /></Inline> na dolnym pasku. W nowszych iOS najpierw stuknij <B>⋯</B> obok paska adresu.</>
            : <>Stuknij <B>Udostępnij</B> <Inline><Share size={15} /></Inline> w pasku adresu, na górze ekranu.</>,
          <>Wybierz <B>Dodaj do ekranu początkowego</B>. Jeśli jej nie widać, stuknij <B>Więcej</B>.</>,
          <>Zostaw włączone <B>Otwórz jako aplikację internetową</B> i stuknij <B>Dodaj</B>.</>,
          lastStep,
        ],
      };
    case 'android':
      return {
        title: 'Zainstaluj aplikację',
        subtitle: 'W Chrome zajmie to kilka sekund.',
        anchor: '#android-chrome',
        steps: [
          <>Stuknij menu <Inline><MoreVertical size={15} /></Inline> w prawym górnym rogu przeglądarki.</>,
          <>Wybierz <B>Zainstaluj aplikację</B> lub <B>Dodaj do ekranu głównego</B>.</>,
          <>Potwierdź przyciskiem <B>Zainstaluj</B> (lub <B>Dodaj</B>).</>,
          lastStep,
        ],
      };
    case 'in-app': {
      const browser = install.isAndroid ? 'Chrome' : 'Safari';
      const where = install.inAppName ?? 'W tej aplikacji';
      return {
        title: 'Otwórz w przeglądarce',
        subtitle: `${where.charAt(0).toUpperCase()}${where.slice(1)} nie da się zainstalować aplikacji. Otwórz plan w ${browser}, a tam go zainstalujesz.`,
        steps: [
          <>Stuknij <B>⋯</B> lub <Inline><MoreVertical size={15} /></Inline> w rogu ekranu.</>,
          <>Wybierz <B>Otwórz w przeglądarce</B> (albo <B>Otwórz w {browser}</B>).</>,
          <>W {browser} u góry pojawi się <B>Zainstaluj Plan Zajęć</B>. Stuknij i gotowe.</>,
        ],
      };
    }
    default:
      return {
        title: 'Zainstaluj aplikację',
        subtitle: 'Na komputerze działa w Chrome, Edge i Safari.',
        steps: [
          <>W Chrome lub Edge kliknij ikonę <B>Zainstaluj</B> na końcu paska adresu albo znajdź ją w menu <Inline><MoreVertical size={15} /></Inline>.</>,
          <>W Safari na Macu wybierz <B>Plik → Dodaj do Docka</B>.</>,
          <>Aplikacja otworzy się we własnym oknie, z ikoną w Docku lub menu Start.</>,
        ],
      };
  }
}

async function copyLink(browser: string) {
  try {
    await navigator.clipboard.writeText(APP_URL);
    toast.success(`Skopiowano link. Wklej go w pasku adresu ${browser}.`);
  } catch {
    toast.message(`Wpisz w ${browser}: ${APP_URL.replace(/^https?:\/\//, '')}`);
  }
}

/** The install steps for the browser the app is open in (where it has no prompt to open instead). */
export function InstallSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { install } = useApp();
  const guide = guideFor(install);
  const inApp = install.guide === 'in-app';
  const browser = install.isAndroid ? 'Chrome' : 'Safari';

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={guide.title} subtitle={guide.subtitle}>
      <ol className="flex flex-col gap-4">
        {guide.steps.map((step, index) => (
          <li key={index} className="grid grid-cols-[28px_minmax(0,1fr)] gap-x-3">
            <span className="pressed grid h-7 w-7 place-items-center rounded-full tabular-nums text-[13px] font-semibold">{index + 1}</span>
            <span className="pt-0.5 text-sm leading-6 text-ink-2">{step}</span>
          </li>
        ))}
      </ol>

      {inApp ? (
        <div className="mt-5 flex flex-col gap-2.5">
          {install.isAndroid && (
            <a href={CHROME_INTENT} className="flex h-12 items-center justify-center gap-2 rounded-[14px] bg-ink text-[15px] font-semibold text-bg">
              <ExternalLink size={17} />
              Otwórz w Chrome
            </a>
          )}
          <button type="button" onClick={() => void copyLink(browser)} className="raised flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold">
            <Copy size={16} />
            Kopiuj link do aplikacji
          </button>
        </div>
      ) : (
        <a
          href={`${GUIDE_URL}${guide.anchor ?? ''}`}
          target="_blank"
          rel="noopener noreferrer"
          className="raised mt-5 flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold"
        >
          Instrukcja ze zdjęciami
          <ExternalLink size={16} />
        </a>
      )}
      <Dialog.Close className={`mt-2.5 h-12 w-full rounded-[14px] text-[15px] font-semibold ${inApp && install.isAndroid ? 'raised' : 'bg-ink text-bg'}`}>
        Rozumiem
      </Dialog.Close>
    </Sheet>
  );
}
