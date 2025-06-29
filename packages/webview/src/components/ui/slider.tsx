import { Slider as BSlider } from "@base-ui-components/react/slider";

export default function Slider(props: BSlider.Root.Props) {
  return (
    <BSlider.Root {...props}>
      <BSlider.Control className="p-0.5 w-full">
        <BSlider.Track className="bg-white/30 h-1 rounded-full">
          <BSlider.Indicator className="bg-white/70 rounded-full" />
          <BSlider.Thumb className="size-3 rounded-full bg-white" />
        </BSlider.Track>
      </BSlider.Control>
    </BSlider.Root>
  );
}
