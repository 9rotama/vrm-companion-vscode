import { Bolt } from "lucide-react";
import { IconButton } from "../ui/icon-button";
import Slider from "../ui/slider";
import { SettingsValues } from "./values";
import { Checkbox } from "../ui/checkbox";
import { Drawer } from "../ui/drawer";

type Props = {
  values: SettingsValues;
  onChange: (next: SettingsValues) => void;
};

export function SettingsDialog({ values, onChange }: Props) {
  return (
    <Drawer
      renderTrigger={(props) => (
        <IconButton {...props}>
          <Bolt className="size-4" />
        </IconButton>
      )}
      title={
        <div className="flex flex-row items-center gap-1">
          <Bolt className="text-popover-fg-muted size-4" />
          <span>settings</span>
        </div>
      }
      description="adjust the camera and avatar settings"
    >
      <div className="mt-3">
        <div className="text-popover-fg mb-1 font-bold">camera</div>
        <div className="flex flex-row items-center justify-between gap-2">
          <label>height</label>
          <Slider
            className="w-24"
            defaultValue={0.4}
            min={0.2}
            max={2}
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
            className="w-24"
            min={0.2}
            max={2}
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
      <div className="mt-3">
        <div className="text-popover-fg mb-1 font-bold">blink</div>
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
    </Drawer>
  );
}
