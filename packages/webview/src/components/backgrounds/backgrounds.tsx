import { Popover, Separator } from "@base-ui-components/react";
import { Palette } from "lucide-react";
import { IconButton } from "../icon-button";
import BackgroundButton from "./background-button";
import { Bg } from "../../models/message";

type Props = {
  bgs: Bg[];
  currIdx: number | undefined;
  onChange: (next: number) => void;
};

export function Backgrounds({ bgs, currIdx, onChange }: Props) {
  return (
    <Popover.Root>
      <Popover.Trigger>
        <IconButton>
          <Palette className="text-white/75 size-4" />
        </IconButton>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={4}>
          <Popover.Popup className="max-w-56 border border-white/20 bg-zinc-900/50 text-white rounded-md p-2 backdrop-blur">
            <Popover.Title className="font-bold ">backgrounds</Popover.Title>
            <Popover.Description className="text-xs text-white/50">
              set the background
            </Popover.Description>
            <Separator className="my-2 h-[1px] bg-white/20" />
            <div className="mt-2">
              <div className="text-white/50 font-bold">2D</div>
              <div className="grid grid-cols-4 gap-1 mt-2">
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
