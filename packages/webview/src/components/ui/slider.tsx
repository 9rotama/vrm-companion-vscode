import { Slider as BSlider } from "@base-ui-components/react/slider";

export default function Slider(props: BSlider.Root.Props) {
  return (
    <BSlider.Root {...props}>
      <BSlider.Control className="w-full p-0.5">
        <BSlider.Track className="h-1 rounded-full bg-popover-translucent">
          <BSlider.Indicator className="bg-popover-fg-muted rounded-full" />
          <BSlider.Thumb className="bg-popover-fg size-3 rounded-full" />
        </BSlider.Track>
      </BSlider.Control>
    </BSlider.Root>
  );
}
