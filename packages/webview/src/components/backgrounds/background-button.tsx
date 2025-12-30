import { clsx } from "clsx";
import { Ban, Check } from "lucide-react";
import { Bg } from "../../models/message";
import { emptyBg } from "../../utils/use-backgrounds";

type Props = {
  bg: Bg;
  onClick: () => void;
  isSelected?: boolean;
};

export function BackgroundButton({ bg, onClick, isSelected }: Props) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={clsx(
          "bg-popover-bg relative h-9 w-9 overflow-clip rounded-full",
          "border-popover-border border-2",
          isSelected && "border-popover-fg-accent border-2",
        )}
      >
        {bg.id === emptyBg.id ? (
          <div className="text-popover-fg-muted grid place-items-center">
            <Ban />
          </div>
        ) : (
          <img src={bg.preview} className="size-full object-fill" />
        )}
      </button>
      {isSelected && (
        <div className="bg-popover-fg-accent absolute top-0 left-0 grid size-4 place-items-center rounded-full">
          <Check className="text-popover-fg m-auto size-3" strokeWidth={4} />
        </div>
      )}
    </div>
  );
}
