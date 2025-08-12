import { Separator as BaseSeparator } from "@base-ui-components/react";
import { cn } from "../../lib/utils";

type Props = {
  className?: string;
};

export function Separator({ className }: Props) {
  return <BaseSeparator className={cn("my-2 h-[1px] bg-popover-border", className)} />;
}