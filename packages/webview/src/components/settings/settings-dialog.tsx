import { Dialog } from "@base-ui-components/react";
import { Bolt } from "lucide-react";
import { IconButton } from "../ui/icon-button";
import Slider from "../ui/slider";
import { SettingsValues } from "./values";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";

type Props = {
  values: SettingsValues;
  onChange: (next: SettingsValues) => void;
};

export function SettingsDialog({ values, onChange }: Props) {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <IconButton>
          <Bolt className="size-4 text-white/75" />
        </IconButton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0" />
        <Dialog.Popup className="border-popover-border bg-popover-bg text-popover-fg fixed inset-x-0 bottom-0 max-h-1/2 w-full overflow-y-scroll border-t p-2 backdrop-blur-xs">
          <Dialog.Title className="font-bold">settings</Dialog.Title>
          <Dialog.Description className="text-popover-fg-muted text-xs">
            adjust the camera and avatar settings
          </Dialog.Description>
          <Separator />
          <div className="mt-2">
            <div className="text-popover-fg-muted font-bold">camera</div>
            <div className="flex flex-row items-center justify-between gap-2">
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
                      position: {
                        ...values.camera.position,
                        y: v as number,
                      },
                    },
                  });
                }}
              />
            </div>
            <div className="flex flex-row items-center justify-between gap-2">
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
                      position: {
                        ...values.camera.position,
                        z: v as number,
                      },
                    },
                  });
                }}
              />
            </div>
          </div>
          <Separator className="my-2 h-[1px] bg-white/20" />
          <div className="mt-2">
            <div className="font-bold text-white/50">blink</div>
            <div className="flex flex-row items-center justify-between gap-2">
              <label>happy</label>
              <Checkbox
                checked={values.blink.happy}
                value={values.camera.position.y}
                onCheckedChange={(v) => {
                  onChange({
                    ...values,
                    blink: {
                      ...values.blink,
                      happy: v,
                    },
                  });
                }}
              />
            </div>
            <div className="flex flex-row items-center justify-between gap-2">
              <label>neutral</label>
              <Checkbox
                checked={values.blink.neutral}
                value={values.camera.position.y}
                onCheckedChange={(v) => {
                  onChange({
                    ...values,
                    blink: {
                      ...values.blink,
                      neutral: v,
                    },
                  });
                }}
              />
            </div>
            <div className="flex flex-row items-center justify-between gap-2">
              <label>angry</label>
              <Checkbox
                checked={values.blink.angry}
                value={values.camera.position.y}
                onCheckedChange={(v) => {
                  onChange({
                    ...values,
                    blink: {
                      ...values.blink,
                      angry: v,
                    },
                  });
                }}
              />
            </div>
            <div className="flex flex-row items-center justify-between gap-2">
              <label>sad</label>
              <Checkbox
                checked={values.blink.sad}
                value={values.camera.position.y}
                onCheckedChange={(v) => {
                  onChange({
                    ...values,
                    blink: {
                      ...values.blink,
                      sad: v,
                    },
                  });
                }}
              />
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
