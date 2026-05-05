import * as v from "valibot";

export const cameraStateSchema = v.object({
  height: v.optional(v.number(), 1.0),
  depth: v.optional(v.number(), 0.7),
});
export type CameraState = v.InferOutput<typeof cameraStateSchema>;

export const blinkStateSchema = v.object({
  happy: v.optional(v.boolean(), false),
  neutral: v.optional(v.boolean(), false),
  sad: v.optional(v.boolean(), false),
  angry: v.optional(v.boolean(), false),
});
export type BlinkState = v.InferOutput<typeof blinkStateSchema>;

const backgroundStateSchema = v.object({
  id: v.string(),
});

export const stateSchema = v.optional(
  v.object({
    camera: v.optional(cameraStateSchema),
    blink: v.optional(blinkStateSchema),
    background: v.optional(backgroundStateSchema),
  }),
);

export type State = v.InferOutput<typeof stateSchema>;
