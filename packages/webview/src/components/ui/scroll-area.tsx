import { ScrollArea as BScrollArea } from "@base-ui-components/react/scroll-area";
import { cn } from "../../lib/utils";

export function ScrollArea(props: BScrollArea.Root.Props) {
  return <BScrollArea.Root {...props}></BScrollArea.Root>;
}

export function ScrollAreaViewport({ className, ...props }: BScrollArea.Viewport.Props) {
  return <BScrollArea.Viewport {...props} className={cn("h-full w-full", className)} />;
}

export function ScrollAreaScrollbar({ className, ...props }: BScrollArea.Scrollbar.Props) {
  return (
    <BScrollArea.Scrollbar
      {...props}
      className={cn(
        "m-2 flex w-1 justify-center rounded bg-gray-200 opacity-0 transition-opacity delay-300 data-[hovering]:opacity-100 data-[hovering]:delay-0 data-[hovering]:duration-75 data-[scrolling]:opacity-100 data-[scrolling]:delay-0 data-[scrolling]:duration-75",
        className,
      )}
    >
      <BScrollArea.Thumb className="bg-popover-fg w-full rounded-full" />
    </BScrollArea.Scrollbar>
  );
}
