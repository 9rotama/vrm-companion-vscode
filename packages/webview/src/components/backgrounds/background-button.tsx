import { clsx } from "clsx";
import { Ban } from "lucide-react";

type Props = {
  imgUrl?: string;
  onClick: () => void;
  active?: boolean;
};

export default function BackgroundButton({ imgUrl, onClick, active }: Props) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-8 h-8 rounded-full bg-white/10 overflow-clip",
        active || "border border-white/20 hover:border-white/40",
        active && "border-2 border-teal-400",
      )}
    >
      {imgUrl ? (
        <img src={imgUrl} className="object-fill size-full" />
      ) : (
        <div className="grid place-items-center text-gray-500">
          <Ban />
        </div>
      )}
    </button>
  );
}
