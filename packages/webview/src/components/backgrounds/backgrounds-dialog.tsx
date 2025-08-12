import { Dialog } from "@base-ui-components/react";
import { Palette } from "lucide-react";
import { IconButton } from "../ui/icon-button";
import { Separator } from "../ui/separator";
import BackgroundButton from "./background-button";
import { Bg } from "../../models/message";

type Props = {
  bgs: Bg[];
  currIdx: number | undefined;
  onChange: (next: number) => void;
};

export function BackgroundsDialog({ bgs, currIdx, onChange }: Props) {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <IconButton>
          <Palette className="size-4 text-white/75" />
        </IconButton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0" />
        <Dialog.Popup className="border-popover-border bg-popover-bg text-popover-fg fixed inset-x-0 bottom-0 max-h-1/2 w-full overflow-y-scroll border-t p-2 backdrop-blur-xs">
          <Dialog.Title className="font-bold">backgrounds</Dialog.Title>
          <Dialog.Description className="text-popover-fg-muted text-xs">
            set the background
          </Dialog.Description>
          <Separator className="bg-popover-border my-2 h-[1px]" />
          <div className="mt-2">
            <div className="text-popover-fg-muted font-bold">2D</div>
            <div className="mt-2 flex flex-row gap-2">
              {bgs.map((v) => (
                <BackgroundButton
                  key={v.id}
                  bg={v}
                  active={currIdx === bgs.indexOf(v)}
                  onClick={() => {
                    onChange(bgs.indexOf(v));
                  }}
                />
              ))}
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
