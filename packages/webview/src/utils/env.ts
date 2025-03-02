import { z } from "zod";

const envSchema = z.object({
  VITE_DEV_VRM: z.string().optional(),
});

export const env = envSchema.parse(import.meta.env);
