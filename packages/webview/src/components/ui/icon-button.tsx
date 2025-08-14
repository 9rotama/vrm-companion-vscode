import { cn } from "../../lib/utils";

export function IconButton({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button">) {
  return (
    <button
      className={cn(
        "bg-popover-bg/50 border-popover-border hover:bg-popover-bg-hover/50 text-popover-fg/90 rounded-full border p-1",
        className,
      )}
      {...props}
    />
  );
}
