import { Checkbox as BCheckbox } from "@base-ui-components/react/checkbox";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

export function Checkbox(props: BCheckbox.Root.Props) {
  return (
    <BCheckbox.Root
      {...props}
      className={cn(
        "border-popover-border bg-popover-bg text-popover-accent grid size-4 place-items-center rounded-sm border disabled:cursor-not-allowed disabled:opacity-50",
        "data-[checked]:bg-popover-accent data-[checked]:text-popover-bg",
        props.className,
      )}
    >
      <BCheckbox.Indicator>
        <Check className="size-3" strokeWidth={4} />
      </BCheckbox.Indicator>
    </BCheckbox.Root>
  );
}
