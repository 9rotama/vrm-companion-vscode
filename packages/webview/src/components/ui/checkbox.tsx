import { Checkbox as BCheckbox } from "@base-ui-components/react/checkbox";
import clsx from "clsx";
import { Check } from "lucide-react";

export function Checkbox(props: BCheckbox.Root.Props) {
  return (
    <BCheckbox.Root
      {...props}
      className={clsx(
        "size-4 grid place-items-center rounded-sm border border-white/20 bg-white/5 text-white disabled:cursor-not-allowed disabled:opacity-50",
        "data-[checked]:bg-white data-[checked]:text-zinc-900",
        props.className,
      )}
    >
      <BCheckbox.Indicator>
        <Check className="size-3" />
      </BCheckbox.Indicator>
    </BCheckbox.Root>
  );
}
