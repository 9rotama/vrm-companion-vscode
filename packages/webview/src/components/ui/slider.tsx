import { Slider as BSlider } from "@base-ui-components/react/slider";

export default function Slider(props: BSlider.Root.Props) {
  return (
    <BSlider.Root {...props}>
      <BSlider.Control className="w-full p-0.5">
        <BSlider.Track className="h-1 rounded-full bg-popover-fg/50">
          <BSlider.Indicator className="rounded-full bg-popover-fg-muted" />
          <BSlider.Thumb className="size-3 rounded-full bg-popover-fg" />
        </BSlider.Track>
      </BSlider.Control>
    </BSlider.Root>
  );
}
