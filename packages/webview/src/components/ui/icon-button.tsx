import { cn } from "../../lib/utils";

export function IconButton({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button">) {
  return (
    <button
      className={cn(
        "bg-popover-bg border-popover-border hover:bg-popover-bg rounded-full border p-1",
        className,
      )}
      {...props}
    />
  );
}
