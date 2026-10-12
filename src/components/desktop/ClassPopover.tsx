import * as Popover from '@radix-ui/react-popover';
import { ClassBlock } from '../../utils/blocks';
import { BlockDetails } from './BlockDetails';

interface ClassPopoverProps {
  block: ClassBlock;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Open to the left, for blocks near the right edge */
  flip: boolean;
  /** The block's button */
  children: React.ReactNode;
}

/** Class details next to a block in the week or month grid. */
export function ClassPopover({ block, open, onOpenChange, flip, children }: ClassPopoverProps) {
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side={flip ? 'left' : 'right'}
          align="start"
          sideOffset={10}
          collisionPadding={16}
          // Opening another class closes this one. Focus is already in the new popover then;
          // moving it back to this block would close the new one straight away
          onCloseAutoFocus={e => {
            if (document.activeElement && document.activeElement !== document.body) e.preventDefault();
          }}
          className="z-50 animate-pop-in rounded-[14px] border border-line bg-surface p-4 shadow-pop outline-none"
        >
          <BlockDetails block={block} onClose={() => onOpenChange(false)} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
