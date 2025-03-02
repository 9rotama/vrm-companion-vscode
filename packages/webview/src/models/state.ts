import { z } from "zod";

export const stateSchema = z
  .object({
    camera: z.string().optional(),
  })
  .optional();

export type State = z.infer<typeof stateSchema>;
