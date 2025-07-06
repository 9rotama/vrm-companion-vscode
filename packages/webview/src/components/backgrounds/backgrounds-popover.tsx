import { Popover } from "@base-ui-components/react";
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

export function BackgroundsPopover({ bgs, currIdx, onChange }: Props) {
  return (
    <Popover.Root>
      <Popover.Trigger>
        <IconButton>
          <Palette className="size-4 text-white/75" />
        </IconButton>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={4}>
          <Popover.Popup className="border-popover-border bg-popover-bg text-popover-fg max-w-56 rounded-md border p-2 backdrop-blur">
            <Popover.Title className="font-bold">backgrounds</Popover.Title>
            <Popover.Description className="text-popover-fg-muted text-xs">
              set the background
            </Popover.Description>
            <Separator className="my-2 h-[1px] bg-popover-border" />
            <div className="mt-2">
              <div className="text-popover-fg-muted font-bold">2D</div>
              <div className="mt-2 grid grid-cols-4 gap-1">
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
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
