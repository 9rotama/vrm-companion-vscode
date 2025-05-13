import { z } from "zod";

export const cameraStateSchema = z.object({
  position: z.object({
    y: z.number().default(1.0),
    z: z.number().default(0.7),
  }),
});
export type CameraState = z.infer<typeof cameraStateSchema>;

export const stateSchema = z
  .object({
    camera: cameraStateSchema,
  })
  .optional();

export type State = z.infer<typeof stateSchema>;
