import { Dialog } from "@base-ui-components/react";
import { ComponentProps, ReactNode } from "react";
import { Separator } from "./separator";
import { cn } from "../../lib/utils";

type DrawerProps = {
  renderTrigger: ComponentProps<typeof Dialog.Trigger>["render"];
  title: ReactNode;
  titleIcon?: ReactNode;
  description: ReactNode;
  children: ReactNode;
};

export function Drawer({
  renderTrigger,
  title,
  description,
  children,
}: DrawerProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={renderTrigger} />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0" />
        <Dialog.Popup
          className={cn(
            "fixed inset-x-0 bottom-0 max-h-1/2 w-full",
            "border-popover-border bg-popover-bg/80 text-popover-fg overflow-y-scroll rounded-t-xl border-t p-2 backdrop-blur-xs",
          )}
        >
          <Dialog.Title className="text-base font-bold">{title}</Dialog.Title>
          <Dialog.Description className="text-popover-fg-muted text-xs">
            {description}
          </Dialog.Description>
          <Separator className="bg-popover-border my-2 h-px" />
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
