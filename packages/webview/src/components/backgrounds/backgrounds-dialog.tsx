import { Wallpaper } from "lucide-react";
import { IconButton } from "../ui/icon-button";
import { BackgroundButton } from "./background-button";
import { Bg } from "../../models/message";
import { Drawer } from "../ui/drawer";

type Props = {
  bgs: Bg[];
  currIdx: number | undefined;
  onChange: (next: number) => void;
};

export function BackgroundsDialog({ bgs, currIdx, onChange }: Props) {
  return (
    <Drawer
      renderTrigger={(props) => (
        <IconButton {...props}>
          <Wallpaper className="size-4" />
        </IconButton>
      )}
      title={
        <div className="flex flex-row items-center gap-1">
          <Wallpaper className="text-popover-fg-muted size-4" />
          <span>backgrounds</span>
        </div>
      }
      description="set the background"
    >
      <div className="mt-3">
        <div className="text-popover-fg font-bold">2D</div>
        <div className="mt-2 flex flex-row gap-1">
          {bgs.map((v) => (
            <BackgroundButton
              key={v.id}
              bg={v}
              isSelected={currIdx === bgs.indexOf(v)}
              onClick={() => {
                onChange(bgs.indexOf(v));
              }}
            />
          ))}
        </div>
      </div>
    </Drawer>
  );
}
