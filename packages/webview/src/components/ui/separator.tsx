import { Separator as BaseSeparator } from "@base-ui-components/react";
import clsx from "clsx";

type Props = {
  className?: string;
};

export function Separator({ className }: Props) {
  return <BaseSeparator className={clsx("my-2 h-[1px] bg-popover-border", className)} />;
}