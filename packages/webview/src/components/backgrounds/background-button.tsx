import { clsx } from "clsx";
import { Ban } from "lucide-react";
import { Bg } from "../../models/message";
import { emptyBg } from "../../utils/use-backgrounds";

type Props = {
  bg: Bg;
  onClick: () => void;
  active?: boolean;
};

export default function BackgroundButton({ bg, onClick, active }: Props) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "bg-popover-bg h-8 w-8 overflow-clip rounded-full",
        active || "ring-popover-border ring",
        active && "ring-popover-fg-accent ring-2",
      )}
    >
      {bg.id !== emptyBg.id ? (
        <img src={bg.preview} className="size-full object-fill" />
      ) : (
        <div className="text-popover-fg-muted grid place-items-center">
          <Ban />
        </div>
      )}
    </button>
  );
}
