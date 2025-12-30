import { Wallpaper } from "lucide-react";
import { IconButton } from "../ui/icon-button";
import { BackgroundButton } from "./background-button";
import { Drawer } from "../ui/drawer";
import { Background } from "../../utils/use-backgrounds";

type Props = {
  backgrounds: Background[];
  currentBackgroundId: string;
  onChange: (next: string) => void;
};

export function BackgroundsDialog({
  backgrounds,
  currentBackgroundId,
  onChange,
}: Props) {
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
          {backgrounds.map((bg) => (
            <BackgroundButton
              key={bg.id}
              bg={bg}
              isSelected={currentBackgroundId === bg.id}
              onClick={() => {
                onChange(bg.id);
              }}
            />
          ))}
        </div>
      </div>
    </Drawer>
  );
}
