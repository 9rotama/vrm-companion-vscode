import { Separator as BaseSeparator } from "@base-ui-components/react";
import { cn } from "../../utils/cn";

type Props = {
  className?: string;
};

export function Separator({ className }: Props) {
  return <BaseSeparator className={cn("bg-popover-border", className)} />;
}
