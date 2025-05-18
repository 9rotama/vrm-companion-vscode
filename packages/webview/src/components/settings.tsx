import { Popover, Separator } from "@base-ui-components/react";
import { Bolt } from "lucide-react";
import Slider from "./slider";
import { IconButton } from "./icon-button";

export type CameraSettings = {
  position: { y: number; z: number };
};

type Props = {
  values: { camera: CameraSettings };
  onChange: (next: { camera: CameraSettings }) => void;
};

export function Settings({ values, onChange }: Props) {
  return (
    <Popover.Root>
      <Popover.Trigger>
        <IconButton>
          <Bolt className="text-white/75 size-4" />
        </IconButton>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={4}>
          <Popover.Popup className="max-w-40 border border-white/20 bg-zinc-900/50 text-white rounded-md p-2 backdrop-blur">
            <Popover.Title className="font-bold ">settings</Popover.Title>
            <Popover.Description className="text-xs text-white/50">
              adjust the camera and avatar settings
            </Popover.Description>
            <Separator className="my-2 h-[1px] bg-white/20" />
            <div className="mt-2">
              <div className="text-white/50 font-bold">camera</div>
              <div className="flex flex-row gap-2 items-center justify-between">
                <label>height</label>
                <Slider
                  className="w-16"
                  defaultValue={0.4}
                  min={0.4}
                  max={1.25}
                  step={0.01}
                  value={values.camera.position.y}
                  onValueChange={(v) => {
                    onChange({
                      ...values,
                      camera: {
                        ...values.camera,
                        position: { ...values.camera.position, y: v as number },
                      },
                    });
                  }}
                />
              </div>
              <div className="flex flex-row gap-2 items-center justify-between">
                <label>depth</label>
                <Slider
                  className="w-16"
                  min={0.5}
                  max={1}
                  step={0.01}
                  value={values.camera.position.z}
                  onValueChange={(v) => {
                    onChange({
                      ...values,
                      camera: {
                        ...values.camera,
                        position: { ...values.camera.position, z: v as number },
                      },
                    });
                  }}
                />
              </div>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
