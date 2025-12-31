import { z } from "zod";

export const cameraStateSchema = z.object({
  height: z.number().default(1.0),
  depth: z.number().default(0.7),
});
export type CameraState = z.infer<typeof cameraStateSchema>;

export const blinkStateSchema = z.object({
  happy: z.boolean().default(false),
  neutral: z.boolean().default(false),
  sad: z.boolean().default(false),
  angry: z.boolean().default(false),
});
export type BlinkState = z.infer<typeof blinkStateSchema>;

const backgroundStateSchema = z.object({
  id: z.string(),
});

export const stateSchema = z
  .object({
    camera: cameraStateSchema.optional(),
    blink: blinkStateSchema.optional(),
    background: backgroundStateSchema.optional(),
  })
  .optional();

export type State = z.infer<typeof stateSchema>;
